import Phaser from 'phaser';

/**
 * PreloadScene - Loads all game assets with Arribatec-themed loading bar
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.createLoadingBar();
    
    const basePath = import.meta.env.BASE_URL || '/';
    const assetsPath = `${basePath}game-assets/`;
    
    // Tilemaps
    this.load.image('office-tiles', `${assetsPath}tilesets/office-tileset.png`);
    this.load.tilemapTiledJSON('office-map', `${assetsPath}tilemaps/office.json`);
    
    // Player sprite (32x48, 4 directions × 4 frames = 16 frames)
    this.load.spritesheet('player', `${assetsPath}sprites/player.png`, {
      frameWidth: 32,
      frameHeight: 48
    });
    
    // Enemy sprites (64x64 each)
    const enemies = [
      'auditor', 'budget-manager', 'tax-consultant', 'cfo',
      'angry-customer', 'tour-operator', 'event-planner', 'hotel-manager',
      'data-analyst', 'research-director', 'grant-writer', 'lead-scientist'
    ];
    
    enemies.forEach(enemy => {
      this.load.image(`enemy-${enemy}`, `${assetsPath}sprites/enemies/${enemy}.png`);
    });
    
    // UI elements
    this.load.image('battle-menu-bg', `${assetsPath}ui/battle-menu.png`);
    this.load.image('hp-bar-bg', `${assetsPath}ui/hp-bar-bg.png`);
    this.load.image('hp-bar-fill', `${assetsPath}ui/hp-bar-fill.png`);
    
    // Suppress load error warnings - fallback system handles missing assets
    this.load.on('loaderror', (file: any) => {
      // Silent - fallback textures will be created in create()
    });
  }

  create() {
    // Create fallback textures if assets failed to load
    this.createFallbackTextures();
    
    // Create player animations
    this.createPlayerAnimations();
    
    // Load saved game state or create new game
    this.loadGameState();
  }
  
  private createFallbackTextures() {
    // Check if player sprite loaded, if not create a colored rectangle
    if (!this.textures.exists('player')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x0066CC); // Arribatec blue
      graphics.fillRect(0, 0, 32, 48);
      graphics.generateTexture('player', 32, 48);
      graphics.destroy();
      console.log('Created fallback player texture');
    }
    
    // Create fallback textures for missing enemies
    const enemies = [
      'auditor', 'budget-manager', 'tax-consultant', 'cfo',
      'angry-customer', 'tour-operator', 'event-planner', 'hotel-manager',
      'data-analyst', 'research-director', 'grant-writer', 'lead-scientist'
    ];
    
    enemies.forEach(enemy => {
      const key = `enemy-${enemy}`;
      if (!this.textures.exists(key)) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xFF6B6B); // Red for enemies
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture(key, 64, 64);
        graphics.destroy();
      }
    });
    
    // Create fallback office tiles if not loaded
    if (!this.textures.exists('office-tiles')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xDDDDDD); // Gray for floor
      graphics.fillRect(0, 0, 32, 32);
      graphics.generateTexture('office-tiles', 32, 32);
      graphics.destroy();
    }
  }
  
  private createPlayerAnimations() {
    // Create simple static animations for fallback
    const frames = this.textures.exists('player') && 
                   this.textures.get('player').frameTotal > 1 
                   ? this.anims.generateFrameNumbers('player', { start: 0, end: 3 })
                   : [{ key: 'player', frame: 0 }];
    
    // Down (facing camera)
    if (!this.anims.exists('player-walk-down')) {
      this.anims.create({
        key: 'player-walk-down',
        frames: frames,
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists('player-idle-down')) {
      this.anims.create({
        key: 'player-idle-down',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1
      });
    }
    
    // Up, Left, Right - use same frame for fallback
    ['up', 'left', 'right'].forEach(direction => {
      if (!this.anims.exists(`player-walk-${direction}`)) {
        this.anims.create({
          key: `player-walk-${direction}`,
          frames: [{ key: 'player', frame: 0 }],
          frameRate: 8,
          repeat: -1
        });
      }
      if (!this.anims.exists(`player-idle-${direction}`)) {
        this.anims.create({
          key: `player-idle-${direction}`,
          frames: [{ key: 'player', frame: 0 }],
          frameRate: 1
        });
      }
    });
  }
  
  private async loadGameState() {
    const gameAPI = this.registry.get('gameAPI');
    
    if (gameAPI) {
      try {
        const savedState = await gameAPI.loadGame();
        
        if (savedState) {
          // Load existing save
          this.registry.set('playerStats', savedState.playerStats);
          this.registry.set('defeatedBosses', savedState.defeatedBosses);
          this.registry.set('playTime', savedState.playTime);
          
          this.scene.start('OfficeScene', {
            spawnPosition: savedState.position,
            currentZone: savedState.currentZone
          });
        } else {
          // New game
          this.startNewGame();
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        this.startNewGame();
      }
    } else {
      // No API available (shouldn't happen, but handle gracefully)
      this.startNewGame();
    }
    
    // Launch UI overlay
    this.scene.launch('UIScene');
  }
  
  private startNewGame() {
    // Initialize new game state
    this.registry.set('playerStats', {
      level: 1,
      exp: 0,
      nextLevelExp: 100,
      gold: 0,
      currentHP: 100,
      maxHP: 100,
      logic: 10,
      resilience: 8,
      charisma: 7
    });
    this.registry.set('defeatedBosses', []);
    this.registry.set('playTime', 0);
    
    // Start in lobby
    this.scene.start('OfficeScene', {
      spawnPosition: { x: 400, y: 300 },
      currentZone: 'lobby'
    });
  }
  
  private createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Arribatec branding
    const title = this.add.text(width / 2, height / 2 - 100, 'ARRIBATEC OFFICE RPG', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#0066CC', // Arribatec blue
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Loading box
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const progressBar = this.add.graphics();
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Update progress bar
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      
      progressBar.clear();
      progressBar.fillStyle(0x0066CC, 1); // Arribatec blue
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    // Clean up when complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      title.destroy();
    });
  }
}
