using Arribatec.Nexus.Client.Services;
using Arribatec.Nexus.Client.TaskExecution;
using FKarribatecofficerpg.Api.Repositories;
using System.Text.Json;
using System.Net.Http.Headers;

namespace FKarribatecofficerpg.Api.Workers;

/// <summary>
/// Parameters for seeding quiz questions
/// </summary>
public record SeedQuizQuestionsParameters
{
    /// <summary>
    /// Number of questions to generate per zone per difficulty
    /// </summary>
    public int QuestionsPerZone { get; init; } = 20;
    
    /// <summary>
    /// Maximum difficulty level to generate (1-5)
    /// </summary>
    public int MaxDifficulty { get; init; } = 5;
    
    /// <summary>
    /// Only seed if below this threshold per zone
    /// </summary>
    public int MinimumThreshold { get; init; } = 10;
}

/// <summary>
/// Background task to seed quiz questions into the database using LLM
/// </summary>
[TaskHandler("seed-quiz-questions",
    Name = "Seed Quiz Questions",
    Description = "Generates quiz questions for battle encounters using AI")]
public class SeedQuizQuestionsWorker : ITaskHandler<SeedQuizQuestionsParameters>
{
    private readonly ILogger<SeedQuizQuestionsWorker> _logger;
    private readonly ITaskContext _context;
    private readonly IQuizQuestionRepository _quizRepo;
    private readonly IContextAwareLlmService _llmService;
    private readonly IHttpClientFactory _httpClientFactory;

    private static readonly string[] Zones = { "lobby", "finance", "hospitality", "research" };
    
    private static readonly Dictionary<string, string[]> ZoneTopics = new()
    {
        ["lobby"] = new[] { "office etiquette", "workplace safety", "company culture", "first day tips", "coffee machine operation" },
        ["finance"] = new[] { "budgets", "spreadsheets", "financial reports", "expense tracking", "quarterly reviews" },
        ["hospitality"] = new[] { "HR policies", "team building", "employee benefits", "vacation requests", "performance reviews" },
        ["research"] = new[] { "programming", "IT support", "software bugs", "technical documentation", "agile methodology" }
    };

    public SeedQuizQuestionsWorker(
        ILogger<SeedQuizQuestionsWorker> logger,
        ITaskContext context,
        IQuizQuestionRepository quizRepo,
        IContextAwareLlmService llmService,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _context = context;
        _quizRepo = quizRepo;
        _llmService = llmService;
        _httpClientFactory = httpClientFactory;
    }

    public async Task ExecuteAsync(SeedQuizQuestionsParameters parameters, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting quiz question seeding. Target: {QuestionsPerZone} questions per zone",
            parameters.QuestionsPerZone);

        var totalGenerated = 0;

        foreach (var zone in Zones)
        {
            for (int difficulty = 1; difficulty <= parameters.MaxDifficulty; difficulty++)
            {
                cancellationToken.ThrowIfCancellationRequested();

                // Check current count
                var currentCount = await _quizRepo.GetQuestionCountAsync(zone, difficulty);
                
                if (currentCount >= parameters.MinimumThreshold)
                {
                    _logger.LogDebug("Zone {Zone} difficulty {Difficulty} has {Count} questions, skipping",
                        zone, difficulty, currentCount);
                    continue;
                }

                var needed = parameters.QuestionsPerZone - currentCount;
                _logger.LogInformation("Generating {Needed} questions for zone {Zone} difficulty {Difficulty}",
                    needed, zone, difficulty);

                for (int i = 0; i < needed; i++)
                {
                    try
                    {
                        var question = await GenerateQuestionWithLlm(zone, difficulty, cancellationToken);
                        
                        if (question != null)
                        {
                            await _quizRepo.AddQuestionAsync(question);
                            totalGenerated++;
                            
                            _logger.LogDebug("Generated question {Count}/{Total} for {Zone}",
                                i + 1, needed, zone);
                        }
                        
                        // Small delay to avoid rate limiting
                        await Task.Delay(500, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to generate question for {Zone}", zone);
                    }
                }
            }
        }

        _logger.LogInformation("Quiz question seeding complete. Generated {Total} new questions", totalGenerated);
    }

    private async Task<QuizQuestionEntity?> GenerateQuestionWithLlm(string zone, int difficulty, CancellationToken cancellationToken)
    {
        var llmConnection = await _llmService.GetProductLlmConnectionAsync();
        
        if (llmConnection == null)
        {
            _logger.LogWarning("No LLM connection available, using fallback");
            return GenerateFallbackQuestion(zone, difficulty);
        }

        var topics = ZoneTopics.GetValueOrDefault(zone, ZoneTopics["lobby"]);
        var randomTopic = topics[Random.Shared.Next(topics.Length)];

        var prompt = $@"Generate a single trivia question about {randomTopic} for an office RPG game.
Difficulty level: {difficulty}/5 (1=easy, 5=hard)

The question should be fun and office-themed. 

Respond in this exact JSON format only, no other text:
{{
  ""question"": ""The question text"",
  ""answers"": [""Answer A"", ""Answer B"", ""Answer C"", ""Answer D""],
  ""correctIndex"": 0
}}

The correctIndex is 0-3 indicating which answer is correct.";

        try
        {
            var modelName = llmConnection.DefaultModel ?? "gpt-4";
            var chatRequest = new
            {
                model = modelName,
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
            
            _logger.LogDebug("Calling LLM endpoint: {Endpoint} with model: {Model}", endpoint, modelName);
            
            ConfigureHttpClient(httpClient, llmConnection);

            var response = await httpClient.PostAsJsonAsync(endpoint, chatRequest, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("LLM API returned {StatusCode}: {Error}", response.StatusCode, errorContent);
                return GenerateFallbackQuestion(zone, difficulty);
            }

            var result = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var content = result.GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrEmpty(content))
            {
                return GenerateFallbackQuestion(zone, difficulty);
            }

            // Parse the JSON response
            var questionData = JsonSerializer.Deserialize<GeneratedQuestion>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (questionData == null || questionData.Answers.Count != 4)
            {
                return GenerateFallbackQuestion(zone, difficulty);
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
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "LLM generation failed: {ErrorMessage}. Using fallback question.", ex.Message);
            return GenerateFallbackQuestion(zone, difficulty);
        }
    }

    private string BuildEndpoint(dynamic connection)
    {
        var baseUrl = connection.Endpoint.TrimEnd('/');
        if (!baseUrl.EndsWith("/chat/completions", StringComparison.OrdinalIgnoreCase))
        {
            baseUrl += "/chat/completions";
        }
        return baseUrl;
    }

    private void ConfigureHttpClient(HttpClient httpClient, dynamic connection)
    {
        httpClient.DefaultRequestHeaders.Clear();
        
        if (!string.IsNullOrEmpty(connection.ApiKey))
        {
            if (connection.Provider?.ToLowerInvariant() == "azure")
            {
                httpClient.DefaultRequestHeaders.Add("api-key", connection.ApiKey);
            }
            else
            {
                httpClient.DefaultRequestHeaders.Authorization = 
                    new AuthenticationHeaderValue("Bearer", connection.ApiKey);
            }
        }
    }

    private QuizQuestionEntity GenerateFallbackQuestion(string zone, int difficulty)
    {
        var questions = zone switch
        {
            "finance" => new[]
            {
                ("What is the primary purpose of a budget?", "Track spending", "Buy coffee", "Decorate office", "Schedule meetings", 0),
                ("What does ROI stand for?", "Return on Investment", "Run on Ice", "Report on Items", "Rest on Island", 0),
                ("What is a spreadsheet used for?", "Organizing data", "Making beds", "Spreading butter", "Sheet music", 0)
            },
            "hospitality" => new[]
            {
                ("What does HR stand for?", "Human Resources", "Happy Robots", "Hotel Reservations", "High Rollers", 0),
                ("What is a common team-building activity?", "Trust falls", "Solo coding", "Ignoring emails", "Skipping meetings", 0),
                ("What document outlines employee conduct?", "Employee handbook", "Novel", "Dictionary", "Comic book", 0)
            },
            "research" => new[]
            {
                ("What does IT stand for?", "Information Technology", "Ice Tea", "In Transit", "Italian Toast", 0),
                ("What is debugging?", "Fixing code errors", "Removing insects", "Bug collection", "Pest control", 0),
                ("What is version control?", "Tracking code changes", "Controlling versions", "Video games", "Remote control", 0)
            },
            _ => new[]
            {
                ("What is appropriate office attire?", "Business casual", "Pajamas", "Swimsuit", "Costume", 0),
                ("What should you do when the fire alarm sounds?", "Evacuate calmly", "Ignore it", "Make coffee", "Take a nap", 0),
                ("What is a good way to start the workday?", "Check emails", "Go back to sleep", "Leave early", "Skip meetings", 0)
            }
        };

        var q = questions[Random.Shared.Next(questions.Length)];
        
        return new QuizQuestionEntity
        {
            Zone = zone,
            Difficulty = difficulty,
            Question = q.Item1,
            Answer1 = q.Item2,
            Answer2 = q.Item3,
            Answer3 = q.Item4,
            Answer4 = q.Item5,
            CorrectIndex = q.Item6,
            IsActive = true
        };
    }

    private class GeneratedQuestion
    {
        public string Question { get; set; } = "";
        public List<string> Answers { get; set; } = new();
        public int CorrectIndex { get; set; }
    }
}
