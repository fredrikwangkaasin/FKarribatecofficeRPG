using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using System.Net.Http.Headers;
using FKarribatecofficerpg.Api.Models;
using FKarribatecofficerpg.Api.Repositories;
using Arribatec.Nexus.Client.Services;

namespace FKarribatecofficerpg.Api.Controllers;

/// <summary>
/// AI Chat controller for Arribatec Office RPG
/// Provides NPC dialogue, hints, and chat completion using the configured LLM connection
/// </summary>
[Authorize]
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IContextAwareLlmService _llmService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IQuizQuestionRepository _quizRepo;
    private readonly ILogger<ChatController> _logger;

    // System prompts for different game scenarios
    private const string GameMasterPrompt = @"You are an AI game master for 'Arribatec Office RPG', a fun office-themed RPG game. 
The game takes place in a modern tech company where employees fight metaphorical battles against corporate challenges.
Characters include:
- The Intern (player character) - starts weak but can become powerful
- Meeting Master - a boss who traps people in endless meetings
- Email Overlord - a boss who drowns people in emails
- The Micromanager - a boss who watches your every move
- HR Karen - the final boss

Keep responses short, witty, and office-themed. Use corporate jargon humorously.";

    private const string NpcPromptTemplate = @"You are {0}, a {1} in the game 'Arribatec Office RPG'. 
{2}
Respond to the player in character. Keep responses under 100 words. Be helpful but maintain your character's personality.
The player is currently in the {3} zone and is level {4}.
Previously defeated bosses: {5}";

    private const string HintPromptTemplate = @"You are a helpful game hint system for 'Arribatec Office RPG'.
The player is in zone '{0}', level {1}, and has defeated these bosses: {2}.
They are stuck on: {3}

Provide a brief, helpful hint (max 50 words) without spoiling too much. 
Format: A single sentence hint, then optionally a suggested next objective.";

    public ChatController(
        IContextAwareLlmService llmService,
        IHttpClientFactory httpClientFactory,
        IQuizQuestionRepository quizRepo,
        ILogger<ChatController> logger)
    {
        _llmService = llmService;
        _httpClientFactory = httpClientFactory;
        _quizRepo = quizRepo;
        _logger = logger;
    }

    /// <summary>
    /// Get NPC dialogue response
    /// </summary>
    [HttpPost("npc")]
    public async Task<IActionResult> GetNpcDialogue([FromBody] NpcDialogueRequest request)
    {
        try
        {
            var npcPersonality = GetNpcPersonality(request.NpcType);
            var systemPrompt = string.Format(
                NpcPromptTemplate,
                request.NpcName,
                request.NpcType,
                npcPersonality,
                request.CurrentZone ?? "unknown",
                request.PlayerLevel ?? 1,
                request.DefeatedBosses != null ? string.Join(", ", request.DefeatedBosses) : "none"
            );

            var response = await SendChatCompletion(
                systemPrompt,
                request.PlayerMessage,
                maxTokens: 150,
                temperature: 0.8
            );

            return Ok(new NpcDialogueResponse
            {
                NpcName = request.NpcName,
                Dialogue = response,
                HasQuest = request.NpcType == "quest_giver"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate NPC dialogue for {NpcName}", request.NpcName);
            
            // Fallback response
            return Ok(new NpcDialogueResponse
            {
                NpcName = request.NpcName,
                Dialogue = GetFallbackDialogue(request.NpcType),
                HasQuest = false
            });
        }
    }

    /// <summary>
    /// Get a game hint based on player progress
    /// </summary>
    [HttpPost("hint")]
    public async Task<IActionResult> GetGameHint([FromBody] GameHintRequest request)
    {
        try
        {
            var systemPrompt = string.Format(
                HintPromptTemplate,
                request.CurrentZone,
                request.PlayerLevel,
                request.DefeatedBosses.Count > 0 ? string.Join(", ", request.DefeatedBosses) : "none",
                request.StuckOn ?? "general progression"
            );

            var response = await SendChatCompletion(
                systemPrompt,
                "Please give me a hint.",
                maxTokens: 100,
                temperature: 0.6
            );

            return Ok(new GameHintResponse
            {
                Hint = response,
                NextObjective = GetNextObjective(request),
                Relevance = 90
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate game hint");
            
            return Ok(new GameHintResponse
            {
                Hint = GetFallbackHint(request.CurrentZone),
                NextObjective = "Explore your surroundings",
                Relevance = 50
            });
        }
    }

    /// <summary>
    /// General chat completion endpoint
    /// </summary>
    [HttpPost("completion")]
    public async Task<IActionResult> ChatCompletion([FromBody] ChatCompletionRequest request)
    {
        try
        {
            var llmConnection = await _llmService.GetProductLlmConnectionAsync();
            
            if (llmConnection == null)
            {
                _logger.LogWarning("No LLM connection configured for this product");
                return BadRequest(new { error = "No AI connection configured. Please contact an administrator." });
            }

            // Build messages array with system prompt
            var messages = new List<object>();
            
            if (!string.IsNullOrEmpty(request.SystemPrompt))
            {
                messages.Add(new { role = "system", content = request.SystemPrompt });
            }
            else
            {
                messages.Add(new { role = "system", content = GameMasterPrompt });
            }

            foreach (var msg in request.Messages)
            {
                messages.Add(new { role = msg.Role, content = msg.Content });
            }

            var chatRequest = new
            {
                model = llmConnection.DefaultModel ?? "gpt-4",
                messages = messages,
                max_tokens = request.MaxTokens ?? 500,
                temperature = request.Temperature ?? 0.7
            };

            var httpClient = _httpClientFactory.CreateClient();
            var endpoint = BuildEndpoint(llmConnection);
            
            ConfigureHttpClient(httpClient, llmConnection);

            _logger.LogInformation("Sending chat completion to {Endpoint}", endpoint);

            var httpResponse = await httpClient.PostAsJsonAsync(endpoint, chatRequest);
            var responseContent = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError("LLM API returned {StatusCode}: {Response}", httpResponse.StatusCode, responseContent);
                return StatusCode((int)httpResponse.StatusCode, new { error = "AI service temporarily unavailable" });
            }

            // Parse the response
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
            var content = ExtractContent(jsonResponse, llmConnection.Provider);

            return Ok(new ChatCompletionResponse
            {
                Content = content,
                Model = llmConnection.DefaultModel ?? "unknown",
                TokensUsed = ExtractTokensUsed(jsonResponse),
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat completion failed");
            return StatusCode(500, new { error = "An error occurred while processing your request" });
        }
    }

    /// <summary>
    /// Check if AI is available and configured
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetAiStatus()
    {
        try
        {
            var llmConnection = await _llmService.GetProductLlmConnectionAsync();
            
            return Ok(new
            {
                available = llmConnection != null && llmConnection.IsActive,
                provider = llmConnection?.Provider ?? "none",
                model = llmConnection?.DefaultModel ?? "none"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check AI status");
            return Ok(new { available = false, provider = "error", model = "none" });
        }
    }

    /// <summary>
    /// Seed quiz questions into the database (admin endpoint)
    /// </summary>
    [HttpPost("seed-questions")]
    public async Task<IActionResult> SeedQuestions([FromBody] SeedQuestionsRequest? request)
    {
        var count = request?.Count ?? 50;
        var zones = new[] { "lobby", "finance", "hospitality", "research" };
        var zoneTopics = new Dictionary<string, string[]>
        {
            ["lobby"] = new[] { "office etiquette", "workplace safety", "company culture", "first day tips", "coffee breaks" },
            ["finance"] = new[] { "budgets", "spreadsheets", "financial reports", "expense tracking", "quarterly reviews" },
            ["hospitality"] = new[] { "HR policies", "team building", "employee benefits", "vacation requests", "performance reviews" },
            ["research"] = new[] { "programming", "IT support", "software bugs", "technical documentation", "agile methodology" }
        };

        var generated = 0;
        var llmConnection = await _llmService.GetProductLlmConnectionAsync();

        foreach (var zone in zones)
        {
            for (int difficulty = 1; difficulty <= 3; difficulty++)
            {
                var currentCount = await _quizRepo.GetQuestionCountAsync(zone, difficulty);
                var needed = Math.Max(0, (count / zones.Length / 3) - currentCount);

                if (needed == 0) continue;

                _logger.LogInformation("Seeding {Needed} questions for zone {Zone} difficulty {Difficulty}", needed, zone, difficulty);

                for (int i = 0; i < needed; i++)
                {
                    try
                    {
                        QuizQuestionEntity question;

                        if (llmConnection != null && llmConnection.IsActive)
                        {
                            var topics = zoneTopics[zone];
                            var randomTopic = topics[Random.Shared.Next(topics.Length)];
                            question = await GenerateQuestionWithLlmAsync(zone, difficulty, randomTopic, llmConnection);
                        }
                        else
                        {
                            question = GenerateFallbackQuestionEntity(zone, difficulty);
                        }

                        await _quizRepo.AddQuestionAsync(question);
                        generated++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to generate question");
                    }
                }
            }
        }

        // Get final counts
        var counts = await _quizRepo.GetQuestionCountsByZoneAsync();

        return Ok(new
        {
            message = $"Seeded {generated} new questions",
            totalByZone = counts
        });
    }

    private async Task<QuizQuestionEntity> GenerateQuestionWithLlmAsync(string zone, int difficulty, string topic, dynamic llmConnection)
    {
        var prompt = $@"Generate a single trivia question about {topic} for an office RPG game.
Difficulty level: {difficulty}/5 (1=easy, 5=hard)

The question should be fun and office-themed. 

Respond in this exact JSON format only, no other text:
{{
  ""question"": ""The question text"",
  ""answers"": [""Answer A"", ""Answer B"", ""Answer C"", ""Answer D""],
  ""correctIndex"": 0
}}

The correctIndex is 0-3 indicating which answer is correct.";

        var chatRequest = new
        {
            model = llmConnection.DefaultModel ?? "gpt-4",
            messages = new[]
            {
                new { role = "system", content = "You are a quiz question generator for an office RPG game. Always respond with valid JSON only." },
                new { role = "user", content = prompt }
            },
            max_tokens = 300,
            temperature = 0.9
        };

        var httpClient = _httpClientFactory.CreateClient();
        var endpoint = BuildEndpoint(llmConnection);
        ConfigureHttpClient(httpClient, llmConnection);

        var response = await HttpClientJsonExtensions.PostAsJsonAsync(httpClient, endpoint, (object)chatRequest);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        var content = result.GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrEmpty(content))
        {
            return GenerateFallbackQuestionEntity(zone, difficulty);
        }

        // Clean up potential markdown code blocks
        content = content.Trim();
        if (content.StartsWith("```json"))
        {
            content = content.Substring(7);
        }
        else if (content.StartsWith("```"))
        {
            content = content.Substring(3);
        }
        if (content.EndsWith("```"))
        {
            content = content.Substring(0, content.Length - 3);
        }
        content = content.Trim();

        var questionData = JsonSerializer.Deserialize<GeneratedQuestionData>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (questionData == null || questionData.Answers.Count != 4)
        {
            return GenerateFallbackQuestionEntity(zone, difficulty);
        }

        return new QuizQuestionEntity
        {
            Zone = zone,
            Difficulty = difficulty,
            Question = questionData.Question,
            Answer1 = questionData.Answers[0],
            Answer2 = questionData.Answers[1],
            Answer3 = questionData.Answers[2],
            Answer4 = questionData.Answers[3],
            CorrectIndex = Math.Clamp(questionData.CorrectIndex, 0, 3),
            IsActive = true
        };
    }

    private QuizQuestionEntity GenerateFallbackQuestionEntity(string zone, int difficulty)
    {
        var questions = zone switch
        {
            "finance" => new (string q, string a1, string a2, string a3, string a4, int correct)[]
            {
                ("What does ROI stand for?", "Return on Investment", "Run on Ice", "Report on Items", "Rest on Island", 0),
                ("What is a balance sheet?", "Financial statement", "Yoga pose", "Office furniture", "Email type", 0),
                ("What is depreciation?", "Asset value decrease", "Sad employee", "Budget increase", "Coffee break", 0),
                ("What does P&L stand for?", "Profit and Loss", "Paper and Laptop", "Pens and Lights", "Pizza and Lunch", 0),
                ("What is an audit?", "Financial review", "Audio test", "Office party", "Break time", 0)
            },
            "hospitality" => new (string q, string a1, string a2, string a3, string a4, int correct)[]
            {
                ("What does HR stand for?", "Human Resources", "Happy Robots", "Hotel Reservations", "High Rollers", 0),
                ("What is onboarding?", "New employee orientation", "Skateboard trick", "Boat activity", "Gaming term", 0),
                ("What is PTO?", "Paid Time Off", "Please Turn Over", "Pizza To Order", "Print This Out", 0),
                ("What is a 401k?", "Retirement plan", "Office room", "Error code", "Meeting type", 0),
                ("What is a performance review?", "Employee evaluation", "Car inspection", "Movie rating", "Software test", 0)
            },
            "research" => new (string q, string a1, string a2, string a3, string a4, int correct)[]
            {
                ("What does API stand for?", "Application Programming Interface", "Apple Pie Index", "Advanced Pizza Intelligence", "Automated Paper Input", 0),
                ("What is debugging?", "Fixing code errors", "Removing insects", "Bug collection", "Pest control", 0),
                ("What is Git?", "Version control system", "Guitar", "Get it together", "Gift", 0),
                ("What is the cloud?", "Remote servers", "Weather phenomenon", "Fluffy thing", "Cotton candy", 0),
                ("What is agile?", "Development methodology", "Physical ability", "Fast animal", "Quick meeting", 0)
            },
            _ => new (string q, string a1, string a2, string a3, string a4, int correct)[]
            {
                ("What is appropriate office attire?", "Business casual", "Pajamas", "Swimsuit", "Costume", 0),
                ("When should you respond to emails?", "Within 24 hours", "Never", "Next month", "Only on Fridays", 0),
                ("What is a good meeting practice?", "Have an agenda", "Invite everyone", "No prep needed", "Skip it", 0),
                ("How should you handle conflicts?", "Discuss professionally", "Ignore them", "Yell loudly", "Send angry emails", 0),
                ("What is work-life balance?", "Managing personal and work time", "Yoga at desk", "Working 24/7", "Sleeping at work", 0)
            }
        };

        var q = questions[Random.Shared.Next(questions.Length)];
        
        return new QuizQuestionEntity
        {
            Zone = zone,
            Difficulty = difficulty,
            Question = q.q,
            Answer1 = q.a1,
            Answer2 = q.a2,
            Answer3 = q.a3,
            Answer4 = q.a4,
            CorrectIndex = q.correct,
            IsActive = true
        };
    }

    private class GeneratedQuestionData
    {
        public string Question { get; set; } = "";
        public List<string> Answers { get; set; } = new();
        public int CorrectIndex { get; set; }
    }

    /// <summary>
    /// Generate a single battle quiz question for an enemy
    /// Fetches from pre-generated database, falls back to AI generation
    /// </summary>
    [HttpPost("battle-quiz")]
    public async Task<IActionResult> GenerateBattleQuiz([FromBody] BattleQuizRequest request)
    {
        try
        {
            // Get user context for tracking answered questions
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
            var tenantId = User.FindFirst("tenant_id")?.Value 
                ?? User.FindFirst("tenant")?.Value 
                ?? "default";

            // Try to get a pre-generated question from database
            var zone = NormalizeZone(request.EnemyZone);
            var dbQuestion = await _quizRepo.GetRandomUnansweredQuestionAsync(
                tenantId, userId, zone, request.Difficulty);

            QuizQuestion question;
            Guid? questionId = null;

            if (dbQuestion != null)
            {
                _logger.LogDebug("Using database question {QuestionId} for zone {Zone}", dbQuestion.Id, zone);
                question = new QuizQuestion
                {
                    Question = dbQuestion.Question,
                    Answers = new List<string>
                    {
                        dbQuestion.Answer1,
                        dbQuestion.Answer2,
                        dbQuestion.Answer3,
                        dbQuestion.Answer4
                    },
                    CorrectIndex = dbQuestion.CorrectIndex
                };
                questionId = dbQuestion.Id;
            }
            else
            {
                _logger.LogWarning("No database questions available for zone {Zone}, using fallback", zone);
                question = GetFallbackQuestion(zone);
            }
            
            return Ok(new BattleQuizResponse
            {
                EnemyId = request.EnemyId,
                EnemyName = request.EnemyName,
                Question = question,
                QuestionId = questionId,
                TauntMessage = GetEnemyTaunt(request.EnemyName, request.EnemyZone),
                TimeLimit = GetTimeLimit(request.Difficulty, request.IsBoss)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate battle quiz for {EnemyName}", request.EnemyName);
            
            // Return a fallback question
            return Ok(new BattleQuizResponse
            {
                EnemyId = request.EnemyId,
                EnemyName = request.EnemyName,
                Question = GetFallbackQuestion(request.EnemyZone),
                TauntMessage = "Answer this if you can!",
                TimeLimit = 30
            });
        }
    }

    /// <summary>
    /// Mark a question as answered (called after player answers)
    /// </summary>
    [HttpPost("battle-quiz/answered")]
    public async Task<IActionResult> MarkQuestionAnswered([FromBody] QuestionAnsweredRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
            var tenantId = User.FindFirst("tenant_id")?.Value 
                ?? User.FindFirst("tenant")?.Value 
                ?? "default";

            await _quizRepo.MarkQuestionAnsweredAsync(tenantId, userId, request.QuestionId, request.AnsweredCorrectly);
            
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark question answered");
            return Ok(new { success = false });
        }
    }

    private string NormalizeZone(string? zone)
    {
        if (string.IsNullOrEmpty(zone)) return "lobby";
        
        // Map zone names to standard values
        return zone.ToLowerInvariant() switch
        {
            "lobby" or "office" => "lobby",
            "finance" or "accounting" => "finance",
            "hospitality" or "hr" => "hospitality",
            "research" or "it" or "tech" => "research",
            _ => "lobby"
        };
    }

    /// <summary>
    /// Generate multiple battle quiz questions at once (for pre-loading)
    /// </summary>
    [HttpPost("battle-quiz/batch")]
    public async Task<IActionResult> GenerateBattleQuizBatch([FromBody] BattleQuizBatchRequest request)
    {
        try
        {
            var questions = await GenerateMultipleQuizQuestions(request);
            
            return Ok(new BattleQuizBatchResponse
            {
                EnemyId = request.EnemyId,
                EnemyName = request.EnemyName,
                Questions = questions,
                TimeLimit = GetTimeLimit(request.Difficulty, request.IsBoss)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate batch quiz for {EnemyName}", request.EnemyName);
            
            // Return fallback questions
            var fallbackQuestions = new List<QuizQuestion>();
            for (int i = 0; i < request.QuestionCount; i++)
            {
                fallbackQuestions.Add(GetFallbackQuestion(request.EnemyZone, i));
            }
            
            return Ok(new BattleQuizBatchResponse
            {
                EnemyId = request.EnemyId,
                EnemyName = request.EnemyName,
                Questions = fallbackQuestions,
                TimeLimit = 30
            });
        }
    }

    #region Private Helpers

    private async Task<string> SendChatCompletion(string systemPrompt, string userMessage, int maxTokens = 150, double temperature = 0.7)
    {
        var llmConnection = await _llmService.GetProductLlmConnectionAsync();
        
        if (llmConnection == null)
        {
            throw new InvalidOperationException("No LLM connection configured");
        }

        var chatRequest = new
        {
            model = llmConnection.DefaultModel ?? "gpt-4",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            },
            max_tokens = maxTokens,
            temperature = temperature
        };

        var httpClient = _httpClientFactory.CreateClient();
        var endpoint = BuildEndpoint(llmConnection);
        
        ConfigureHttpClient(httpClient, llmConnection);

        var response = await httpClient.PostAsJsonAsync(endpoint, chatRequest);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("LLM API error: {StatusCode} - {Response}", response.StatusCode, responseContent);
            throw new HttpRequestException($"LLM API returned {response.StatusCode}");
        }

        var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        return ExtractContent(jsonResponse, llmConnection.Provider);
    }

    private string BuildEndpoint(dynamic llmConnection)
    {
        string provider = llmConnection.Provider;
        string baseUrl = llmConnection.BaseUrl;
        string? apiVersion = llmConnection.ApiVersion;
        string? model = llmConnection.DefaultModel;

        return provider switch
        {
            "OpenAI" => $"{baseUrl}/v1/chat/completions",
            "AzureOpenAI" => $"{baseUrl}/openai/deployments/{model}/chat/completions?api-version={apiVersion ?? "2024-02-15-preview"}",
            "Anthropic" => $"{baseUrl}/v1/messages",
            "Ollama" => $"{baseUrl}/api/chat",
            "Arribatec" => $"{baseUrl}/v1/chat/completions",
            _ => $"{baseUrl}/v1/chat/completions" // OpenAI-compatible default
        };
    }

    private void ConfigureHttpClient(HttpClient httpClient, dynamic llmConnection)
    {
        string provider = llmConnection.Provider;
        string apiKey = llmConnection.ApiKey;

        httpClient.DefaultRequestHeaders.Clear();

        switch (provider)
        {
            case "AzureOpenAI":
                httpClient.DefaultRequestHeaders.Add("api-key", apiKey);
                break;
            case "Anthropic":
                httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
                httpClient.DefaultRequestHeaders.Add("anthropic-version", "2024-01-01");
                break;
            default:
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                break;
        }
    }

    private string ExtractContent(JsonElement response, string provider)
    {
        try
        {
            if (provider == "Anthropic")
            {
                return response.GetProperty("content")[0].GetProperty("text").GetString() ?? "";
            }
            
            // OpenAI-compatible format
            return response
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract content from LLM response");
            return "";
        }
    }

    private int ExtractTokensUsed(JsonElement response)
    {
        try
        {
            if (response.TryGetProperty("usage", out var usage) &&
                usage.TryGetProperty("total_tokens", out var tokens))
            {
                return tokens.GetInt32();
            }
        }
        catch { }
        
        return 0;
    }

    private string GetNpcPersonality(string npcType)
    {
        return npcType.ToLower() switch
        {
            "boss" => "You are a corporate villain who speaks in corporate buzzwords and threatens the player with meetings and performance reviews.",
            "quest_giver" => "You are a friendly coworker who needs help with various office tasks. You're stressed but hopeful.",
            "merchant" => "You are the office supply vendor. You speak enthusiastically about staplers, sticky notes, and coffee.",
            "mentor" => "You are a wise senior employee who offers cryptic but helpful advice using corporate metaphors.",
            "hr" => "You are an HR representative who speaks in overly formal, policy-laden language.",
            _ => "You are a generic office worker with a quirky personality."
        };
    }

    private string GetFallbackDialogue(string npcType)
    {
        return npcType.ToLower() switch
        {
            "boss" => "Your meeting request has been... declined. Now prepare yourself!",
            "quest_giver" => "I could really use your help with something...",
            "merchant" => "Welcome! Check out my selection of office supplies!",
            "mentor" => "Remember, young one: synergy is the key to success.",
            _ => "Hello there, fellow employee!"
        };
    }

    private string GetFallbackHint(string currentZone)
    {
        return currentZone.ToLower() switch
        {
            "lobby" => "Try exploring the different areas of the office. The elevator might take you somewhere interesting.",
            "meeting_room" => "Meetings can be dangerous. Make sure you're prepared before facing the Meeting Master.",
            "break_room" => "The coffee here might give you a boost. Don't forget to check the vending machine.",
            "server_room" => "Watch out for the digital hazards. The Email Overlord lurks here.",
            _ => "Keep exploring and leveling up. You'll find your way!"
        };
    }

    private string GetNextObjective(GameHintRequest request)
    {
        var defeatedCount = request.DefeatedBosses?.Count ?? 0;
        
        return defeatedCount switch
        {
            0 => "Defeat your first boss in the Meeting Room",
            1 => "Find and defeat the Email Overlord in the Server Room",
            2 => "Track down the Micromanager",
            3 => "Prepare to face HR Karen in the final battle",
            _ => "Explore and find new challenges"
        };
    }

    #region Battle Quiz Helpers

    private const string QuizGenerationPrompt = @"You are a quiz master for 'Arribatec Office RPG', an office-themed game.
Generate a trivia question related to the given topic/enemy theme. The question should be:
- Educational and related to real office/business knowledge
- Appropriate difficulty based on the level provided
- Have exactly 4 answer options where only ONE is correct
- Fun and engaging with office humor when appropriate

IMPORTANT: Respond ONLY with valid JSON in this exact format, no other text:
{{
  ""question"": ""Your question here?"",
  ""answers"": [""Answer A"", ""Answer B"", ""Answer C"", ""Answer D""],
  ""correctIndex"": 0,
  ""explanation"": ""Brief explanation why this is correct"",
  ""theme"": ""The topic category""
}}

The correctIndex must be 0, 1, 2, or 3 indicating which answer is correct.";

    private const string BatchQuizPrompt = @"You are a quiz master for 'Arribatec Office RPG', an office-themed game.
Generate {0} unique trivia questions related to the given topic/enemy theme. Each question should be:
- Educational and related to real office/business knowledge
- Appropriate difficulty based on the level provided
- Have exactly 4 answer options where only ONE is correct
- Different from each other (no repeated topics)

IMPORTANT: Respond ONLY with valid JSON array, no other text:
[
  {{
    ""question"": ""First question?"",
    ""answers"": [""A"", ""B"", ""C"", ""D""],
    ""correctIndex"": 0,
    ""explanation"": ""Why correct"",
    ""theme"": ""Topic""
  }},
  ...more questions...
]";

    private async Task<QuizQuestion> GenerateQuizQuestion(BattleQuizRequest request)
    {
        var topicPrompt = GetZoneTopics(request.EnemyZone, request.EnemyName, request.IsBoss);
        var difficultyHint = request.Difficulty <= 3 ? "easy (basic office knowledge)" : 
                            request.Difficulty <= 6 ? "medium (professional knowledge)" : 
                            "hard (expert business knowledge)";
        
        var userPrompt = $@"Generate a {difficultyHint} quiz question about: {topicPrompt}
Enemy: {request.EnemyName} (Level difficulty: {request.Difficulty}/10, Player level: {request.PlayerLevel})
{(request.PreviousQuestions?.Count > 0 ? $"Avoid these topics already asked: {string.Join(", ", request.PreviousQuestions)}" : "")}";

        var response = await SendChatCompletion(QuizGenerationPrompt, userPrompt, maxTokens: 300, temperature: 0.8);
        
        return ParseQuizQuestion(response);
    }

    private async Task<List<QuizQuestion>> GenerateMultipleQuizQuestions(BattleQuizBatchRequest request)
    {
        var topicPrompt = GetZoneTopics(request.EnemyZone, request.EnemyName, request.IsBoss);
        var difficultyHint = request.Difficulty <= 3 ? "easy" : 
                            request.Difficulty <= 6 ? "medium" : "hard";
        
        var systemPrompt = string.Format(BatchQuizPrompt, request.QuestionCount);
        
        var userPrompt = $@"Generate {request.QuestionCount} {difficultyHint} quiz questions about: {topicPrompt}
Enemy: {request.EnemyName} (Difficulty: {request.Difficulty}/10, Player level: {request.PlayerLevel})
Make each question about a different aspect of the topic.";

        var response = await SendChatCompletion(systemPrompt, userPrompt, maxTokens: 500 * request.QuestionCount, temperature: 0.8);
        
        return ParseQuizQuestionBatch(response, request.QuestionCount, request.EnemyZone);
    }

    private string GetZoneTopics(string zone, string enemyName, bool isBoss)
    {
        var baseTopics = zone.ToLower() switch
        {
            "finance" => "finance, accounting, budgeting, auditing, taxes, investments, financial statements, ROI, profit margins, expense reports",
            "hospitality" => "customer service, hotel management, tourism, event planning, reservations, guest satisfaction, hospitality industry standards",
            "research" => "research methods, data analysis, scientific method, grant writing, academic publishing, statistics, lab protocols",
            _ => "general office skills, email etiquette, meeting management, project management, teamwork, communication"
        };

        // Add boss-specific harder topics
        if (isBoss)
        {
            baseTopics = zone.ToLower() switch
            {
                "finance" => baseTopics + ", CFO responsibilities, financial regulations, SEC compliance, merger & acquisitions, corporate finance strategy",
                "hospitality" => baseTopics + ", crisis management, brand management, strategic partnerships, luxury service standards, international hospitality",
                "research" => baseTopics + ", peer review, research ethics, intellectual property, leading research teams, breakthrough discoveries",
                _ => baseTopics + ", executive leadership, strategic planning, corporate governance"
            };
        }

        return $"{enemyName} themes: {baseTopics}";
    }

    private QuizQuestion ParseQuizQuestion(string jsonResponse)
    {
        try
        {
            // Clean the response - remove markdown code blocks if present
            var cleanJson = jsonResponse.Trim();
            if (cleanJson.StartsWith("```"))
            {
                var lines = cleanJson.Split('\n');
                cleanJson = string.Join('\n', lines.Skip(1).Take(lines.Length - 2));
            }
            
            var json = JsonSerializer.Deserialize<JsonElement>(cleanJson);
            
            var answers = new List<string>();
            foreach (var answer in json.GetProperty("answers").EnumerateArray())
            {
                answers.Add(answer.GetString() ?? "");
            }
            
            return new QuizQuestion
            {
                Question = json.GetProperty("question").GetString() ?? "",
                Answers = answers,
                CorrectIndex = json.GetProperty("correctIndex").GetInt32(),
                Explanation = json.TryGetProperty("explanation", out var exp) ? exp.GetString() : null,
                Theme = json.TryGetProperty("theme", out var theme) ? theme.GetString() : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse quiz question JSON: {Response}", jsonResponse);
            throw;
        }
    }

    private List<QuizQuestion> ParseQuizQuestionBatch(string jsonResponse, int expectedCount, string zone)
    {
        try
        {
            var cleanJson = jsonResponse.Trim();
            if (cleanJson.StartsWith("```"))
            {
                var lines = cleanJson.Split('\n');
                cleanJson = string.Join('\n', lines.Skip(1).Take(lines.Length - 2));
            }
            
            var jsonArray = JsonSerializer.Deserialize<JsonElement>(cleanJson);
            var questions = new List<QuizQuestion>();
            
            foreach (var item in jsonArray.EnumerateArray())
            {
                var answers = new List<string>();
                foreach (var answer in item.GetProperty("answers").EnumerateArray())
                {
                    answers.Add(answer.GetString() ?? "");
                }
                
                questions.Add(new QuizQuestion
                {
                    Question = item.GetProperty("question").GetString() ?? "",
                    Answers = answers,
                    CorrectIndex = item.GetProperty("correctIndex").GetInt32(),
                    Explanation = item.TryGetProperty("explanation", out var exp) ? exp.GetString() : null,
                    Theme = item.TryGetProperty("theme", out var theme) ? theme.GetString() : null
                });
            }
            
            return questions;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse batch quiz JSON, using fallbacks");
            
            // Return fallbacks
            var fallbacks = new List<QuizQuestion>();
            for (int i = 0; i < expectedCount; i++)
            {
                fallbacks.Add(GetFallbackQuestion(zone, i));
            }
            return fallbacks;
        }
    }

    private string GetEnemyTaunt(string enemyName, string zone)
    {
        var taunts = zone.ToLower() switch
        {
            "finance" => new[] {
                $"Let's see if you can balance THIS equation!",
                $"Your budget is about to be... AUDITED!",
                $"Time to crunch some numbers... YOUR numbers!",
                $"This expense won't be approved!"
            },
            "hospitality" => new[] {
                $"Customer satisfaction is about to DROP!",
                $"Your reservation has been... CANCELLED!",
                $"Let's see how you handle THIS complaint!",
                $"Check-out time is NOW!"
            },
            "research" => new[] {
                $"Your hypothesis is about to be REJECTED!",
                $"Let's test your knowledge scientifically!",
                $"Peer review time... for YOU!",
                $"This experiment is about to FAIL!"
            },
            _ => new[] {
                $"Answer this if you can!",
                $"Let's see what you know!",
                $"Time for a pop quiz!",
                $"Prepare to be tested!"
            }
        };
        
        return taunts[Random.Shared.Next(taunts.Length)];
    }

    private int GetTimeLimit(int difficulty, bool isBoss)
    {
        var baseTime = 30;
        
        // Harder enemies = less time
        if (difficulty > 7) baseTime = 20;
        else if (difficulty > 4) baseTime = 25;
        
        // Bosses give a bit more time since questions are harder
        if (isBoss) baseTime += 10;
        
        return baseTime;
    }

    private QuizQuestion GetFallbackQuestion(string zone, int variant = 0)
    {
        var questions = zone.ToLower() switch
        {
            "finance" => new List<QuizQuestion>
            {
                new() {
                    Question = "What does ROI stand for in business?",
                    Answers = new List<string> { "Return on Investment", "Rate of Income", "Risk of Inflation", "Revenue of Industry" },
                    CorrectIndex = 0,
                    Explanation = "ROI measures the profitability of an investment",
                    Theme = "Finance Basics"
                },
                new() {
                    Question = "What is a balance sheet?",
                    Answers = new List<string> { "A gym equipment", "A financial statement showing assets and liabilities", "A type of scale", "A budget planning tool" },
                    CorrectIndex = 1,
                    Explanation = "A balance sheet shows a company's financial position",
                    Theme = "Accounting"
                },
                new() {
                    Question = "What does 'fiscal year' mean?",
                    Answers = new List<string> { "A calendar year", "A 12-month accounting period", "A tax deadline", "A budget cycle" },
                    CorrectIndex = 1,
                    Explanation = "A fiscal year is a 12-month period used for accounting",
                    Theme = "Finance Terms"
                }
            },
            "hospitality" => new List<QuizQuestion>
            {
                new() {
                    Question = "What does 'concierge' mean in hospitality?",
                    Answers = new List<string> { "A type of room", "A staff member who assists guests", "A restaurant menu", "A cleaning service" },
                    CorrectIndex = 1,
                    Explanation = "A concierge helps guests with various services and information",
                    Theme = "Hospitality Roles"
                },
                new() {
                    Question = "What is 'RevPAR' in hotel management?",
                    Answers = new List<string> { "Revenue Per Available Room", "Review and Parking Rate", "Reservation Parameter", "Room Evaluation Process" },
                    CorrectIndex = 0,
                    Explanation = "RevPAR measures hotel room revenue performance",
                    Theme = "Hotel Metrics"
                },
                new() {
                    Question = "What is a 'comp' in hospitality?",
                    Answers = new List<string> { "A complaint", "A complimentary (free) service", "A computer system", "A company event" },
                    CorrectIndex = 1,
                    Explanation = "Comp is short for complimentary - something given for free",
                    Theme = "Industry Terms"
                }
            },
            "research" => new List<QuizQuestion>
            {
                new() {
                    Question = "What is a 'hypothesis' in research?",
                    Answers = new List<string> { "A final conclusion", "A testable prediction", "A type of experiment", "A research funding source" },
                    CorrectIndex = 1,
                    Explanation = "A hypothesis is an educated prediction that can be tested",
                    Theme = "Scientific Method"
                },
                new() {
                    Question = "What does 'peer review' mean?",
                    Answers = new List<string> { "Looking at colleagues", "Expert evaluation of research", "A type of meeting", "Performance review" },
                    CorrectIndex = 1,
                    Explanation = "Peer review is when experts evaluate research before publication",
                    Theme = "Academic Publishing"
                },
                new() {
                    Question = "What is a 'control group' in an experiment?",
                    Answers = new List<string> { "The group that manages the experiment", "A group that doesn't receive the treatment", "The largest group", "The final results group" },
                    CorrectIndex = 1,
                    Explanation = "A control group provides a baseline for comparison",
                    Theme = "Research Methods"
                }
            },
            _ => new List<QuizQuestion>
            {
                new() {
                    Question = "What does 'EOD' mean in office communication?",
                    Answers = new List<string> { "End of Day", "Every Other Day", "Email on Demand", "Executive Office Director" },
                    CorrectIndex = 0,
                    Explanation = "EOD means End of Day, typically used for deadlines",
                    Theme = "Office Communication"
                },
                new() {
                    Question = "What is 'CC' in an email?",
                    Answers = new List<string> { "Carbon Copy", "Computer Command", "Central Communication", "Copy Control" },
                    CorrectIndex = 0,
                    Explanation = "CC stands for Carbon Copy - additional recipients",
                    Theme = "Email Etiquette"
                },
                new() {
                    Question = "What does 'ASAP' mean?",
                    Answers = new List<string> { "Always Send A Package", "As Soon As Possible", "After Standard Approval Process", "Assigned Staff Action Plan" },
                    CorrectIndex = 1,
                    Explanation = "ASAP means As Soon As Possible",
                    Theme = "Office Acronyms"
                }
            }
        };
        
        return questions[variant % questions.Count];
    }

    #endregion

    #endregion
}
