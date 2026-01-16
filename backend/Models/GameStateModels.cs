using System.Text.Json.Serialization;

namespace FKarribatecofficerpg.Api.Models;

/// <summary>
/// Game state request for saving
/// </summary>
public class GameStateSaveRequest
{
    [JsonPropertyName("positionX")]
    public double PositionX { get; set; }
    
    [JsonPropertyName("positionY")]
    public double PositionY { get; set; }
    
    [JsonPropertyName("currentZone")]
    public string CurrentZone { get; set; } = "lobby";
    
    [JsonPropertyName("level")]
    public int Level { get; set; }
    
    [JsonPropertyName("exp")]
    public int Exp { get; set; }
    
    [JsonPropertyName("gold")]
    public int Gold { get; set; }
    
    [JsonPropertyName("currentHP")]
    public int CurrentHP { get; set; }
    
    [JsonPropertyName("maxHP")]
    public int MaxHP { get; set; }
    
    [JsonPropertyName("logic")]
    public int Logic { get; set; }
    
    [JsonPropertyName("resilience")]
    public int Resilience { get; set; }
    
    [JsonPropertyName("charisma")]
    public int Charisma { get; set; }
    
    [JsonPropertyName("defeatedBosses")]
    public string DefeatedBosses { get; set; } = "[]"; // JSON array
    
    [JsonPropertyName("playTime")]
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
