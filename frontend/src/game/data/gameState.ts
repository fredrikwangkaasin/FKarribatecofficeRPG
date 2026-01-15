/**
 * Player stats and game state types
 */

export interface PlayerStats {
  // Core attributes
  level: number;
  exp: number;
  nextLevelExp: number; // XP needed for next level
  gold: number;
  
  // Battle stats
  currentHP: number;
  maxHP: number;
  logic: number;      // Attack stat (affects damage dealt)
  resilience: number; // Defense stat (reduces damage taken)
  charisma: number;   // Special stat (affects persuade success)
}

export interface GameState {
  // Player position
  position: { x: number; y: number };
  currentZone: string;
  
  // Player stats
  playerStats: PlayerStats;
  
  // Progress tracking
  defeatedBosses: string[]; // Array of defeated boss IDs
  
  // Metadata
  playTime: number; // Total play time in seconds
  lastSaved: string; // ISO timestamp
}

/**
 * Calculate XP required for next level (exponential curve)
 * Level 1→2: 100 XP
 * Level 2→3: 150 XP
 * Level 3→4: 225 XP
 * etc.
 */
export function calculateNextLevelExp(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Create initial game state for new players
 */
export function createNewGameState(): GameState {
  return {
    position: { x: 400, y: 300 }, // Lobby spawn point
    currentZone: 'lobby',
    playerStats: {
      level: 1,
      exp: 0,
      nextLevelExp: calculateNextLevelExp(1),
      gold: 0,
      currentHP: 100,
      maxHP: 100,
      logic: 10,
      resilience: 8,
      charisma: 7
    },
    defeatedBosses: [],
    playTime: 0,
    lastSaved: new Date().toISOString()
  };
}

/**
 * Level up calculation - returns new stats after level up
 */
export function levelUpStats(currentStats: PlayerStats): PlayerStats {
  const newLevel = currentStats.level + 1;
  const newMaxHP = currentStats.maxHP + 10;
  
  return {
    ...currentStats,
    level: newLevel,
    exp: currentStats.exp - currentStats.nextLevelExp, // Carry over excess XP
    nextLevelExp: calculateNextLevelExp(newLevel),
    maxHP: newMaxHP,
    currentHP: newMaxHP, // Full heal on level up
    logic: currentStats.logic + 2,
    resilience: currentStats.resilience + 1,
    charisma: currentStats.charisma + 1
  };
}

/**
 * Check if player should level up
 */
export function shouldLevelUp(stats: PlayerStats): boolean {
  return stats.exp >= stats.nextLevelExp && stats.level < 20; // Max level 20
}
