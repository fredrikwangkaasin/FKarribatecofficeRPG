using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FKarribatecofficerpg.Api.Models;
using FKarribatecofficerpg.Api.Repositories;

namespace FKarribatecofficerpg.Api.Controllers;

/// <summary>
/// Game state management API for Arribatec Office RPG
/// Handles save/load/reset operations with tenant isolation
/// </summary>
[Authorize]
[ApiController]
[Route("api/gamestate")]
public class GameStateController : ControllerBase
{
    private readonly IGameStateRepository _repository;
    private readonly ILogger<GameStateController> _logger;

    public GameStateController(
        IGameStateRepository repository,
        ILogger<GameStateController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Load game state for the authenticated user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetGameState()
    {
        try
        {
            var (tenantId, userId) = GetUserContext();

            _logger.LogInformation("Loading game state for tenant {TenantId}, user {UserId}", tenantId, userId);

            var gameState = await _repository.GetGameStateAsync(tenantId, userId);

            if (gameState == null)
            {
                return NotFound(new { message = "No saved game found" });
            }

            return Ok(gameState);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load game state");
            return StatusCode(500, new { message = "Failed to load game state" });
        }
    }

    /// <summary>
    /// Save game state for the authenticated user
    /// </summary>
    [HttpPost("save")]
    public async Task<IActionResult> SaveGameState([FromBody] GameStateSaveRequest? request)
    {
        _logger.LogInformation("SaveGameState endpoint called");
        
        if (request == null)
        {
            _logger.LogWarning("SaveGameState called with null request body");
            return BadRequest(new { message = "Request body is required" });
        }

        _logger.LogInformation("Received save request: Level={Level}, Gold={Gold}, Zone={Zone}", 
            request.Level, request.Gold, request.CurrentZone);

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            _logger.LogWarning("SaveGameState model validation failed: {Errors}", string.Join(", ", errors));
            return BadRequest(new { message = "Invalid request", errors });
        }

        try
        {
            var (tenantId, userId) = GetUserContext();

            _logger.LogInformation("Saving game state for tenant {TenantId}, user {UserId}", tenantId, userId);

            await _repository.SaveGameStateAsync(tenantId, userId, request);

            return Ok(new 
            { 
                message = "Game saved successfully",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save game state");
            return StatusCode(500, new { message = "Failed to save game state" });
        }
    }

    /// <summary>
    /// Reset game state (delete save) for the authenticated user
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> ResetGameState()
    {
        try
        {
            var (tenantId, userId) = GetUserContext();

            _logger.LogInformation("Resetting game state for tenant {TenantId}, user {UserId}", tenantId, userId);

            await _repository.DeleteGameStateAsync(tenantId, userId);

            return Ok(new 
            { 
                message = "Game reset successfully",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reset game state");
            return StatusCode(500, new { message = "Failed to reset game state" });
        }
    }

    /// <summary>
    /// Extract tenant ID and user ID from JWT claims
    /// </summary>
    private (string tenantId, string userId) GetUserContext()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("User ID not found in token");

        var tenantId = User.FindFirst("tenant_id")?.Value
                    ?? User.FindFirst("tenant")?.Value
                    ?? User.FindFirst("realm")?.Value
                    ?? throw new UnauthorizedAccessException("Tenant ID not found in token");

        return (tenantId, userId);
    }
}
