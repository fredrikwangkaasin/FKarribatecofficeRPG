import Phaser from 'phaser';

/**
 * LevelSelectScene - Choose between different game levels/maps
 */
export default class LevelSelectScene extends Phaser.Scene {
  private selectedLevel = 0;
  private levels = [
    {
      id: 'office',
      name: 'Arribatec Office',
      description: 'The classic office environment with Finance, Hospitality, and Research zones.',
      scene: 'OfficeScene',
      color: 0x0055aa
    },
    {
      id: 'kielland',
      name: 'Alexander Kiellands plass',
      description: 'A vibrant Oslo neighborhood with parks, cafes, and city streets.',
      scene: 'KiellandScene',
      color: 0x228B22
    }
  ];
  
  constructor() {
    super('LevelSelectScene');
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background with gradient effect
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    bg.fillRect(0, 0, width, height);
    
    // Title
    this.add.text(width / 2, 60, '🎮 SELECT YOUR ADVENTURE', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 100, 'Choose a level to explore', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // Create level cards
    this.createLevelCards();
    
    // Instructions
    this.add.text(width / 2, height - 50, '← → to navigate, ENTER to select', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#888888'
    }).setOrigin(0.5);
    
    // Setup input
    const cursors = this.input.keyboard!.createCursorKeys();
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    cursors.left.on('down', () => this.selectLevel(-1));
    cursors.right.on('down', () => this.selectLevel(1));
    enterKey.on('down', () => this.startLevel());
    spaceKey.on('down', () => this.startLevel());
    
    // Initial selection highlight
    this.updateSelection();
  }
  
  private levelCards: Phaser.GameObjects.Container[] = [];
  private selectionIndicator!: Phaser.GameObjects.Rectangle;
  
  private createLevelCards() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const cardWidth = 300;
    const cardHeight = 350;
    const spacing = 50;
    const totalWidth = this.levels.length * cardWidth + (this.levels.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    
    // Selection indicator (behind cards)
    this.selectionIndicator = this.add.rectangle(0, height / 2, cardWidth + 20, cardHeight + 20, 0xFFD700, 0.3);
    this.selectionIndicator.setStrokeStyle(4, 0xFFD700);
    
    this.levels.forEach((level, index) => {
      const x = startX + index * (cardWidth + spacing);
      const y = height / 2;
      
      const container = this.add.container(x, y);
      
      // Card background
      const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x2a2a4a, 0.9);
      cardBg.setStrokeStyle(2, level.color);
      container.add(cardBg);
      
      // Level preview image (generated graphics)
      const preview = this.createLevelPreview(level.id, cardWidth - 40, 150);
      preview.setPosition(0, -70);
      container.add(preview);
      
      // Level name
      const nameText = this.add.text(0, 30, level.name, {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: cardWidth - 20 }
      }).setOrigin(0.5);
      container.add(nameText);
      
      // Description
      const descText = this.add.text(0, 90, level.description, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
        align: 'center',
        wordWrap: { width: cardWidth - 40 }
      }).setOrigin(0.5);
      container.add(descText);
      
      // Make card interactive
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on('pointerdown', () => {
        this.selectedLevel = index;
        this.updateSelection();
        this.startLevel();
      });
      cardBg.on('pointerover', () => {
        this.selectedLevel = index;
        this.updateSelection();
      });
      
      this.levelCards.push(container);
    });
  }
  
  private createLevelPreview(levelId: string, width: number, height: number): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    
    if (levelId === 'office') {
      // Office preview - simplified floor plan
      graphics.fillStyle(0xE8E8E8);
      graphics.fillRect(-width/2, -height/2, width, height);
      
      // Finance zone (green)
      graphics.fillStyle(0xC8E6C9, 0.8);
      graphics.fillRect(width/2 - 80, height/2 - 60, 70, 50);
      
      // Hospitality zone (yellow)
      graphics.fillStyle(0xFFF9C4, 0.8);
      graphics.fillRect(-20, height/2 - 60, 60, 50);
      
      // Research zone (blue)
      graphics.fillStyle(0xBBDEFB, 0.8);
      graphics.fillRect(-width/2 + 10, -height/2 + 10, 80, 60);
      
      // Break room (red)
      graphics.fillStyle(0xFFCDD2);
      graphics.fillRect(-30, -20, 60, 40);
      
      // Grid lines
      graphics.lineStyle(1, 0x999999, 0.3);
      for (let x = -width/2; x <= width/2; x += 20) {
        graphics.lineBetween(x, -height/2, x, height/2);
      }
      for (let y = -height/2; y <= height/2; y += 20) {
        graphics.lineBetween(-width/2, y, width/2, y);
      }
      
    } else if (levelId === 'kielland') {
      // Alexander Kiellands plass preview - park/outdoor scene
      // Sky
      graphics.fillStyle(0x87CEEB);
      graphics.fillRect(-width/2, -height/2, width, height * 0.4);
      
      // Grass/park
      graphics.fillStyle(0x228B22);
      graphics.fillRect(-width/2, -height/2 + height * 0.4, width, height * 0.6);
      
      // Fountain in center (the famous fountain)
      graphics.fillStyle(0x4682B4);
      graphics.fillCircle(0, 0, 25);
      graphics.fillStyle(0x87CEEB);
      graphics.fillCircle(0, 0, 15);
      
      // Trees
      graphics.fillStyle(0x2E8B57);
      graphics.fillCircle(-80, 10, 20);
      graphics.fillCircle(-70, -5, 18);
      graphics.fillCircle(80, 5, 22);
      graphics.fillCircle(70, 20, 16);
      
      // Tree trunks
      graphics.fillStyle(0x8B4513);
      graphics.fillRect(-82, 25, 8, 15);
      graphics.fillRect(78, 22, 8, 15);
      
      // Paths
      graphics.fillStyle(0xD2B48C, 0.7);
      graphics.fillRect(-width/2, -5, width, 15);
      graphics.fillRect(-5, -height/2 + height * 0.4, 15, height * 0.6);
      
      // Buildings at top
      graphics.fillStyle(0xCD853F);
      graphics.fillRect(-width/2 + 5, -height/2 + 5, 40, 50);
      graphics.fillRect(width/2 - 45, -height/2 + 5, 40, 50);
      
      // Windows
      graphics.fillStyle(0xFFFFE0);
      for (let i = 0; i < 3; i++) {
        graphics.fillRect(-width/2 + 10 + i * 12, -height/2 + 15, 8, 10);
        graphics.fillRect(width/2 - 40 + i * 12, -height/2 + 15, 8, 10);
      }
    }
    
    // Border
    graphics.lineStyle(2, 0x444444);
    graphics.strokeRect(-width/2, -height/2, width, height);
    
    return graphics;
  }
  
  private selectLevel(direction: number) {
    this.selectedLevel = Phaser.Math.Wrap(this.selectedLevel + direction, 0, this.levels.length);
    this.updateSelection();
  }
  
  private updateSelection() {
    const card = this.levelCards[this.selectedLevel];
    
    // Move selection indicator
    this.tweens.add({
      targets: this.selectionIndicator,
      x: card.x,
      duration: 200,
      ease: 'Power2'
    });
    
    // Scale effect on cards
    this.levelCards.forEach((c, i) => {
      this.tweens.add({
        targets: c,
        scale: i === this.selectedLevel ? 1.05 : 0.95,
        alpha: i === this.selectedLevel ? 1 : 0.7,
        duration: 200,
        ease: 'Power2'
      });
    });
  }
  
  private startLevel() {
    const level = this.levels[this.selectedLevel];
    
    // Store selected level in registry
    this.registry.set('currentLevel', level.id);
    
    // Fade out and start selected scene
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(level.scene);
    });
  }
}
