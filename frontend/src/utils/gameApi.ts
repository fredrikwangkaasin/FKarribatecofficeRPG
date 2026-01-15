import { createApiClient } from './api';
import { GameState } from '../game/data/gameState';

/**
 * Game API client for backend communication
 * Handles save/load game state with automatic tenant isolation
 */
export class GameAPI {
  private apiClient;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.apiClient = createApiClient();
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Save game state to backend (tenant-isolated)
   */
  async saveGame(gameState: Partial<GameState>): Promise<void> {
    try {
      const response = await this.apiClient.post('/gamestate/save', {
        positionX: gameState.position?.x || 0,
        positionY: gameState.position?.y || 0,
        currentZone: gameState.currentZone || 'lobby',
        level: gameState.playerStats?.level || 1,
        exp: gameState.playerStats?.exp || 0,
        gold: gameState.playerStats?.gold || 0,
        currentHP: gameState.playerStats?.currentHP || 100,
        maxHP: gameState.playerStats?.maxHP || 100,
        logic: gameState.playerStats?.logic || 10,
        resilience: gameState.playerStats?.resilience || 8,
        charisma: gameState.playerStats?.charisma || 7,
        defeatedBosses: JSON.stringify(gameState.defeatedBosses || []),
        playTime: gameState.playTime || 0
      });
      
      console.log('Game saved to backend successfully:', response.data);
    } catch (error) {
      // Silently fallback to localStorage
      console.log('Backend unavailable, saving to localStorage');
      this.saveToLocalStorage(gameState);
    }
  }

  /**
   * Load game state from backend (tenant-isolated)
   */
  async loadGame(): Promise<GameState | null> {
    try {
      const response = await this.apiClient.get('/gamestate');
      
      if (response.data && response.data.level) {
        // Parse saved game state
        const data = response.data;
        
        return {
          position: {
            x: data.positionX,
            y: data.positionY
          },
          currentZone: data.currentZone,
          playerStats: {
            level: data.level,
            exp: data.exp,
            nextLevelExp: this.calculateNextLevelExp(data.level),
            gold: data.gold,
            currentHP: data.currentHP,
            maxHP: data.maxHP,
            logic: data.logic,
            resilience: data.resilience,
            charisma: data.charisma
          },
          defeatedBosses: JSON.parse(data.defeatedBosses || '[]'),
          playTime: data.playTime || 0,
          lastSaved: data.lastSaved
        };
      }
      
      return null; // No save found
    } catch (error: any) {
      // Silently fallback to localStorage for any backend error
      console.log('Backend unavailable, using localStorage');
      return this.loadFromLocalStorage();
    }
  }

  /**
   * Reset game state (delete save)
   */
  async resetGame(): Promise<void> {
    try {
      await this.apiClient.post('/gamestate/reset');
      localStorage.removeItem('gameState_backup');
      console.log('Game reset successfully');
    } catch (error) {
      console.error('Failed to reset game:', error);
      throw error;
    }
  }

  /**
   * Fallback: Save to localStorage
   */
  private saveToLocalStorage(gameState: Partial<GameState>): void {
    try {
      localStorage.setItem('gameState_backup', JSON.stringify({
        ...gameState,
        timestamp: new Date().toISOString()
      }));
      console.log('Game saved to localStorage as backup');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Fallback: Load from localStorage
   */
  private loadFromLocalStorage(): GameState | null {
    try {
      const savedData = localStorage.getItem('gameState_backup');
      
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Loaded game from localStorage backup');
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Calculate XP needed for next level
   */
  private calculateNextLevelExp(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }
}
