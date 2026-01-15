import Phaser from 'phaser';
import { PlayerStats } from '../data/gameState';

/**
 * UIScene - HUD overlay showing player stats (HP, Level, Gold, XP)
 * Runs concurrently with other scenes
 */
export default class UIScene extends Phaser.Scene {
  private hpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private expText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;
  private saveIndicator!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create() {
    const width = this.cameras.main.width;
    
    // HUD background panel (top-left)
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(10, 10, 250, 120, 8);
    panel.lineStyle(2, 0x0066CC); // Arribatec blue border
    panel.strokeRoundedRect(10, 10, 250, 120, 8);
    panel.setScrollFactor(0);
    
    // HP Bar
    const hpBarBg = this.add.graphics();
    hpBarBg.fillStyle(0x330000, 1);
    hpBarBg.fillRoundedRect(20, 25, 230, 20, 4);
    hpBarBg.setScrollFactor(0);
    
    this.hpBar = this.add.graphics();
    this.hpBar.setScrollFactor(0);
    
    // HP Text
    this.hpText = this.add.text(135, 27, 'HP: 100/100', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setScrollFactor(0);
    
    // Level
    this.levelText = this.add.text(20, 55, 'Level: 1', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#0066CC',
      fontStyle: 'bold'
    }).setScrollFactor(0);
    
    // Gold
    this.goldText = this.add.text(20, 75, 'Gold: 0', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFD700'
    }).setScrollFactor(0);
    
    // XP Progress
    this.expText = this.add.text(20, 95, 'XP: 0/100', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00'
    }).setScrollFactor(0);
    
    // Save indicator (top-right)
    this.saveIndicator = this.add.text(width - 20, 20, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setScrollFactor(0).setAlpha(0);
    
    // Update UI when stats change
    this.registry.events.on('changedata', this.updateUI, this);
    
    // Initial update
    this.updateUI();
  }
  
  private updateUI() {
    const stats: PlayerStats = this.registry.get('playerStats');
    
    if (!stats) return;
    
    // Update HP bar
    const hpPercent = stats.currentHP / stats.maxHP;
    this.hpBar.clear();
    
    // Color based on HP percentage
    let barColor = 0x00FF00; // Green
    if (hpPercent < 0.5) barColor = 0xFFFF00; // Yellow
    if (hpPercent < 0.25) barColor = 0xFF0000; // Red
    
    this.hpBar.fillStyle(barColor, 1);
    this.hpBar.fillRoundedRect(20, 25, 230 * hpPercent, 20, 4);
    
    // Update text
    this.hpText.setText(`HP: ${stats.currentHP}/${stats.maxHP}`);
    this.levelText.setText(`Level: ${stats.level}`);
    this.goldText.setText(`Gold: ${stats.gold}`);
    this.expText.setText(`XP: ${stats.exp}/${stats.nextLevelExp}`);
  }
  
  /**
   * Show "Game Saved" indicator
   */
  showSaveIndicator() {
    this.saveIndicator.setText('Game Saved');
    this.saveIndicator.setAlpha(1);
    
    this.tweens.add({
      targets: this.saveIndicator,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      ease: 'Power2'
    });
  }
  
  /**
   * Show damage taken animation
   */
  showDamageTaken(damage: number) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const damageText = this.add.text(width / 2, height / 2, `-${damage}`, {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#FF0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);
    
    this.tweens.add({
      targets: damageText,
      y: height / 2 - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }
  
  /**
   * Show level up notification
   */
  showLevelUp(newLevel: number) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const levelUpText = this.add.text(width / 2, height / 2, `LEVEL UP!\nLevel ${newLevel}`, {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    
    this.tweens.add({
      targets: levelUpText,
      alpha: 1,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      hold: 1000,
      ease: 'Bounce',
      onComplete: () => levelUpText.destroy()
    });
  }
}
