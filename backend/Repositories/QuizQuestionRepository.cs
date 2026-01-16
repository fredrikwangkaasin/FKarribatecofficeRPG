using Arribatec.Nexus.Client.Services;
using Dapper;

namespace FKarribatecofficerpg.Api.Repositories;

/// <summary>
/// Repository for managing quiz questions and user answer tracking
/// </summary>
public interface IQuizQuestionRepository
{
    /// <summary>
    /// Get a random unanswered question for a user in a specific zone
    /// </summary>
    Task<QuizQuestionEntity?> GetRandomUnansweredQuestionAsync(
        string tenantId, string userId, string zone, int difficulty);
    
    /// <summary>
    /// Mark a question as answered by a user
    /// </summary>
    Task MarkQuestionAnsweredAsync(
        string tenantId, string userId, Guid questionId, bool answeredCorrectly);
    
    /// <summary>
    /// Add a new question to the database
    /// </summary>
    Task<Guid> AddQuestionAsync(QuizQuestionEntity question);
    
    /// <summary>
    /// Get count of questions by zone
    /// </summary>
    Task<Dictionary<string, int>> GetQuestionCountsByZoneAsync();
    
    /// <summary>
    /// Get all questions for a zone (for seeding check)
    /// </summary>
    Task<int> GetQuestionCountAsync(string zone, int difficulty);
}

/// <summary>
/// Quiz question database entity
/// </summary>
public class QuizQuestionEntity
{
    public Guid Id { get; set; }
    public string Zone { get; set; } = string.Empty;
    public int Difficulty { get; set; } = 1;
    public string? EnemyType { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer1 { get; set; } = string.Empty;
    public string Answer2 { get; set; } = string.Empty;
    public string Answer3 { get; set; } = string.Empty;
    public string Answer4 { get; set; } = string.Empty;
    public int CorrectIndex { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}

public class QuizQuestionRepository : IQuizQuestionRepository
{
    private readonly IContextAwareDatabaseService _dbService;
    private readonly ILogger<QuizQuestionRepository> _logger;

    public QuizQuestionRepository(
        IContextAwareDatabaseService dbService,
        ILogger<QuizQuestionRepository> logger)
    {
        _dbService = dbService;
        _logger = logger;
    }

    public async Task<QuizQuestionEntity?> GetRandomUnansweredQuestionAsync(
        string tenantId, string userId, string zone, int difficulty)
    {
        try
        {
            using var connection = await _dbService.CreateProductConnectionAsync();

            // Get a random question that the user hasn't answered correctly yet
            var sql = @"
                SELECT TOP 1 q.*
                FROM QuizQuestions q
                WHERE q.Zone = @Zone 
                  AND q.Difficulty <= @Difficulty
                  AND q.IsActive = 1
                  AND q.Id NOT IN (
                      SELECT ua.QuestionId 
                      FROM UserAnsweredQuestions ua 
                      WHERE ua.TenantId = @TenantId 
                        AND ua.UserId = @UserId 
                        AND ua.AnsweredCorrectly = 1
                  )
                ORDER BY NEWID()";

            var question = await connection.QueryFirstOrDefaultAsync<QuizQuestionEntity>(
                sql, new { TenantId = tenantId, UserId = userId, Zone = zone, Difficulty = difficulty });

            if (question == null)
            {
                _logger.LogWarning("No unanswered questions found for user {UserId} in zone {Zone}", userId, zone);
                
                // Fallback: get any random question from the zone (even if answered before)
                var fallbackSql = @"
                    SELECT TOP 1 q.*
                    FROM QuizQuestions q
                    WHERE q.Zone = @Zone 
                      AND q.Difficulty <= @Difficulty
                      AND q.IsActive = 1
                    ORDER BY NEWID()";
                
                question = await connection.QueryFirstOrDefaultAsync<QuizQuestionEntity>(
                    fallbackSql, new { Zone = zone, Difficulty = difficulty });
            }

            return question;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching quiz question for zone {Zone}", zone);
            return null;
        }
    }

    public async Task MarkQuestionAnsweredAsync(
        string tenantId, string userId, Guid questionId, bool answeredCorrectly)
    {
        try
        {
            using var connection = await _dbService.CreateProductConnectionAsync();

            // Use MERGE to insert or update
            var sql = @"
                MERGE UserAnsweredQuestions AS target
                USING (SELECT @TenantId AS TenantId, @UserId AS UserId, @QuestionId AS QuestionId) AS source
                ON target.TenantId = source.TenantId 
                   AND target.UserId = source.UserId 
                   AND target.QuestionId = source.QuestionId
                WHEN MATCHED THEN
                    UPDATE SET AnsweredCorrectly = @AnsweredCorrectly, AnsweredAt = GETUTCDATE()
                WHEN NOT MATCHED THEN
                    INSERT (TenantId, UserId, QuestionId, AnsweredCorrectly, AnsweredAt)
                    VALUES (@TenantId, @UserId, @QuestionId, @AnsweredCorrectly, GETUTCDATE());";

            await connection.ExecuteAsync(sql, new
            {
                TenantId = tenantId,
                UserId = userId,
                QuestionId = questionId,
                AnsweredCorrectly = answeredCorrectly
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking question {QuestionId} as answered", questionId);
        }
    }

    public async Task<Guid> AddQuestionAsync(QuizQuestionEntity question)
    {
        using var connection = await _dbService.CreateProductConnectionAsync();

        question.Id = Guid.NewGuid();
        question.CreatedAt = DateTime.UtcNow;

        var sql = @"
            INSERT INTO QuizQuestions 
                (Id, Zone, Difficulty, EnemyType, Question, Answer1, Answer2, Answer3, Answer4, CorrectIndex, IsActive, CreatedAt)
            VALUES 
                (@Id, @Zone, @Difficulty, @EnemyType, @Question, @Answer1, @Answer2, @Answer3, @Answer4, @CorrectIndex, @IsActive, @CreatedAt)";

        await connection.ExecuteAsync(sql, question);
        
        _logger.LogDebug("Added question {Id} for zone {Zone}", question.Id, question.Zone);
        
        return question.Id;
    }

    public async Task<Dictionary<string, int>> GetQuestionCountsByZoneAsync()
    {
        using var connection = await _dbService.CreateProductConnectionAsync();

        var sql = @"
            SELECT Zone, COUNT(*) as Count 
            FROM QuizQuestions 
            WHERE IsActive = 1 
            GROUP BY Zone";

        var results = await connection.QueryAsync<(string Zone, int Count)>(sql);
        
        return results.ToDictionary(r => r.Zone, r => r.Count);
    }

    public async Task<int> GetQuestionCountAsync(string zone, int difficulty)
    {
        using var connection = await _dbService.CreateProductConnectionAsync();

        var sql = @"
            SELECT COUNT(*) 
            FROM QuizQuestions 
            WHERE Zone = @Zone AND Difficulty = @Difficulty AND IsActive = 1";

        return await connection.ExecuteScalarAsync<int>(sql, new { Zone = zone, Difficulty = difficulty });
    }
}
