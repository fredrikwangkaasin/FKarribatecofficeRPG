namespace FKarribatecofficerpg.Api.Models;

/// <summary>
/// Game state request for saving
/// </summary>
public class GameStateSaveRequest
{
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public string CurrentZone { get; set; } = "lobby";
    
    public int Level { get; set; }
    public int Exp { get; set; }
    public int Gold { get; set; }
    public int CurrentHP { get; set; }
    public int MaxHP { get; set; }
    public int Logic { get; set; }
    public int Resilience { get; set; }
    public int Charisma { get; set; }
    
    public string DefeatedBosses { get; set; } = "[]"; // JSON array
    public int PlayTime { get; set; }
}

/// <summary>
/// Game state response
/// </summary>
public class GameStateResponse
{
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public string CurrentZone { get; set; } = "lobby";
    
    public int Level { get; set; }
    public int Exp { get; set; }
    public int Gold { get; set; }
    public int CurrentHP { get; set; }
    public int MaxHP { get; set; }
    public int Logic { get; set; }
    public int Resilience { get; set; }
    public int Charisma { get; set; }
    
    public string DefeatedBosses { get; set; } = "[]";
    public int PlayTime { get; set; }
    public DateTime LastSaved { get; set; }
}
