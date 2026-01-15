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
  private currentZone = 'finance'; // Default to finance zone
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
      // Simple bounds check for fallback map (1600x1280)
      if (targetX < 40 || targetX > 1560 || targetY < 40 || targetY > 1240) {
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
    // Skip zone detection if no tilemap - use position-based zones
    if (!this.map) {
      const x = this.player.x;
      const y = this.player.y;
      
      // Check which zone player is in based on coordinates
      if (x >= 900 && x <= 1500 && y >= 800 && y <= 1200) {
        this.currentZone = 'finance';
        this.inEncounterZone = true;
      } else if (x >= 500 && x <= 900 && y >= 900 && y <= 1200) {
        this.currentZone = 'hospitality';
        this.inEncounterZone = true;
      } else if (x >= 100 && x <= 600 && y >= 100 && y <= 500) {
        this.currentZone = 'research';
        this.inEncounterZone = true;
      } else if (x >= 600 && x <= 900 && y >= 500 && y <= 750) {
        this.currentZone = 'breakroom';
        this.inEncounterZone = false; // Safe zone
      } else {
        this.currentZone = 'corridor';
        this.inEncounterZone = false; // Corridors are safe
      }
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
    // Check if in break room for healing
    if (!this.map) {
      // Fallback: check break room coordinates
      const x = this.player.x;
      const y = this.player.y;
      
      if (x >= 600 && x <= 900 && y >= 500 && y <= 750) {
        this.healPlayer();
      }
      return;
    }
    
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
    // Create a larger office map based on the Arribatec floor plan
    const mapWidth = 1600;
    const mapHeight = 1280;
    
    const graphics = this.add.graphics();
    // Don't set scrollFactor - let it scroll with camera
    
    // Fill background (generic office floor)
    graphics.fillStyle(0xE8E8E8, 1);
    graphics.fillRect(0, 0, mapWidth, mapHeight);
    
    // FINANCE ZONE (Green - Bottom Right)
    graphics.fillStyle(0xC8E6C9, 0.7); // Light green
    graphics.fillRect(900, 800, 600, 400);
    
    // HOSPITALITY ZONE (Yellow - Bottom Center)
    graphics.fillStyle(0xFFF9C4, 0.7); // Light yellow
    graphics.fillRect(500, 900, 400, 300);
    
    // RESEARCH ZONE (Blue - Top and scattered meeting rooms)
    graphics.fillStyle(0xBBDEFB, 0.7); // Light blue
    graphics.fillRect(100, 100, 500, 400); // Top left area
    graphics.fillRect(800, 100, 400, 300); // Top right meeting rooms
    graphics.fillRect(100, 600, 300, 250); // Left side
    
    // BREAK ROOM (Red striped - Center, healing zone)
    graphics.fillStyle(0xFFCDD2, 1); // Light red
    graphics.fillRect(600, 500, 300, 250);
    graphics.lineStyle(4, 0xFF5252);
    for (let i = 0; i < 10; i++) {
      graphics.lineBetween(600 + i * 30, 500, 600 + i * 30 + 30, 750);
    }
    
    // Draw walls and corridors (dark gray)
    graphics.fillStyle(0x424242, 1);
    
    // Outer walls
    graphics.fillRect(0, 0, mapWidth, 20); // Top
    graphics.fillRect(0, 0, 20, mapHeight); // Left
    graphics.fillRect(mapWidth - 20, 0, 20, mapHeight); // Right
    graphics.fillRect(0, mapHeight - 20, mapWidth, 20); // Bottom
    
    // Interior walls (rooms)
    // Vertical corridors
    graphics.fillRect(600, 0, 15, 500); // Main vertical corridor
    graphics.fillRect(600, 750, 15, mapHeight - 750);
    
    // Horizontal corridors
    graphics.fillRect(0, 500, 600, 15);
    graphics.fillRect(0, 850, mapWidth, 15);
    
    // Meeting room walls
    graphics.fillRect(400, 100, 15, 200);
    graphics.fillRect(800, 400, 15, 200);
    
    // Desks (dark furniture) scattered in zones
    graphics.fillStyle(0x795548, 1); // Brown desks
    
    // Finance zone desks
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        graphics.fillRect(950 + j * 120, 850 + i * 100, 80, 40);
      }
    }
    
    // Hospitality zone desks
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        graphics.fillRect(550 + j * 100, 950 + i * 100, 70, 35);
      }
    }
    
    // Research zone desks
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        graphics.fillRect(150 + j * 100, 150 + i * 100, 70, 35);
      }
    }
    
    // Grid lines for visual clarity
    graphics.lineStyle(1, 0xCCCCCC, 0.3);
    for (let x = 0; x < mapWidth; x += 32) {
      graphics.lineBetween(x, 0, x, mapHeight);
    }
    for (let y = 0; y < mapHeight; y += 32) {
      graphics.lineBetween(0, y, mapWidth, y);
    }
    
    // Zone labels (scroll with world)
    this.add.text(1200, 1000, 'FINANCE', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#2E7D32',
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setDepth(5);
    
    this.add.text(650, 1050, 'HOSPITALITY', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#F57F17',
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setDepth(5);
    
    this.add.text(250, 250, 'RESEARCH', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#1565C0',
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setDepth(5);
    
    this.add.text(700, 600, '☕ BREAK ROOM\n(Heals HP)', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#C62828',
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 },
      align: 'center'
    }).setDepth(5).setOrigin(0.5);
    
    // Create player at entrance (bottom center)
    const spawnPos = this.registry.get('spawnPosition') || { x: 750, y: 1100 };
    this.player = this.physics.add.sprite(spawnPos.x, spawnPos.y, 'player');
    this.player.setDepth(10);
    
    // Play animation safely
    if (this.anims.exists('player-idle-down')) {
      this.player.play('player-idle-down');
    }
    
    // Camera follows player in larger map
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    
    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Initialize tracking for random encounters
    this.stepCount = 0;
    this.encounterThreshold = 10 + Phaser.Math.Between(-5, 5); // 10±5 steps
    this.currentZone = 'finance'; // Start in finance zone
    this.inEncounterZone = true;
    
    // Spawn visible enemies
    this.spawnEnemies();
    
    // Info text (fixed to camera)
    const text = this.add.text(400, 50, 'Arribatec Office - Use arrow keys to explore zones', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }
  
  private spawnEnemies() {
    // Spawn enemies in each zone
    const zones = [
      { name: 'finance', bounds: { x: 900, y: 800, width: 600, height: 400 }, count: 3 },
      { name: 'hospitality', bounds: { x: 500, y: 900, width: 400, height: 300 }, count: 3 },
      { name: 'research', bounds: { x: 100, y: 100, width: 500, height: 400 }, count: 3 }
    ];
    
    const enemyTypes = {
      finance: ['enemy-auditor', 'enemy-budget-manager', 'enemy-tax-consultant'],
      hospitality: ['enemy-angry-customer', 'enemy-tour-operator', 'enemy-event-planner'],
      research: ['enemy-data-analyst', 'enemy-research-director', 'enemy-grant-writer']
    };
    
    console.log('Spawning enemies across zones');
    
    zones.forEach(zone => {
      const zoneEnemies = enemyTypes[zone.name as keyof typeof enemyTypes];
      
      for (let i = 0; i < zone.count; i++) {
        const x = zone.bounds.x + Phaser.Math.Between(50, zone.bounds.width - 50);
        const y = zone.bounds.y + Phaser.Math.Between(50, zone.bounds.height - 50);
        
        const spriteKey = Phaser.Math.RND.pick(zoneEnemies);
        const enemy = this.physics.add.sprite(x, y, spriteKey);
        enemy.setScale(0.8);
        enemy.setDepth(5);
        
        // Make collision box much smaller - only the center of the sprite
        enemy.body!.setSize(32, 40); // Smaller hitbox (was 64x64)
        enemy.body!.setOffset(16, 12); // Center the hitbox on the sprite
        
        // Store zone info on enemy
        (enemy as any).zone = zone.name;
        
        // Add patrol behavior within zone
        this.tweens.add({
          targets: enemy,
          x: x + Phaser.Math.Between(-80, 80),
          y: y + Phaser.Math.Between(-80, 80),
          duration: Phaser.Math.Between(3000, 5000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        this.enemies.push(enemy);
        
        // Collision with player triggers battle
        this.physics.add.overlap(this.player, enemy, () => {
          console.log('Enemy collision detected!');
          this.triggerEnemyEncounter(enemy);
        }, undefined, this);
      }
    });
    
    console.log('Total enemies spawned:', this.enemies.length);
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