import Phaser from 'phaser';
import { getRandomEnemy, getBossEnemy } from '../data/enemies';
import { PlayerStats } from '../data/gameState';

/**
 * OfficeScene - Main exploration scene with grid-based movement
 * Handles office navigation, random encounters, and Break room healing
 */
export default class OfficeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private map!: Phaser.Tilemaps.Tilemap;
  
  // Movement
  private readonly tileSize = 32;
  private isMoving = false;
  private currentDirection = 'down';
  
  // Encounters
  private stepCount = 0;
  private encounterThreshold = 10;
  private currentZone = 'lobby';
  private inEncounterZone = false;
  private enemies: Phaser.Physics.Arcade.Sprite[] = [];

  constructor() {
    super('OfficeScene');
  }

  init(data: any) {
    // Restore position if returning from battle
    if (data.spawnPosition) {
      this.registry.set('spawnPosition', data.spawnPosition);
    }
    if (data.currentZone) {
      this.currentZone = data.currentZone;
    }
  }

  create() {
    // Try to create tilemap, fallback to simple map if assets missing
    if (this.textures.exists('office-tiles') && this.cache.tilemap.exists('office-map')) {
      this.createTilemapScene();
    } else {
      console.log('Assets not loaded, using fallback map');
      this.createFallbackMap();
    }
  }
  
  private createTilemapScene() {
    // Create tilemap
    this.map = this.make.tilemap({ key: 'office-map' });
    const tileset = this.map.addTilesetImage('office-tileset', 'office-tiles');
    
    if (!tileset) {
      console.error('Failed to load tileset');
      this.createFallbackMap();
      return;
    }
    
    // Create layers
    const groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const decorLayer = this.map.createLayer('Decorations', tileset, 0, 0);
    
    // Set collision on walls
    if (wallsLayer) {
      wallsLayer.setCollisionByProperty({ collides: true });
    }
    
    // Create player
    const spawnPos = this.registry.get('spawnPosition') || { x: 400, y: 300 };
    this.player = this.physics.add.sprite(spawnPos.x, spawnPos.y, 'player');
    this.player.setDepth(10);
    this.player.play('player-idle-down');
    
    // Collision with walls
    if (wallsLayer) {
      this.physics.add.collider(this.player, wallsLayer);
    }
    
    // Camera follows player
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    
    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Setup zones from tilemap object layer
    this.setupEncounterZones();
    this.setupInteractables();
    
    // Random encounter threshold (10 ± 5 steps)
    this.encounterThreshold = 10 + Phaser.Math.Between(-5, 5);
  }

  update() {
    if (this.isMoving) return;
    
    // Grid-based movement
    if (this.cursors.left.isDown) {
      this.movePlayer(-1, 0, 'left');
    } else if (this.cursors.right.isDown) {
      this.movePlayer(1, 0, 'right');
    } else if (this.cursors.up.isDown) {
      this.movePlayer(0, -1, 'up');
    } else if (this.cursors.down.isDown) {
      this.movePlayer(0, 1, 'down');
    }
    
    // Interact key for Break room healing and boss doors
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.handleInteraction();
    }
  }
  
  private movePlayer(dx: number, dy: number, direction: string) {
    const targetX = this.player.x + dx * this.tileSize;
    const targetY = this.player.y + dy * this.tileSize;
    
    // Check collision - only if using tilemap
    if (this.map) {
      const tile = this.map.getTileAtWorldXY(targetX, targetY, false, undefined, 'Walls');
      if (tile && tile.properties.collides) {
        return;
      }
    } else {
      // Simple bounds check for fallback map
      if (targetX < 32 || targetX > 768 || targetY < 32 || targetY > 568) {
        return;
      }
    }
    
    this.isMoving = true;
    this.currentDirection = direction;
    
    // Play walking animation
    this.player.play(`player-walk-${direction}`);
    
    // Tween to new position
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 150,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.player.play(`player-idle-${direction}`);
        this.afterMove();
      }
    });
  }
  
  private afterMove() {
    // Update current zone
    this.updateCurrentZone();
    
    // Check for random encounter
    if (this.inEncounterZone) {
      this.stepCount++;
      
      if (this.stepCount >= this.encounterThreshold) {
        const encounterChance = Phaser.Math.FloatBetween(0, 1);
        
        if (encounterChance <= 0.30) { // 30% chance
          this.triggerRandomEncounter();
        } else {
          // Reset counter if encounter didn't trigger
          this.stepCount = 0;
          this.encounterThreshold = 10 + Phaser.Math.Between(-5, 5);
        }
      }
    }
  }
  
  private updateCurrentZone() {
    // Skip zone detection if no tilemap
    if (!this.map) {
      this.inEncounterZone = true; // In fallback mode, always allow encounters
      return;
    }
    
    const tile = this.map.getTileAtWorldXY(this.player.x, this.player.y, false, undefined, 'Zones');
    
    if (tile && tile.properties.zone) {
      this.currentZone = tile.properties.zone;
      this.inEncounterZone = tile.properties.zone !== 'lobby' && tile.properties.zone !== 'breakroom';
    } else {
      this.inEncounterZone = false;
    }
  }
  
  private triggerRandomEncounter() {
    this.stepCount = 0;
    this.encounterThreshold = 10 + Phaser.Math.Between(-5, 5); // Reset threshold
    
    let enemy;
    if (this.currentZone === 'finance' || this.currentZone === 'hospitality' || this.currentZone === 'research') {
      enemy = getRandomEnemy(this.currentZone);
    } else {
      return; // No encounters in other zones
    }
    
    // Fade out and transition to battle
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BattleScene', {
        enemy: enemy,
        returnPosition: { x: this.player.x, y: this.player.y },
        currentZone: this.currentZone
      });
    });
  }
  
  private handleInteraction() {
    // Skip interaction if no tilemap
    if (!this.map) {
      return;
    }
    
    // Check what's at player position
    const tile = this.map.getTileAtWorldXY(this.player.x, this.player.y, false, undefined, 'Zones');
    
    if (tile && tile.properties.zone === 'breakroom') {
      this.healPlayer();
    } else if (tile && tile.properties.zone && tile.properties.zone.includes('boss')) {
      this.enterBossRoom(tile.properties.zone);
    }
  }
  
  private healPlayer() {
    const stats: PlayerStats = this.registry.get('playerStats');
    
    if (stats.currentHP < stats.maxHP) {
      stats.currentHP = stats.maxHP;
      this.registry.set('playerStats', stats);
      
      // Show heal notification
      const healText = this.add.text(this.player.x, this.player.y - 50, 'HP Restored!', {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#00FF00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: healText,
        y: this.player.y - 100,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => healText.destroy()
      });
      
      // Auto-save after healing
      this.autoSave();
    }
  }
  
  private enterBossRoom(bossZone: string) {
    // Extract zone name (e.g., 'boss-finance' -> 'finance')
    const zone = bossZone.replace('boss-', '') as 'finance' | 'hospitality' | 'research';
    const boss = getBossEnemy(zone);
    
    // Check if boss already defeated
    const defeatedBosses: string[] = this.registry.get('defeatedBosses') || [];
    if (defeatedBosses.includes(boss.id)) {
      this.showMessage('This boss has already been defeated!');
      return;
    }
    
    // Confirm boss battle
    this.showBossWarning(boss.displayName, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene', {
          enemy: boss,
          returnPosition: { x: this.player.x, y: this.player.y },
          currentZone: this.currentZone,
          isBossBattle: true
        });
      });
    });
  }
  
  private showBossWarning(bossName: string, onConfirm: () => void) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const warningBg = this.add.rectangle(width / 2, height / 2, 400, 150, 0x000000, 0.9);
    warningBg.setScrollFactor(0);
    
    const warningText = this.add.text(width / 2, height / 2 - 30, `WARNING!\nBoss Battle: ${bossName}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FF0000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);
    
    const confirmText = this.add.text(width / 2, height / 2 + 40, 'Press E to enter, ESC to cancel', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);
    
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    const cleanup = () => {
      warningBg.destroy();
      warningText.destroy();
      confirmText.destroy();
      this.interactKey.off('down', confirmHandler);
      escKey.off('down', cancelHandler);
    };
    
    const confirmHandler = () => {
      cleanup();
      onConfirm();
    };
    
    const cancelHandler = () => {
      cleanup();
    };
    
    this.interactKey.once('down', confirmHandler);
    escKey.once('down', cancelHandler);
  }
  
  private showMessage(message: string) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const msgText = this.add.text(width / 2, height / 2, message, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0);
    
    this.time.delayedCall(2000, () => msgText.destroy());
  }
  
  private autoSave() {
    const gameAPI = this.registry.get('gameAPI');
    if (gameAPI) {
      gameAPI.saveGame({
        position: { x: this.player.x, y: this.player.y },
        currentZone: this.currentZone,
        playerStats: this.registry.get('playerStats'),
        defeatedBosses: this.registry.get('defeatedBosses'),
        playTime: this.registry.get('playTime')
      }).then(() => {
        const uiScene = this.scene.get('UIScene') as any;
        if (uiScene && uiScene.showSaveIndicator) {
          uiScene.showSaveIndicator();
        }
      });
    }
  }
  
  private setupEncounterZones() {
    // Zones will be defined in Tiled tilemap as tiles with properties
    // This is handled automatically by getTileAtWorldXY calls
  }
  
  private setupInteractables() {
    // Interactables (Break room, boss doors) are also defined in Tiled
    // Handled by handleInteraction() method
  }
  
  private createFallbackMap() {
    // Fallback if tilemap fails to load - create simple test area with grid
    const graphics = this.add.graphics();
    graphics.setScrollFactor(0); // Don't scroll with camera
    
    // Draw floor
    graphics.fillStyle(0x2A9D8F, 1); // Teal floor
    graphics.fillRect(0, 0, 800, 600);
    
    // Draw grid
    graphics.lineStyle(1, 0x1F7A6A, 0.3);
    for (let x = 0; x < 800; x += 32) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 32) {
      graphics.lineBetween(0, y, 800, y);
    }
    
    // Draw walls
    graphics.fillStyle(0x264653, 1); // Dark blue walls
    graphics.fillRect(0, 0, 800, 32); // Top
    graphics.fillRect(0, 0, 32, 600); // Left
    graphics.fillRect(768, 0, 32, 600); // Right
    graphics.fillRect(0, 568, 800, 32); // Bottom
    
    // Create player
    const spawnPos = this.registry.get('spawnPosition') || { x: 400, y: 300 };
    this.player = this.physics.add.sprite(spawnPos.x, spawnPos.y, 'player');
    this.player.setDepth(10);
    
    // Play animation safely
    if (this.anims.exists('player-idle-down')) {
      this.player.play('player-idle-down');
    }
    
    // DON'T follow player - keep camera static
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);
    
    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Initialize tracking for random encounters
    this.stepCount = 0;
    this.encounterThreshold = 10 + Phaser.Math.Between(-5, 5); // 10±5 steps
    this.currentZone = 'test-zone';
    this.inEncounterZone = true; // Always allow encounters in fallback mode
    
    // Spawn visible enemies
    this.spawnEnemies();
    
    // Info text
    const text = this.add.text(400, 100, 'DEMO MODE - Assets not loaded\nUse arrow keys to move\nTouch red enemies to battle!', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }
  
  private spawnEnemies() {
    // Spawn 5-8 enemies randomly in the arena
    const enemyCount = Phaser.Math.Between(5, 8);
    const enemySprites = [
      'enemy-auditor', 'enemy-budget-manager', 'enemy-tax-consultant',
      'enemy-angry-customer', 'enemy-tour-operator', 'enemy-event-planner',
      'enemy-data-analyst', 'enemy-research-director', 'enemy-grant-writer'
    ];
    
    for (let i = 0; i < enemyCount; i++) {
      // Random position avoiding walls and player spawn
      const x = Phaser.Math.Between(64, 736);
      const y = Phaser.Math.Between(64, 536);
      
      // Skip if too close to player
      if (Math.abs(x - 400) < 100 && Math.abs(y - 300) < 100) {
        continue;
      }
      
      const spriteKey = Phaser.Math.RND.pick(enemySprites);
      const enemy = this.physics.add.sprite(x, y, spriteKey);
      enemy.setScale(0.5); // Make them smaller
      enemy.setDepth(5);
      
      // Add simple patrol behavior
      this.tweens.add({
        targets: enemy,
        x: x + Phaser.Math.Between(-100, 100),
        y: y + Phaser.Math.Between(-100, 100),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.enemies.push(enemy);
      
      // Collision with player triggers battle
      this.physics.add.overlap(this.player, enemy, () => {
        this.triggerEnemyEncounter(enemy);
      });
    }
  }
  
  private triggerEnemyEncounter(enemySprite: Phaser.Physics.Arcade.Sprite) {
    // Remove the enemy sprite
    const index = this.enemies.indexOf(enemySprite);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
    enemySprite.destroy();
    
    // Trigger battle with random enemy from current zone
    const enemy = getRandomEnemy(this.currentZone);
    
    if (!enemy) {
      console.error('No enemies found for zone:', this.currentZone);
      return;
    }
    
    console.log('Starting battle with:', enemy.displayName);
    
    // Disable player input
    this.isMoving = true;
    
    // Fade out and transition to battle
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('Transitioning to BattleScene');
      this.scene.start('BattleScene', {
        enemy: enemy,
        returnPosition: { x: this.player.x, y: this.player.y },
        currentZone: this.currentZone
      });
    });
  }
}