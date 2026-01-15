using Arribatec.Nexus.Client.Services;
using Dapper;
using FKarribatecofficerpg.Api.Models;

namespace FKarribatecofficerpg.Api.Repositories;

public interface IGameStateRepository
{
    Task<GameStateResponse?> GetGameStateAsync(string tenantId, string userId);
    Task SaveGameStateAsync(string tenantId, string userId, GameStateSaveRequest request);
    Task DeleteGameStateAsync(string tenantId, string userId);
}

public class GameStateRepository : IGameStateRepository
{
    private readonly IContextAwareDatabaseService _dbService;
    private readonly ILogger<GameStateRepository> _logger;

    public GameStateRepository(
        IContextAwareDatabaseService dbService,
        ILogger<GameStateRepository> logger)
    {
        _dbService = dbService;
        _logger = logger;
    }

    public async Task<GameStateResponse?> GetGameStateAsync(string tenantId, string userId)
    {
        try
        {
            using var connection = await _dbService.CreateProductConnectionAsync();

            var state = await connection.QueryFirstOrDefaultAsync<GameStateResponse>(
                @"SELECT PositionX, PositionY, CurrentZone, 
                         Level, Exp, Gold,
                         CurrentHP, MaxHP, Logic, Resilience, Charisma,
                         DefeatedBosses, PlayTime, LastSaved
                  FROM GameStates 
                  WHERE TenantId = @TenantId AND UserId = @UserId",
                new { TenantId = tenantId, UserId = userId }
            );

            return state;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get game state for tenant {TenantId}, user {UserId}", tenantId, userId);
            throw;
        }
    }

    public async Task SaveGameStateAsync(string tenantId, string userId, GameStateSaveRequest request)
    {
        try
        {
            using var connection = await _dbService.CreateProductConnectionAsync();

            // Use MERGE for upsert operation
            await connection.ExecuteAsync(
                @"MERGE GameStates AS target
                  USING (SELECT @TenantId AS TenantId, @UserId AS UserId) AS source
                  ON target.TenantId = source.TenantId AND target.UserId = source.UserId
                  WHEN MATCHED THEN
                    UPDATE SET 
                      PositionX = @PositionX,
                      PositionY = @PositionY,
                      CurrentZone = @CurrentZone,
                      Level = @Level,
                      Exp = @Exp,
                      Gold = @Gold,
                      CurrentHP = @CurrentHP,
                      MaxHP = @MaxHP,
                      Logic = @Logic,
                      Resilience = @Resilience,
                      Charisma = @Charisma,
                      DefeatedBosses = @DefeatedBosses,
                      PlayTime = @PlayTime,
                      LastSaved = GETUTCDATE()
                  WHEN NOT MATCHED THEN
                    INSERT (TenantId, UserId, PositionX, PositionY, CurrentZone,
                            Level, Exp, Gold, CurrentHP, MaxHP, Logic, Resilience, Charisma,
                            DefeatedBosses, PlayTime, LastSaved, CreatedAt)
                    VALUES (@TenantId, @UserId, @PositionX, @PositionY, @CurrentZone,
                            @Level, @Exp, @Gold, @CurrentHP, @MaxHP, @Logic, @Resilience, @Charisma,
                            @DefeatedBosses, @PlayTime, GETUTCDATE(), GETUTCDATE());",
                new
                {
                    TenantId = tenantId,
                    UserId = userId,
                    request.PositionX,
                    request.PositionY,
                    request.CurrentZone,
                    request.Level,
                    request.Exp,
                    request.Gold,
                    request.CurrentHP,
                    request.MaxHP,
                    request.Logic,
                    request.Resilience,
                    request.Charisma,
                    request.DefeatedBosses,
                    request.PlayTime
                }
            );

            _logger.LogInformation("Game state saved for tenant {TenantId}, user {UserId}", tenantId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save game state for tenant {TenantId}, user {UserId}", tenantId, userId);
            throw;
        }
    }

    public async Task DeleteGameStateAsync(string tenantId, string userId)
    {
        try
        {
            using var connection = await _dbService.CreateProductConnectionAsync();

            await connection.ExecuteAsync(
                "DELETE FROM GameStates WHERE TenantId = @TenantId AND UserId = @UserId",
                new { TenantId = tenantId, UserId = userId }
            );

            _logger.LogInformation("Game state deleted for tenant {TenantId}, user {UserId}", tenantId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete game state for tenant {TenantId}, user {UserId}", tenantId, userId);
            throw;
        }
    }
}
