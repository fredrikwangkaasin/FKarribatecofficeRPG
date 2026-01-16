namespace FKarribatecofficerpg.Api.Models;

/// <summary>
/// Chat completion request
/// </summary>
public class ChatCompletionRequest
{
    public List<ChatMessage> Messages { get; set; } = new();
    public int? MaxTokens { get; set; } = 500;
    public double? Temperature { get; set; } = 0.7;
    public string? SystemPrompt { get; set; }
}

/// <summary>
/// A single chat message
/// </summary>
public class ChatMessage
{
    public string Role { get; set; } = "user";
    public string Content { get; set; } = "";
}

/// <summary>
/// Chat completion response
/// </summary>
public class ChatCompletionResponse
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Content { get; set; } = "";
    public string Model { get; set; } = "";
    public int TokensUsed { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// NPC dialogue request for in-game chat
/// </summary>
public class NpcDialogueRequest
{
    public string NpcName { get; set; } = "";
    public string NpcType { get; set; } = ""; // boss, quest_giver, merchant, etc.
    public string PlayerMessage { get; set; } = "";
    public string? CurrentZone { get; set; }
    public int? PlayerLevel { get; set; }
    public List<string>? DefeatedBosses { get; set; }
}

/// <summary>
/// NPC dialogue response
/// </summary>
public class NpcDialogueResponse
{
    public string NpcName { get; set; } = "";
    public string Dialogue { get; set; } = "";
    public List<string>? Hints { get; set; }
    public bool HasQuest { get; set; }
}

/// <summary>
/// Game hint request
/// </summary>
public class GameHintRequest
{
    public string CurrentZone { get; set; } = "";
    public int PlayerLevel { get; set; }
    public List<string> DefeatedBosses { get; set; } = new();
    public string? StuckOn { get; set; } // What the player is stuck on
}

/// <summary>
/// Game hint response
/// </summary>
public class GameHintResponse
{
    public string Hint { get; set; } = "";
    public string? NextObjective { get; set; }
    public int Relevance { get; set; } = 100; // 0-100 confidence score
}

/// <summary>
/// Request to generate a battle quiz question
/// </summary>
public class BattleQuizRequest
{
    public string EnemyId { get; set; } = "";
    public string EnemyName { get; set; } = "";
    public string EnemyZone { get; set; } = ""; // finance, hospitality, research
    public bool IsBoss { get; set; }
    public int Difficulty { get; set; } = 5; // 1-10
    public int PlayerLevel { get; set; } = 1;
    public List<string>? PreviousQuestions { get; set; } // To avoid repeats
}

/// <summary>
/// A single quiz question with 4 answers
/// </summary>
public class QuizQuestion
{
    public string Question { get; set; } = "";
    public List<string> Answers { get; set; } = new();
    public int CorrectIndex { get; set; } // 0-3
    public string? Explanation { get; set; } // Why this answer is correct
    public string? Theme { get; set; } // The topic/theme of the question
}

/// <summary>
/// Response containing a battle quiz question
/// </summary>
public class BattleQuizResponse
{
    public string EnemyId { get; set; } = "";
    public string EnemyName { get; set; } = "";
    public QuizQuestion Question { get; set; } = new();
    public Guid? QuestionId { get; set; } // Database ID for tracking answered questions
    public string? TauntMessage { get; set; } // Enemy's taunt while asking
    public int TimeLimit { get; set; } = 30; // Seconds to answer
}

/// <summary>
/// Request to mark a question as answered
/// </summary>
public class QuestionAnsweredRequest
{
    public Guid QuestionId { get; set; }
    public bool AnsweredCorrectly { get; set; }
}

/// <summary>
/// Request to seed questions
/// </summary>
public class SeedQuestionsRequest
{
    public int Count { get; set; } = 50;
}

/// <summary>
/// Request to generate multiple questions at once
/// </summary>
public class BattleQuizBatchRequest
{
    public string EnemyId { get; set; } = "";
    public string EnemyName { get; set; } = "";
    public string EnemyZone { get; set; } = "";
    public bool IsBoss { get; set; }
    public int Difficulty { get; set; } = 5;
    public int PlayerLevel { get; set; } = 1;
    public int QuestionCount { get; set; } = 3; // How many questions to generate
}

/// <summary>
/// Response containing multiple battle quiz questions
/// </summary>
public class BattleQuizBatchResponse
{
    public string EnemyId { get; set; } = "";
    public string EnemyName { get; set; } = "";
    public List<QuizQuestion> Questions { get; set; } = new();
    public int TimeLimit { get; set; } = 30;
}
