import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import LevelSelectScene from './scenes/LevelSelectScene';
import OfficeScene from './scenes/OfficeScene';
import KiellandScene from './scenes/KiellandScene';
import BattleScene from './scenes/BattleScene';
import UIScene from './scenes/UIScene';
import GameOverScene from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  pixelArt: true, // CRITICAL for SNES aesthetic - crisp pixel rendering
  roundPixels: true,
  antialias: false,
  backgroundColor: '#000000',
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Top-down view, no gravity
      debug: false // Set to true for collision debugging
    }
  },
  
  scene: [
    PreloadScene,     // Load all game assets
    LevelSelectScene, // Choose level/map
    OfficeScene,      // Arribatec Office exploration
    KiellandScene,    // Alexander Kiellands plass exploration
    BattleScene,      // Turn-based combat
    UIScene,          // HUD overlay (HP, level, gold)
    GameOverScene     // Victory screen when all bosses defeated
  ],
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1600,
      height: 1200
    }
  }
};

export default config;
