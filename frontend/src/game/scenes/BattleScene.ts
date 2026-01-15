import Phaser from 'phaser';
import { EnemyData } from '../data/enemies';
import { PlayerStats, shouldLevelUp, levelUpStats } from '../data/gameState';

enum BattleState {
  INTRO,
  PLAYER_TURN,
  PLAYER_ACTION,
  ENEMY_TURN,
  ENEMY_ACTION,
  VICTORY,
  DEFEAT
}

interface ActionButton {
  button: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  action: string;
}

/**
 * BattleScene - Turn-based combat with logical argument actions
 */
export default class BattleScene extends Phaser.Scene {
  private enemy!: EnemyData;
  private enemyHP!: number;
  private enemySprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Sprite;
  
  private state: BattleState = BattleState.INTRO;
  private actionButtons: ActionButton[] = [];
  private selectedAction = 0;
  
  private returnPosition!: { x: number; y: number };
  private returnZone!: string;
  private isBossBattle = false;
  
  private messageText!: Phaser.GameObjects.Text;
  private enemyHPBar!: Phaser.GameObjects.Graphics;
  private playerHPBar!: Phaser.GameObjects.Graphics;
  
  private playerStats!: PlayerStats;

  constructor() {
    super('BattleScene');
  }

  init(data: any) {
    this.enemy = data.enemy;
    this.enemyHP = this.enemy.maxHP;
    this.returnPosition = data.returnPosition;
    this.returnZone = data.currentZone;
    this.isBossBattle = data.isBossBattle || false;
    
    this.playerStats = { ...this.registry.get('playerStats') };
  }

  create() {
    console.log('BattleScene.create() called with enemy:', this.enemy);
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Battle background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);
    
    // Enemy sprite (top)
    this.enemySprite = this.add.image(width / 2, 150, this.enemy.spriteKey);
    this.enemySprite.setScale(2);
    
    // Enemy HP bar
    this.add.text(width / 2, 250, `${this.enemy.displayName}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const enemyHPBg = this.add.graphics();
    enemyHPBg.fillStyle(0x330000, 1);
    enemyHPBg.fillRoundedRect(width / 2 - 150, 280, 300, 25, 4);
    
    this.enemyHPBar = this.add.graphics();
    
    // Player sprite (bottom)
    this.playerSprite = this.add.sprite(width / 2, 400, 'player');
    this.playerSprite.play('player-idle-down');
    this.playerSprite.setScale(2);
    
    // Player HP bar
    this.add.text(width / 2, 470, 'YOU', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#0066CC',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const playerHPBg = this.add.graphics();
    playerHPBg.fillStyle(0x003300, 1);
    playerHPBg.fillRoundedRect(width / 2 - 150, 495, 300, 25, 4);
    
    this.playerHPBar = this.add.graphics();
    
    // Message box
    const messageBg = this.add.graphics();
    messageBg.fillStyle(0x000000, 0.9);
    messageBg.fillRoundedRect(50, height - 180, width - 100, 80, 8);
    messageBg.lineStyle(2, 0x0066CC);
    messageBg.strokeRoundedRect(50, height - 180, width - 100, 80, 8);
    
    this.messageText = this.add.text(70, height - 160, '', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
      wordWrap: { width: width - 140 }
    });
    
    // Action menu
    this.createActionMenu();
    
    // Update HP bars
    this.updateHPBars();
    
    // Start battle
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.time.delayedCall(500, () => this.startBattle());
  }

  private startBattle() {
    console.log('BattleScene.startBattle() - Setting state to INTRO');
    this.state = BattleState.INTRO;
    this.showMessage(this.enemy.introText);
    
    this.time.delayedCall(2000, () => {
      console.log('BattleScene - Changing to PLAYER_TURN');
      this.state = BattleState.PLAYER_TURN;
      this.showMessage('What will you do?');
      this.showActionMenu();
    });
  }
  
  private createActionMenu() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const actions = [
      { name: 'ARGUE', desc: 'Present logical argument (25 dmg)' },
      { name: 'DEFLECT', desc: 'Redirect conversation (18 dmg)' },
      { name: 'EVIDENCE', desc: 'Present facts (33 dmg, high accuracy)' },
      { name: 'PERSUADE', desc: 'Emotional appeal (18 dmg, may confuse)' }
    ];
    
    const buttonWidth = 160;
    const buttonHeight = 50;
    const spacing = 10;
    // Center the 2x2 grid of buttons
    const totalWidth = buttonWidth * 2 + spacing;
    const startX = (width - totalWidth) / 2 + buttonWidth / 2;
    const startY = height - 80;
    
    actions.forEach((action, index) => {
      const x = startX + (index % 2) * (buttonWidth + spacing);
      const y = startY + Math.floor(index / 2) * (buttonHeight + spacing);
      
      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x0066CC, 0.8);
      button.setStrokeStyle(2, 0xffffff);
      button.setInteractive();
      button.setVisible(false);
      
      const text = this.add.text(x, y, action.name, {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      text.setVisible(false);
      
      button.on('pointerover', () => {
        button.setFillStyle(0x0088EE, 1);
        this.showMessage(action.desc);
      });
      
      button.on('pointerout', () => {
        button.setFillStyle(0x0066CC, 0.8);
      });
      
      button.on('pointerdown', () => {
        this.selectAction(action.name);
      });
      
      this.actionButtons.push({ button, text, action: action.name });
    });
  }
  
  private showActionMenu() {
    this.actionButtons.forEach(({ button, text }) => {
      button.setVisible(true);
      text.setVisible(true);
    });
  }
  
  private hideActionMenu() {
    this.actionButtons.forEach(({ button, text }) => {
      button.setVisible(false);
      text.setVisible(false);
    });
  }
  
  private selectAction(action: string) {
    if (this.state !== BattleState.PLAYER_TURN) return;
    
    this.hideActionMenu();
    this.state = BattleState.PLAYER_ACTION;
    this.executePlayerAction(action);
  }
  
  private executePlayerAction(action: string) {
    this.showMessage(`You used ${action}!`);
    
    // Player attack animation
    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y - 20,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
    
    this.time.delayedCall(500, () => {
      const damage = this.calculateDamage(action, this.playerStats, this.enemy);
      this.enemyHP -= damage;
      
      // Show damage
      this.showDamageNumber(damage, this.enemySprite.x, this.enemySprite.y);
      
      // Enemy hit animation
      this.tweens.add({
        targets: this.enemySprite,
        x: this.enemySprite.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
      
      this.updateHPBars();
      
      this.time.delayedCall(1000, () => {
        if (this.enemyHP <= 0) {
          this.victory();
        } else {
          this.enemyTurn();
        }
      });
    });
  }
  
  private enemyTurn() {
    this.state = BattleState.ENEMY_TURN;
    this.showMessage(`${this.enemy.displayName} prepares to counter-argue...`);
    
    this.time.delayedCall(1500, () => {
      this.state = BattleState.ENEMY_ACTION;
      this.executeEnemyAction();
    });
  }
  
  private executeEnemyAction() {
    const actions = ['argues back', 'challenges your logic', 'presents counter-evidence'];
    const actionText = actions[Math.floor(Math.random() * actions.length)];
    
    this.showMessage(`${this.enemy.displayName} ${actionText}!`);
    
    // Enemy attack animation
    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemySprite.y + 20,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
    
    this.time.delayedCall(500, () => {
      const damage = this.calculateDamage('ARGUE', this.enemy, this.playerStats);
      this.playerStats.currentHP -= damage;
      
      // Update registry
      this.registry.set('playerStats', this.playerStats);
      
      // Show damage
      this.showDamageNumber(damage, this.playerSprite.x, this.playerSprite.y);
      
      // Player hit animation
      this.tweens.add({
        targets: this.playerSprite,
        x: this.playerSprite.x - 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
      
      this.updateHPBars();
      
      // Show damage taken in UI
      const uiScene = this.scene.get('UIScene') as any;
      if (uiScene && uiScene.showDamageTaken) {
        uiScene.showDamageTaken(damage);
      }
      
      this.time.delayedCall(1000, () => {
        if (this.playerStats.currentHP <= 0) {
          this.defeat();
        } else {
          this.state = BattleState.PLAYER_TURN;
          this.showMessage('What will you do?');
          this.showActionMenu();
        }
      });
    });
  }
  
  private calculateDamage(action: string, attacker: any, defender: any): number {
    const baseDamage: Record<string, number> = {
      'ARGUE': 25,
      'DEFLECT': 18,
      'EVIDENCE': 33,
      'PERSUADE': 18
    };
    
    const base = baseDamage[action] || 20;
    const attackBonus = Math.floor(attacker.logic / 10);
    const defenseReduction = Math.floor(defender.resilience / 15);
    const randomFactor = Phaser.Math.Between(-5, 5);
    
    return Math.max(1, base + attackBonus - defenseReduction + randomFactor);
  }
  
  private victory() {
    this.state = BattleState.VICTORY;
    this.hideActionMenu();
    
    // Enemy defeated animation
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.showMessage(this.enemy.defeatText);
    
    this.time.delayedCall(2000, () => {
      // Award rewards
      this.playerStats.exp += this.enemy.expReward;
      this.playerStats.gold += this.enemy.goldReward;
      
      this.showMessage(`Victory! Gained ${this.enemy.expReward} XP and ${this.enemy.goldReward} gold!`);
      
      // Check for level up
      if (shouldLevelUp(this.playerStats)) {
        this.time.delayedCall(2000, () => this.handleLevelUp());
      } else {
        this.registry.set('playerStats', this.playerStats);
        this.time.delayedCall(2000, () => this.endBattle());
      }
    });
  }
  
  private handleLevelUp() {
    this.playerStats = levelUpStats(this.playerStats);
    this.registry.set('playerStats', this.playerStats);
    
    this.showMessage(`LEVEL UP! You are now level ${this.playerStats.level}!`);
    
    const uiScene = this.scene.get('UIScene') as any;
    if (uiScene && uiScene.showLevelUp) {
      uiScene.showLevelUp(this.playerStats.level);
    }
    
    this.time.delayedCall(3000, () => this.endBattle());
  }
  
  private defeat() {
    this.state = BattleState.DEFEAT;
    this.hideActionMenu();
    
    // Player defeated animation
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.showMessage('You were overwhelmed by their arguments...');
    
    this.time.delayedCall(2000, () => {
      // Penalty
      this.playerStats.gold = Math.floor(this.playerStats.gold * 0.5);
      this.playerStats.currentHP = this.playerStats.maxHP; // Respawn with full HP
      this.registry.set('playerStats', this.playerStats);
      
      this.showMessage(`You lost half your gold. Respawning at lobby...`);
      
      this.time.delayedCall(2000, () => {
        this.autoSave();
        
        // Return to lobby
        this.cameras.main.fade(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('OfficeScene', {
            spawnPosition: { x: 400, y: 300 }, // Lobby
            currentZone: 'lobby'
          });
        });
      });
    });
  }
  
  private endBattle() {
    // If boss, mark as defeated
    if (this.isBossBattle) {
      const defeatedBosses: string[] = this.registry.get('defeatedBosses') || [];
      defeatedBosses.push(this.enemy.id);
      this.registry.set('defeatedBosses', defeatedBosses);
      
      // Check if all bosses defeated (game over)
      if (defeatedBosses.length >= 3) {
        this.autoSave();
        this.cameras.main.fade(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameOverScene');
        });
        return;
      }
    }
    
    // Auto-save
    this.autoSave();
    
    // Return to office
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('OfficeScene', {
        spawnPosition: this.returnPosition,
        currentZone: this.returnZone
      });
    });
  }
  
  private updateHPBars() {
    const width = this.cameras.main.width;
    
    // Enemy HP
    const enemyHPPercent = Math.max(0, this.enemyHP / this.enemy.maxHP);
    this.enemyHPBar.clear();
    
    let enemyColor = 0xFF0000;
    if (enemyHPPercent > 0.5) enemyColor = 0xFF6600;
    if (enemyHPPercent > 0.75) enemyColor = 0xFFFF00;
    
    this.enemyHPBar.fillStyle(enemyColor, 1);
    this.enemyHPBar.fillRoundedRect(width / 2 - 150, 280, 300 * enemyHPPercent, 25, 4);
    
    // Player HP
    const playerHPPercent = Math.max(0, this.playerStats.currentHP / this.playerStats.maxHP);
    this.playerHPBar.clear();
    
    let playerColor = 0x00FF00;
    if (playerHPPercent < 0.5) playerColor = 0xFFFF00;
    if (playerHPPercent < 0.25) playerColor = 0xFF0000;
    
    this.playerHPBar.fillStyle(playerColor, 1);
    this.playerHPBar.fillRoundedRect(width / 2 - 150, 495, 300 * playerHPPercent, 25, 4);
  }
  
  private showMessage(text: string) {
    this.messageText.setText(text);
  }
  
  private showDamageNumber(damage: number, x: number, y: number) {
    const damageText = this.add.text(x, y, `-${damage}`, {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#FF0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }
  
  private autoSave() {
    const gameAPI = this.registry.get('gameAPI');
    if (gameAPI) {
      gameAPI.saveGame({
        position: this.returnPosition,
        currentZone: this.returnZone,
        playerStats: this.playerStats,
        defeatedBosses: this.registry.get('defeatedBosses'),
        playTime: this.registry.get('playTime')
      });
    }
  }
}
