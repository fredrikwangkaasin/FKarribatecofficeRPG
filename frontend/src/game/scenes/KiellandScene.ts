import Phaser from 'phaser';
import { getRandomEnemy, ENEMIES } from '../data/enemies';
import { PlayerStats } from '../data/gameState';

/**
 * KiellandScene - Alexander Kiellands plass in Oslo
 * A vibrant outdoor park area with cafes, the famous fountain, and city streets
 */
export default class KiellandScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  
  // Movement
  private readonly tileSize = 32;
  private isMoving = false;
  private currentDirection = 'down';
  
  // Encounters
  private stepCount = 0;
  private encounterThreshold = 10;
  private currentZone = 'park';
  private inEncounterZone = false;
  private enemies: Phaser.Physics.Arcade.Sprite[] = [];
  private inBattle = false;
  
  // Map dimensions
  private mapWidth = 1600;
  private mapHeight = 1200;

  constructor() {
    super('KiellandScene');
  }

  init(data: any) {
    this.inBattle = false;
    this.isMoving = false;
    
    if (data.spawnPosition) {
      this.registry.set('spawnPosition', data.spawnPosition);
    }
    if (data.currentZone) {
      this.currentZone = data.currentZone;
    }
  }

  create() {
    this.createKiellandMap();
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
    
    // Interact key for healing at cafe
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.handleInteraction();
    }
  }
  
  private movePlayer(dx: number, dy: number, direction: string) {
    const targetX = this.player.x + dx * this.tileSize;
    const targetY = this.player.y + dy * this.tileSize;
    
    // Check map bounds
    if (targetX < 40 || targetX > this.mapWidth - 40 || targetY < 40 || targetY > this.mapHeight - 40) {
      return;
    }
    
    // Check for collisions with buildings/obstacles
    if (this.checkCollision(targetX, targetY)) {
      return;
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
  
  private checkCollision(x: number, y: number): boolean {
    // Helper to check rectangle collision
    const inRect = (px: number, py: number, rx: number, ry: number, rw: number, rh: number) => {
      return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    };
    
    // Buildings (solid obstacles)
    // North side buildings
    if (inRect(x, y, 50, 50, 250, 180)) return true;
    if (inRect(x, y, 400, 50, 300, 150)) return true;
    if (inRect(x, y, 800, 50, 200, 180)) return true;
    if (inRect(x, y, 1100, 50, 250, 150)) return true;
    if (inRect(x, y, 1400, 50, 150, 180)) return true;
    
    // South side buildings
    if (inRect(x, y, 50, 950, 200, 200)) return true;
    if (inRect(x, y, 350, 1000, 250, 150)) return true;
    if (inRect(x, y, 700, 950, 200, 200)) return true;
    if (inRect(x, y, 1000, 1000, 200, 150)) return true;
    if (inRect(x, y, 1300, 950, 250, 200)) return true;
    
    // Fountain in center (circular obstacle approximated)
    const fountainX = 800;
    const fountainY = 600;
    const fountainRadius = 80;
    const dist = Math.sqrt((x - fountainX) ** 2 + (y - fountainY) ** 2);
    if (dist < fountainRadius) return true;
    
    // Park benches
    if (inRect(x, y, 500, 500, 60, 20)) return true;
    if (inRect(x, y, 1000, 500, 60, 20)) return true;
    if (inRect(x, y, 500, 700, 60, 20)) return true;
    if (inRect(x, y, 1000, 700, 60, 20)) return true;
    
    // Trees (circular obstacles)
    const trees = [
      { x: 300, y: 400, r: 25 },
      { x: 450, y: 350, r: 30 },
      { x: 1200, y: 400, r: 28 },
      { x: 1350, y: 350, r: 25 },
      { x: 300, y: 800, r: 30 },
      { x: 450, y: 850, r: 25 },
      { x: 1200, y: 800, r: 25 },
      { x: 1350, y: 850, r: 28 }
    ];
    
    for (const tree of trees) {
      const treeDist = Math.sqrt((x - tree.x) ** 2 + (y - tree.y) ** 2);
      if (treeDist < tree.r) return true;
    }
    
    return false;
  }
  
  private afterMove() {
    this.updateCurrentZone();
  }
  
  private updateCurrentZone() {
    const x = this.player.x;
    const y = this.player.y;
    
    // Define zones based on coordinates
    // Central park area
    if (x >= 400 && x <= 1200 && y >= 350 && y <= 850) {
      this.currentZone = 'park';
      this.inEncounterZone = true;
    }
    // North street (buildings area)
    else if (y < 350) {
      this.currentZone = 'north_street';
      this.inEncounterZone = true;
    }
    // South street (buildings area)
    else if (y > 850) {
      this.currentZone = 'south_street';
      this.inEncounterZone = true;
    }
    // West side
    else if (x < 400) {
      this.currentZone = 'west_cafe';
      this.inEncounterZone = false; // Safe zone - cafe area
    }
    // East side
    else if (x > 1200) {
      this.currentZone = 'east_shops';
      this.inEncounterZone = true;
    }
    else {
      this.currentZone = 'path';
      this.inEncounterZone = false;
    }
  }
  
  private handleInteraction() {
    const x = this.player.x;
    const y = this.player.y;
    
    // Check if near cafe (west side) for healing
    if (x < 400 && y >= 400 && y <= 800) {
      this.healPlayer();
    }
  }
  
  private healPlayer() {
    const stats: PlayerStats = this.registry.get('playerStats');
    
    if (stats.currentHP < stats.maxHP) {
      stats.currentHP = stats.maxHP;
      this.registry.set('playerStats', stats);
      
      const healText = this.add.text(this.player.x, this.player.y - 50, '☕ HP Restored at Cafe!', {
        fontSize: '20px',
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
      
      this.autoSave();
    }
  }
  
  private autoSave() {
    const gameAPI = this.registry.get('gameAPI');
    if (gameAPI) {
      gameAPI.saveGame({
        position: { x: this.player.x, y: this.player.y },
        currentZone: this.currentZone,
        playerStats: this.registry.get('playerStats'),
        defeatedBosses: this.registry.get('defeatedBosses'),
        playTime: this.registry.get('playTime'),
        level: 'kielland'
      }).then(() => {
        const uiScene = this.scene.get('UIScene') as any;
        if (uiScene && uiScene.showSaveIndicator) {
          uiScene.showSaveIndicator();
        }
      });
    }
  }
  
  private createKiellandMap() {
    const graphics = this.add.graphics();
    
    // === SKY GRADIENT (top portion) ===
    graphics.fillStyle(0x87CEEB);
    graphics.fillRect(0, 0, this.mapWidth, 250);
    
    // === MAIN GROUND - Cobblestone plaza style ===
    graphics.fillStyle(0xB8A088); // Sandy cobblestone color
    graphics.fillRect(0, 250, this.mapWidth, this.mapHeight - 250);
    
    // === PARK AREA (Central green space) ===
    // Main grass area
    graphics.fillStyle(0x4CAF50, 0.9);
    graphics.fillRect(350, 300, 900, 600);
    
    // Grass texture - darker patches
    graphics.fillStyle(0x388E3C, 0.5);
    for (let i = 0; i < 50; i++) {
      const gx = 380 + Math.random() * 840;
      const gy = 330 + Math.random() * 540;
      graphics.fillCircle(gx, gy, 10 + Math.random() * 20);
    }
    
    // === FOUNTAIN (The famous Alexander Kiellands plass fountain) ===
    const fountainX = 800;
    const fountainY = 600;
    
    // Outer ring - stone base
    graphics.fillStyle(0x808080);
    graphics.fillCircle(fountainX, fountainY, 85);
    
    // Water pool
    graphics.fillStyle(0x4682B4);
    graphics.fillCircle(fountainX, fountainY, 75);
    
    // Inner water (lighter)
    graphics.fillStyle(0x87CEEB, 0.7);
    graphics.fillCircle(fountainX, fountainY, 50);
    
    // Fountain center pedestal
    graphics.fillStyle(0x696969);
    graphics.fillCircle(fountainX, fountainY, 20);
    
    // Water spray effects
    graphics.fillStyle(0xADD8E6, 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const sprayX = fountainX + Math.cos(angle) * 35;
      const sprayY = fountainY + Math.sin(angle) * 35;
      graphics.fillEllipse(sprayX, sprayY, 8, 15);
    }
    
    // === PATHWAYS ===
    graphics.fillStyle(0xD2B48C); // Tan color for paths
    
    // Main horizontal path through park
    graphics.fillRect(0, 580, this.mapWidth, 40);
    
    // Vertical paths
    graphics.fillRect(350, 300, 30, 600); // West path
    graphics.fillRect(1220, 300, 30, 600); // East path
    
    // Diagonal paths to fountain
    graphics.lineStyle(25, 0xD2B48C);
    graphics.lineBetween(380, 320, 720, 540);
    graphics.lineBetween(1220, 320, 880, 540);
    graphics.lineBetween(380, 880, 720, 660);
    graphics.lineBetween(1220, 880, 880, 660);
    
    // === BUILDINGS (North side) ===
    // Building 1 - Apartment block
    graphics.fillStyle(0xCD853F); // Peru/tan
    graphics.fillRect(50, 50, 250, 180);
    graphics.fillStyle(0xD2691E);
    graphics.fillRect(50, 50, 250, 30); // Roof
    this.drawWindows(graphics, 70, 90, 4, 3, 45, 40);
    
    // Building 2 - Shop front
    graphics.fillStyle(0xF5DEB3); // Wheat
    graphics.fillRect(400, 50, 300, 150);
    graphics.fillStyle(0xDEB887);
    graphics.fillRect(400, 50, 300, 25);
    this.drawWindows(graphics, 420, 85, 5, 2, 50, 45);
    // Shop awning
    graphics.fillStyle(0xFF6347, 0.8);
    graphics.fillRect(420, 170, 80, 20);
    graphics.fillStyle(0x228B22, 0.8);
    graphics.fillRect(550, 170, 80, 20);
    
    // Building 3 - Corner building
    graphics.fillStyle(0xE6BE8A);
    graphics.fillRect(800, 50, 200, 180);
    graphics.fillStyle(0xC4A35A);
    graphics.fillRect(800, 50, 200, 30);
    this.drawWindows(graphics, 820, 90, 3, 3, 55, 40);
    
    // Building 4 - Modern building
    graphics.fillStyle(0xBDB76B);
    graphics.fillRect(1100, 50, 250, 150);
    graphics.fillStyle(0xA0A060);
    graphics.fillRect(1100, 50, 250, 25);
    this.drawWindows(graphics, 1120, 85, 4, 2, 55, 45);
    
    // Building 5 - Small shop
    graphics.fillStyle(0xF4A460);
    graphics.fillRect(1400, 50, 150, 180);
    this.drawWindows(graphics, 1420, 90, 2, 3, 50, 40);
    
    // === BUILDINGS (South side) ===
    // Building 6
    graphics.fillStyle(0xDAA520);
    graphics.fillRect(50, 950, 200, 200);
    this.drawWindows(graphics, 70, 980, 3, 3, 50, 50);
    
    // Building 7 - Cafe!
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(350, 1000, 250, 150);
    graphics.fillStyle(0xFF4500, 0.8);
    graphics.fillRect(360, 1120, 100, 25); // Awning
    // Cafe sign
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(380, 1030, 80, 30);
    
    // Building 8
    graphics.fillStyle(0xBC8F8F);
    graphics.fillRect(700, 950, 200, 200);
    this.drawWindows(graphics, 720, 980, 3, 3, 50, 50);
    
    // Building 9
    graphics.fillStyle(0xD2B48C);
    graphics.fillRect(1000, 1000, 200, 150);
    this.drawWindows(graphics, 1020, 1030, 3, 2, 55, 50);
    
    // Building 10
    graphics.fillStyle(0xC4A35A);
    graphics.fillRect(1300, 950, 250, 200);
    this.drawWindows(graphics, 1320, 980, 4, 3, 50, 50);
    
    // === TREES ===
    const trees = [
      { x: 300, y: 400 },
      { x: 450, y: 350 },
      { x: 1200, y: 400 },
      { x: 1350, y: 350 },
      { x: 300, y: 800 },
      { x: 450, y: 850 },
      { x: 1200, y: 800 },
      { x: 1350, y: 850 },
      { x: 600, y: 400 },
      { x: 1000, y: 400 },
      { x: 600, y: 800 },
      { x: 1000, y: 800 }
    ];
    
    trees.forEach(tree => {
      // Tree trunk
      graphics.fillStyle(0x8B4513);
      graphics.fillRect(tree.x - 8, tree.y + 10, 16, 30);
      
      // Tree foliage (layered circles)
      graphics.fillStyle(0x228B22);
      graphics.fillCircle(tree.x, tree.y - 5, 30);
      graphics.fillStyle(0x2E8B57);
      graphics.fillCircle(tree.x - 10, tree.y, 22);
      graphics.fillCircle(tree.x + 10, tree.y, 22);
      graphics.fillStyle(0x32CD32, 0.8);
      graphics.fillCircle(tree.x, tree.y - 15, 18);
    });
    
    // === PARK BENCHES ===
    const benches = [
      { x: 500, y: 500 },
      { x: 1000, y: 500 },
      { x: 500, y: 700 },
      { x: 1000, y: 700 }
    ];
    
    benches.forEach(bench => {
      // Bench seat
      graphics.fillStyle(0x8B4513);
      graphics.fillRect(bench.x, bench.y, 60, 15);
      // Bench legs
      graphics.fillStyle(0x696969);
      graphics.fillRect(bench.x + 5, bench.y + 12, 5, 10);
      graphics.fillRect(bench.x + 50, bench.y + 12, 5, 10);
      // Bench back
      graphics.fillStyle(0x8B4513);
      graphics.fillRect(bench.x, bench.y - 20, 60, 8);
    });
    
    // === CAFE AREA (West side - healing zone) ===
    graphics.fillStyle(0xDEB887, 0.6);
    graphics.fillRect(50, 400, 280, 400);
    
    // Outdoor cafe tables
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const tableX = 100 + i * 80;
        const tableY = 450 + j * 150;
        
        // Table
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(tableX, tableY, 20);
        
        // Table top
        graphics.fillStyle(0xFFF8DC);
        graphics.fillCircle(tableX, tableY, 18);
        
        // Umbrella pole
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(tableX - 2, tableY - 35, 4, 35);
        
        // Umbrella
        graphics.fillStyle(0xFF6347);
        graphics.fillTriangle(tableX, tableY - 50, tableX - 25, tableY - 30, tableX + 25, tableY - 30);
      }
    }
    
    // === ZONE LABELS ===
    this.add.text(800, 420, '⛲ ALEXANDER KIELLANDS PLASS', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#228B22',
      padding: { x: 10, y: 5 }
    }).setDepth(5).setOrigin(0.5);
    
    this.add.text(150, 580, '☕ CAFE\n(Heals HP)', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#8B4513',
      fontStyle: 'bold',
      backgroundColor: '#FFFFFF',
      padding: { x: 8, y: 4 },
      align: 'center'
    }).setDepth(5).setOrigin(0.5);
    
    this.add.text(800, 280, 'GRÜNERLØKKA - North', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      backgroundColor: '#555555',
      padding: { x: 8, y: 4 }
    }).setDepth(5).setOrigin(0.5);
    
    this.add.text(800, 920, 'TORSHOV - South', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      backgroundColor: '#555555',
      padding: { x: 8, y: 4 }
    }).setDepth(5).setOrigin(0.5);
    
    // === GRID LINES ===
    graphics.lineStyle(1, 0xCCCCCC, 0.2);
    for (let x = 0; x < this.mapWidth; x += 32) {
      graphics.lineBetween(x, 0, x, this.mapHeight);
    }
    for (let y = 0; y < this.mapHeight; y += 32) {
      graphics.lineBetween(0, y, this.mapWidth, y);
    }
    
    // === PLAYER SETUP ===
    const spawnPos = this.registry.get('spawnPosition') || { x: 800, y: 700 };
    this.player = this.physics.add.sprite(spawnPos.x, spawnPos.y, 'player');
    this.player.setDepth(10);
    this.player.body!.setSize(16, 16);
    this.player.body!.setOffset(8, 16);
    
    if (this.anims.exists('player-idle-down')) {
      this.player.play('player-idle-down');
    }
    
    // Camera setup
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Input setup
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Initialize tracking
    this.stepCount = 0;
    this.encounterThreshold = 10 + Phaser.Math.Between(-5, 5);
    this.currentZone = 'park';
    this.inEncounterZone = true;
    
    // Spawn enemies
    this.spawnEnemies();
    
    // Info text
    this.add.text(400, 50, 'Alexander Kiellands plass, Oslo - Explore the neighborhood!', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    
    // Back to level select hint
    this.add.text(750, 50, 'Press ESC for menu', {
      fontSize: '12px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    
    // ESC key to return to level select
    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => {
      this.scene.start('LevelSelectScene');
    });
    
    // P key to show Stoltenberg congratulations (debug/demo)
    const pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    pKey.on('down', () => {
      this.showStoltenbergCongratulations();
    });
  }
  
  private drawWindows(graphics: Phaser.GameObjects.Graphics, startX: number, startY: number, cols: number, rows: number, spacingX: number, spacingY: number) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = startX + col * spacingX;
        const wy = startY + row * spacingY;
        
        // Window frame
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(wx - 2, wy - 2, 24, 29);
        
        // Window glass
        graphics.fillStyle(0x87CEEB);
        graphics.fillRect(wx, wy, 20, 25);
        
        // Window panes
        graphics.lineStyle(2, 0x8B4513);
        graphics.lineBetween(wx + 10, wy, wx + 10, wy + 25);
        graphics.lineBetween(wx, wy + 12, wx + 20, wy + 12);
      }
    }
  }
  
  private spawnEnemies() {
    // Only spawn special characters in Alexander Kiellands plass
    console.log('Spawning special characters in Kielland scene');
    
    // Spawn special characters only
    this.spawnKristiane();
    this.spawnFredrik();
    this.spawnHenrik();
    this.spawnNils();
    this.spawnTufte();
    this.spawnMats();
    this.spawnAnya();
    this.spawnMartine();
    this.spawnAnna();
    
    console.log('Total enemies spawned:', this.enemies.length);
  }
  
  private spawnEnemy(x: number, y: number, spriteKey: string, zoneName: string) {
    const enemy = this.physics.add.sprite(x, y, spriteKey);
    enemy.setScale(0.8);
    enemy.setDepth(5);
    
    enemy.body!.setSize(12, 12);
    enemy.body!.setOffset(26, 26);
    enemy.setImmovable(true);
    
    (enemy as any).zone = zoneName;
    
    this.enemies.push(enemy);
    
    this.physics.add.overlap(this.player, enemy, () => {
      this.triggerEnemyEncounter(enemy);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
  }
  
  private spawnKristiane() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Dr. Kristiane')) return;
    
    // Kristiane near the cafe area
    const kristianeX = 200;
    const kristianeY = 550;
    
    const kristiane = this.physics.add.sprite(kristianeX, kristianeY, 'enemy-kristiane');
    kristiane.setScale(1.0);
    kristiane.setDepth(6);
    
    kristiane.body!.setSize(16, 16);
    kristiane.body!.setOffset(24, 24);
    kristiane.setImmovable(true);
    
    (kristiane as any).zone = 'cafe';
    (kristiane as any).isKristiane = true;
    
    this.enemies.push(kristiane);
    
    this.physics.add.overlap(this.player, kristiane, () => {
      this.triggerEnemyEncounter(kristiane);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(kristianeX, kristianeY - 45, '🥼 Kristiane', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#2E8B57',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnFredrik() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Fredrik')) return;
    
    // Fredrik near the fountain - perfect for a drummer!
    const fredrikX = 900;
    const fredrikY = 500;
    
    const fredrik = this.physics.add.sprite(fredrikX, fredrikY, 'enemy-fredrik');
    fredrik.setScale(1.0);
    fredrik.setDepth(6);
    
    fredrik.body!.setSize(16, 16);
    fredrik.body!.setOffset(24, 24);
    fredrik.setImmovable(true);
    
    (fredrik as any).zone = 'park';
    (fredrik as any).isFredrik = true;
    
    this.enemies.push(fredrik);
    
    this.physics.add.overlap(this.player, fredrik, () => {
      this.triggerEnemyEncounter(fredrik);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(fredrikX, fredrikY - 45, '🥁 Fredrik', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#8B0000',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnHenrik() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Henrik the Ashen One')) return;
    
    // Henrik - the Dark Souls expert, near a dark corner of the park
    const henrikX = 1200;
    const henrikY = 700;
    
    const henrik = this.physics.add.sprite(henrikX, henrikY, 'enemy-henrik');
    henrik.setScale(1.0);
    henrik.setDepth(6);
    
    henrik.body!.setSize(16, 16);
    henrik.body!.setOffset(24, 24);
    henrik.setImmovable(true);
    
    (henrik as any).zone = 'park';
    (henrik as any).isHenrik = true;
    
    this.enemies.push(henrik);
    
    this.physics.add.overlap(this.player, henrik, () => {
      this.triggerEnemyEncounter(henrik);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(henrikX, henrikY - 45, '⚔️ Henrik', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#800080',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnNils() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Nils the Good Boy')) return;
    
    // Nils the good boy - near the cafe, loves treats!
    const nilsX = 350;
    const nilsY = 650;
    
    const nils = this.physics.add.sprite(nilsX, nilsY, 'enemy-nils');
    nils.setScale(1.0);
    nils.setDepth(6);
    
    nils.body!.setSize(16, 16);
    nils.body!.setOffset(24, 24);
    nils.setImmovable(true);
    
    (nils as any).zone = 'cafe';
    (nils as any).isNils = true;
    
    this.enemies.push(nils);
    
    this.physics.add.overlap(this.player, nils, () => {
      this.triggerEnemyEncounter(nils);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(nilsX, nilsY - 40, '🐕 Nils', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#8B4513',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnTufte() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Tufte')) return;
    
    // Tufte - political expert near the north side
    const tufteX = 500;
    const tufteY = 350;
    
    const tufte = this.physics.add.sprite(tufteX, tufteY, 'enemy-tufte');
    tufte.setScale(1.0);
    tufte.setDepth(6);
    
    tufte.body!.setSize(16, 16);
    tufte.body!.setOffset(24, 24);
    tufte.setImmovable(true);
    
    (tufte as any).zone = 'park';
    (tufte as any).isTufte = true;
    
    this.enemies.push(tufte);
    
    this.physics.add.overlap(this.player, tufte, () => {
      this.triggerEnemyEncounter(tufte);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(tufteX, tufteY - 45, '🇳🇴 Tufte', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#4169E1',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnMats() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Mats')) return;
    
    // Mats - tech expert near the east side
    const matsX = 1100;
    const matsY = 400;
    
    const mats = this.physics.add.sprite(matsX, matsY, 'enemy-mats');
    mats.setScale(1.0);
    mats.setDepth(6);
    
    mats.body!.setSize(16, 16);
    mats.body!.setOffset(24, 24);
    mats.setImmovable(true);
    
    (mats as any).zone = 'park';
    (mats as any).isMats = true;
    
    this.enemies.push(mats);
    
    this.physics.add.overlap(this.player, mats, () => {
      this.triggerEnemyEncounter(mats);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(matsX, matsY - 45, '💻 Mats', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#2F4F4F',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnAnya() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Anya')) return;
    
    // Anya - bartender near the west side
    const anyaX = 300;
    const anyaY = 500;
    
    const anya = this.physics.add.sprite(anyaX, anyaY, 'enemy-anya');
    anya.setScale(1.0);
    anya.setDepth(6);
    
    anya.body!.setSize(16, 16);
    anya.body!.setOffset(24, 24);
    anya.setImmovable(true);
    
    (anya as any).zone = 'park';
    (anya as any).isAnya = true;
    
    this.enemies.push(anya);
    
    this.physics.add.overlap(this.player, anya, () => {
      this.triggerEnemyEncounter(anya);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(anyaX, anyaY - 45, '🍸 Anya', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#800020',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnMartine() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Martine')) return;
    
    // Martine - Twilight fan near the north area
    const martineX = 650;
    const martineY = 280;
    
    const martine = this.physics.add.sprite(martineX, martineY, 'enemy-martine');
    martine.setScale(1.0);
    martine.setDepth(6);
    
    martine.body!.setSize(16, 16);
    martine.body!.setOffset(24, 24);
    martine.setImmovable(true);
    
    (martine as any).zone = 'north_street';
    (martine as any).isMartine = true;
    
    this.enemies.push(martine);
    
    this.physics.add.overlap(this.player, martine, () => {
      this.triggerEnemyEncounter(martine);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(martineX, martineY - 45, '🧛 Martine', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold',
      backgroundColor: '#1a1a1a',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnAnna() {
    // Check if already defeated
    const defeatedEnemies = this.registry.get('defeatedEnemies') || [];
    if (defeatedEnemies.includes('Anna')) return;
    
    // Anna - Danish woman near the east area
    const annaX = 1050;
    const annaY = 450;
    
    const anna = this.physics.add.sprite(annaX, annaY, 'enemy-anna');
    anna.setScale(1.0);
    anna.setDepth(6);
    
    anna.body!.setSize(16, 16);
    anna.body!.setOffset(24, 24);
    anna.setImmovable(true);
    
    (anna as any).zone = 'east_street';
    (anna as any).isAnna = true;
    
    this.enemies.push(anna);
    
    this.physics.add.overlap(this.player, anna, () => {
      this.triggerEnemyEncounter(anna);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(annaX, annaY - 45, '🇩🇰 Anna', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold',
      backgroundColor: '#C41E3A',
      padding: { x: 4, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private spawnAnders() {
    // Anders guards the south exit!
    const andersX = 800;
    const andersY = 880;
    
    const anders = this.physics.add.sprite(andersX, andersY, 'enemy-anders');
    anders.setScale(1.2);
    anders.setDepth(6);
    anders.setTint(0xFF0000);
    
    anders.body!.setSize(20, 20);
    anders.body!.setOffset(22, 22);
    anders.setImmovable(true);
    
    (anders as any).zone = 'south_street';
    (anders as any).isAnders = true;
    
    this.tweens.add({
      targets: anders,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.enemies.push(anders);
    
    this.physics.add.overlap(this.player, anders, () => {
      this.triggerEnemyEncounter(anders);
    }, (player, enemySprite) => {
      const playerBody = (player as Phaser.Physics.Arcade.Sprite).body!;
      const enemyBody = (enemySprite as Phaser.Physics.Arcade.Sprite).body!;
      return Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(playerBody.x, playerBody.y, playerBody.width, playerBody.height),
        new Phaser.Geom.Rectangle(enemyBody.x, enemyBody.y, enemyBody.width, enemyBody.height)
      );
    }, this);
    
    this.add.text(andersX, andersY - 50, '⚠️ ANDERS', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FF0000',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    }).setDepth(7).setOrigin(0.5);
  }
  
  private triggerEnemyEncounter(enemySprite: Phaser.Physics.Arcade.Sprite) {
    if (this.inBattle) return;
    this.inBattle = true;
    
    const isAnders = (enemySprite as any).isAnders === true;
    const isKristiane = (enemySprite as any).isKristiane === true;
    const isFredrik = (enemySprite as any).isFredrik === true;
    const isHenrik = (enemySprite as any).isHenrik === true;
    const isNils = (enemySprite as any).isNils === true;
    const isTufte = (enemySprite as any).isTufte === true;
    const isMats = (enemySprite as any).isMats === true;
    const isAnya = (enemySprite as any).isAnya === true;
    const isMartine = (enemySprite as any).isMartine === true;
    const isAnna = (enemySprite as any).isAnna === true;
    const enemyZone = (enemySprite as any).zone || this.currentZone;
    
    const index = this.enemies.indexOf(enemySprite);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
    enemySprite.destroy();
    
    let enemy;
    if (isAnders) {
      enemy = ENEMIES['anders'];
    } else if (isKristiane) {
      enemy = ENEMIES['kristiane'];
    } else if (isFredrik) {
      enemy = ENEMIES['fredrik'];
    } else if (isHenrik) {
      enemy = ENEMIES['henrik'];
    } else if (isNils) {
      enemy = ENEMIES['nils'];
    } else if (isTufte) {
      enemy = ENEMIES['tufte'];
    } else if (isMats) {
      enemy = ENEMIES['mats'];
    } else if (isAnya) {
      enemy = ENEMIES['anya'];
    } else if (isMartine) {
      enemy = ENEMIES['martine'];
    } else if (isAnna) {
      enemy = ENEMIES['anna'];
    } else {
      // Map Kielland zones to existing enemy zones
      const zoneMapping: Record<string, 'finance' | 'hospitality' | 'research'> = {
        'park': 'research',
        'north_street': 'hospitality',
        'south_street': 'finance',
        'east_shops': 'hospitality'
      };
      const mappedZone = zoneMapping[enemyZone] || 'finance';
      enemy = getRandomEnemy(mappedZone);
    }
    
    if (!enemy) {
      console.error('No enemies found for zone:', enemyZone);
      this.inBattle = false;
      return;
    }
    
    console.log('Starting battle with:', enemy.displayName);
    
    this.isMoving = true;
    
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BattleScene', {
        enemy: enemy,
        returnPosition: { x: this.player.x, y: this.player.y },
        currentZone: this.currentZone,
        returnScene: 'KiellandScene'
      });
    });
  }
  
  private showStoltenbergCongratulations() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    
    // Animated sparkle/confetti effect
    const particles = this.add.particles(width / 2, height / 2, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 3000,
      quantity: 2,
      emitting: true,
      tint: [0xFFD700, 0xFFA500, 0xFF6347, 0x00CED1, 0x9370DB]
    });
    particles.setScrollFactor(0);
    particles.setDepth(201);
    
    // Create congratulations banner
    const banner = this.add.rectangle(width / 2, 80, 600, 60, 0x1a5276, 0.95);
    banner.setStrokeStyle(4, 0xFFD700);
    banner.setScrollFactor(0);
    banner.setDepth(202);
    
    const titleText = this.add.text(width / 2, 80, '🎉 CONGRATULATIONS! 🎉', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    
    // Create Stoltenberg portrait with golden frame
    const portraitFrame = this.add.rectangle(width / 2, height / 2 - 30, 148, 148, 0xFFD700);
    portraitFrame.setStrokeStyle(4, 0xDAA520);
    portraitFrame.setScrollFactor(0);
    portraitFrame.setDepth(202);
    
    const portrait = this.add.image(width / 2, height / 2 - 30, 'stoltenberg-portrait');
    portrait.setScale(1);
    portrait.setScrollFactor(0);
    portrait.setDepth(203);
    
    // Name label below portrait
    const nameLabel = this.add.text(width / 2, height / 2 + 40, '🇳🇴 Jens Stoltenberg greets you! 🇳🇴', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    
    // Subtle animation for portrait
    this.tweens.add({
      targets: portrait,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Speech bubble with congratulations message
    const bubbleWidth = 450;
    const bubbleHeight = 100;
    const bubbleX = width / 2;
    const bubbleY = height / 2 + 100;
    
    // Speech bubble background
    const bubble = this.add.rectangle(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 0xFFFFFF, 0.95);
    bubble.setStrokeStyle(3, 0x1a5276);
    bubble.setScrollFactor(0);
    bubble.setDepth(202);
    
    // Speech bubble pointer
    const pointer = this.add.triangle(
      bubbleX, bubbleY - bubbleHeight / 2 - 10,
      0, 20, 15, 0, 30, 20,
      0xFFFFFF
    );
    pointer.setScrollFactor(0);
    pointer.setDepth(202);
    
    // Congratulations message from Jens
    const messageText = this.add.text(bubbleX, bubbleY, 
      '"Gratulerer! You have mastered every challenge\nand proven yourself worthy. Norway is proud!\nWelcome to the elite ranks!"', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#1a5276',
      fontStyle: 'italic',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    
    // Signature
    const signature = this.add.text(bubbleX + 120, bubbleY + 50, '— Jens Stoltenberg', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#2c3e50',
      fontStyle: 'bold italic'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    
    // Stats summary
    const stats = this.registry.get('playerStats') || { level: 1, exp: 0, gold: 0 };
    const statsText = this.add.text(width / 2, height - 100, 
      `Final Stats: Level ${stats.level} | XP: ${stats.exp} | Gold: ${stats.gold}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFD700'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    
    // Continue button
    const continueBtn = this.add.rectangle(width / 2, height - 50, 200, 45, 0x27ae60, 0.9);
    continueBtn.setStrokeStyle(3, 0xFFD700);
    continueBtn.setInteractive({ useHandCursor: true });
    continueBtn.setScrollFactor(0);
    continueBtn.setDepth(202);
    
    const continueText = this.add.text(width / 2, height - 50, '✨ CLOSE ✨', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    
    // Hover effects
    continueBtn.on('pointerover', () => {
      continueBtn.setFillStyle(0x2ecc71, 1);
    });
    continueBtn.on('pointerout', () => {
      continueBtn.setFillStyle(0x27ae60, 0.9);
    });
    
    // Click to close
    continueBtn.on('pointerdown', () => {
      particles.destroy();
      overlay.destroy();
      banner.destroy();
      titleText.destroy();
      portraitFrame.destroy();
      portrait.destroy();
      nameLabel.destroy();
      bubble.destroy();
      pointer.destroy();
      messageText.destroy();
      signature.destroy();
      statsText.destroy();
      continueBtn.destroy();
      continueText.destroy();
    });
    
    // Entrance animations
    titleText.setAlpha(0);
    portrait.setAlpha(0);
    portraitFrame.setAlpha(0);
    nameLabel.setAlpha(0);
    bubble.setAlpha(0);
    pointer.setAlpha(0);
    messageText.setAlpha(0);
    signature.setAlpha(0);
    statsText.setAlpha(0);
    continueBtn.setAlpha(0);
    continueText.setAlpha(0);
    
    this.tweens.add({
      targets: [titleText, banner],
      alpha: 1,
      y: '-=20',
      duration: 500,
      ease: 'Back.out'
    });
    
    this.time.delayedCall(300, () => {
      this.tweens.add({
        targets: [portrait, portraitFrame, nameLabel],
        alpha: 1,
        scale: { from: 0.5, to: 1 },
        duration: 600,
        ease: 'Back.out'
      });
    });
    
    this.time.delayedCall(600, () => {
      this.tweens.add({
        targets: [bubble, pointer, messageText, signature],
        alpha: 1,
        duration: 400,
        ease: 'Power2'
      });
    });
    
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: [statsText, continueBtn, continueText],
        alpha: 1,
        duration: 400,
        ease: 'Power2'
      });
    });
  }
}
