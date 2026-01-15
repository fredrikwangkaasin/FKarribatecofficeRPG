import Phaser from 'phaser';
import { PlayerStats } from '../data/gameState';

/**
 * GameOverScene - Victory screen shown when all 3 bosses are defeated
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Get final stats
    const stats: PlayerStats = this.registry.get('playerStats');
    const playTime: number = this.registry.get('playTime') || 0;
    const defeatedBosses: string[] = this.registry.get('defeatedBosses') || [];
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0066CC);
    
    // Victory title
    const title = this.add.text(width / 2, 80, 'VICTORY!', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 150, 'All Office Clients Defeated!', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Stats panel
    const panelY = 220;
    const lineHeight = 35;
    
    this.add.text(width / 2, panelY, 'GAME STATISTICS', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Final level
    this.add.text(width / 2, panelY + lineHeight * 1, `Final Level: ${stats.level}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Gold collected
    this.add.text(width / 2, panelY + lineHeight * 2, `Gold Collected: ${stats.gold}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#FFD700'
    }).setOrigin(0.5);
    
    // Stats
    this.add.text(width / 2, panelY + lineHeight * 3, `Logic: ${stats.logic} | Resilience: ${stats.resilience} | Charisma: ${stats.charisma}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#00FF00'
    }).setOrigin(0.5);
    
    // Play time
    const hours = Math.floor(playTime / 3600);
    const minutes = Math.floor((playTime % 3600) / 60);
    const seconds = playTime % 60;
    const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    
    this.add.text(width / 2, panelY + lineHeight * 4, `Time Played: ${timeString}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Bosses defeated
    this.add.text(width / 2, panelY + lineHeight * 5.5, 'BOSSES DEFEATED:', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#FF6600',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const bossNames: Record<string, string> = {
      'cfo-boss': '✓ CFO (Finance)',
      'hotel-manager-boss': '✓ Hotel Manager (Hospitality)',
      'lead-scientist-boss': '✓ Lead Scientist (Research)'
    };
    
    let bossY = panelY + lineHeight * 6.5;
    defeatedBosses.forEach(bossId => {
      const bossName = bossNames[bossId] || `✓ ${bossId}`;
      this.add.text(width / 2, bossY, bossName, {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#00FF00'
      }).setOrigin(0.5);
      bossY += 25;
    });
    
    // Thank you message
    this.add.text(width / 2, height - 100, 'Thank you for playing!', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height - 60, 'Press SPACE to return to office', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Animate title
    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Handle input
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', () => {
      this.returnToOffice();
    });
    
    // Fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
  
  private returnToOffice() {
    // Player can continue exploring after victory
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('OfficeScene', {
        spawnPosition: { x: 400, y: 300 }, // Lobby
        currentZone: 'lobby'
      });
    });
  }
}
