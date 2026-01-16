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
      'data-analyst', 'research-director', 'grant-writer', 'lead-scientist',
      'anders', // Special lobby boss
      'lars-hugo', // Cycling/running cap enthusiast
      'ole-jakob', // Professional businessman who knows Arribatec
      'kristiane', // Medical professional with lab coat and blonde hair
      'fredrik' // Drummer who wears band shirts and asks pop quiz questions
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
    // Create player character sprite if not loaded - IMPROVED GRAPHICS
    if (!this.textures.exists('player')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      
      // Shadow
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillEllipse(16, 46, 14, 4);
      
      // Legs (pants - dark blue with shading)
      graphics.fillStyle(0x1a3a5c);
      graphics.fillRect(10, 34, 6, 14);
      graphics.fillRect(16, 34, 6, 14);
      // Leg highlights
      graphics.fillStyle(0x2a5a8c);
      graphics.fillRect(11, 34, 2, 12);
      graphics.fillRect(17, 34, 2, 12);
      
      // Shoes
      graphics.fillStyle(0x2c2c2c);
      graphics.fillRoundedRect(8, 46, 8, 4, 2);
      graphics.fillRoundedRect(16, 46, 8, 4, 2);
      
      // Body (shirt - Arribatec blue with gradient effect)
      graphics.fillStyle(0x0055aa);
      graphics.fillRoundedRect(8, 18, 16, 18, 3);
      // Shirt highlight
      graphics.fillStyle(0x0077cc);
      graphics.fillRect(10, 20, 6, 14);
      // Collar
      graphics.fillStyle(0xffffff);
      graphics.fillTriangle(12, 18, 16, 22, 20, 18);
      
      // Arms with hands
      graphics.fillStyle(0x0055aa);
      graphics.fillRoundedRect(4, 20, 5, 14, 2);
      graphics.fillRoundedRect(23, 20, 5, 14, 2);
      // Hands
      graphics.fillStyle(0xFFDBB5);
      graphics.fillCircle(6, 34, 3);
      graphics.fillCircle(26, 34, 3);
      
      // Neck
      graphics.fillStyle(0xFFDBB5);
      graphics.fillRect(13, 14, 6, 6);
      
      // Head with better shape
      graphics.fillStyle(0xFFDBB5);
      graphics.fillCircle(16, 10, 9);
      
      // Hair (styled)
      graphics.fillStyle(0x4a3728);
      graphics.fillEllipse(16, 6, 10, 6);
      graphics.fillRect(7, 6, 4, 6);
      graphics.fillRect(21, 6, 4, 6);
      
      // Face details
      // Eyes with pupils
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(12, 10, 3);
      graphics.fillCircle(20, 10, 3);
      graphics.fillStyle(0x3366aa);
      graphics.fillCircle(12, 10, 2);
      graphics.fillCircle(20, 10, 2);
      graphics.fillStyle(0x000000);
      graphics.fillCircle(12, 10, 1);
      graphics.fillCircle(20, 10, 1);
      
      // Eyebrows
      graphics.lineStyle(1, 0x4a3728);
      graphics.lineBetween(9, 7, 14, 7);
      graphics.lineBetween(18, 7, 23, 7);
      
      // Smile
      graphics.lineStyle(1, 0x8B4513);
      graphics.beginPath();
      graphics.arc(16, 12, 3, 0.3, Math.PI - 0.3, false);
      graphics.strokePath();
      
      // Badge on shirt
      graphics.fillStyle(0xFFD700);
      graphics.fillCircle(22, 24, 2);
      
      graphics.generateTexture('player', 32, 50);
      graphics.destroy();
      console.log('Created improved player texture');
    }
    
    // Create fallback textures for missing enemies - different colors/styles
    const enemyStyles = {
      'auditor': { color: 0x8B0000, accessory: 0xFFD700 }, // Dark red with gold (accountant)
      'budget-manager': { color: 0x4B0082, accessory: 0xC0C0C0 }, // Indigo with silver
      'tax-consultant': { color: 0x2F4F4F, accessory: 0x90EE90 }, // Dark slate with light green
      'cfo': { color: 0x000080, accessory: 0xFFD700 }, // Navy with gold (boss)
      'angry-customer': { color: 0xFF4500, accessory: 0xFF0000 }, // Orange-red angry
      'tour-operator': { color: 0x20B2AA, accessory: 0xFFFFE0 }, // Light sea green
      'event-planner': { color: 0xFF69B4, accessory: 0xFFFFFF }, // Hot pink
      'hotel-manager': { color: 0x8B4513, accessory: 0xFFD700 }, // Saddle brown with gold
      'data-analyst': { color: 0x4682B4, accessory: 0x00CED1 }, // Steel blue with cyan
      'research-director': { color: 0x556B2F, accessory: 0xF0E68C }, // Dark olive with khaki
      'grant-writer': { color: 0x9370DB, accessory: 0xFFFFFF }, // Medium purple
      'lead-scientist': { color: 0x2E8B57, accessory: 0xFFFFFF }, // Sea green (boss)
      'anders': { color: 0x1a0000, accessory: 0xFF0000, isBoss: true }, // ANDERS - Dark demon boss
      'lars-hugo': { color: 0x228B22, accessory: 0x4169E1, isAthlete: true }, // Lars Hugo - Athletic green with blue cap
      'ole-jakob': { color: 0x1a365d, accessory: 0xFFD700, isBusinessman: true }, // Ole Jakob - Professional navy suit with gold tie
      'kristiane': { color: 0xFFFFFF, accessory: 0x2E8B57, isMedical: true }, // Kristiane - Lab coat with blonde hair
      'fredrik': { color: 0x1a1a1a, accessory: 0xFF4500, isDrummer: true } // Fredrik - Band shirt drummer
    };
    
    Object.entries(enemyStyles).forEach(([enemy, style]) => {
      const key = `enemy-${enemy}`;
      if (!this.textures.exists(key)) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Special scary sprite for ANDERS - IMPROVED DEMON BOSS
        if (enemy === 'anders') {
          // Outer dark aura with pulsing effect layers
          graphics.fillStyle(0x1a0000, 0.3);
          graphics.fillCircle(32, 32, 32);
          graphics.fillStyle(0x330000, 0.4);
          graphics.fillCircle(32, 32, 28);
          graphics.fillStyle(0x440000, 0.5);
          graphics.fillCircle(32, 32, 24);
          
          // Dark hooded robe body with depth
          graphics.fillStyle(0x0a0a0a);
          graphics.fillTriangle(32, 4, 4, 62, 60, 62);
          
          // Inner robe layer
          graphics.fillStyle(0x151515);
          graphics.fillTriangle(32, 10, 10, 58, 54, 58);
          
          // Robe folds/details
          graphics.lineStyle(1, 0x222222);
          graphics.lineBetween(32, 20, 20, 56);
          graphics.lineBetween(32, 20, 44, 56);
          graphics.lineBetween(32, 30, 26, 56);
          graphics.lineBetween(32, 30, 38, 56);
          
          // Face shadow area
          graphics.fillStyle(0x050505);
          graphics.fillCircle(32, 26, 14);
          
          // Glowing red eyes - multiple layers for glow effect
          graphics.fillStyle(0x660000, 0.6);
          graphics.fillCircle(25, 26, 8);
          graphics.fillCircle(39, 26, 8);
          graphics.fillStyle(0x990000, 0.8);
          graphics.fillCircle(25, 26, 6);
          graphics.fillCircle(39, 26, 6);
          graphics.fillStyle(0xCC0000);
          graphics.fillCircle(25, 26, 4);
          graphics.fillCircle(39, 26, 4);
          graphics.fillStyle(0xFF0000);
          graphics.fillCircle(25, 26, 2.5);
          graphics.fillCircle(39, 26, 2.5);
          // White hot center
          graphics.fillStyle(0xFFFF00);
          graphics.fillCircle(25, 26, 1);
          graphics.fillCircle(39, 26, 1);
          
          // Sinister smile with teeth
          graphics.lineStyle(2, 0x880000);
          graphics.beginPath();
          graphics.arc(32, 36, 10, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          // Teeth
          graphics.fillStyle(0xDDDDDD);
          for (let i = 0; i < 5; i++) {
            graphics.fillTriangle(24 + i * 4, 36, 26 + i * 4, 40, 28 + i * 4, 36);
          }
          
          // Horns with gradient effect
          graphics.fillStyle(0x220000);
          graphics.fillTriangle(14, 14, 8, 0, 20, 10);
          graphics.fillTriangle(50, 14, 56, 0, 44, 10);
          graphics.fillStyle(0x440000);
          graphics.fillTriangle(16, 12, 10, 2, 20, 10);
          graphics.fillTriangle(48, 12, 54, 2, 44, 10);
          // Horn highlights
          graphics.fillStyle(0x660000);
          graphics.fillRect(12, 6, 2, 4);
          graphics.fillRect(50, 6, 2, 4);
          
          // Floating particles around Anders
          graphics.fillStyle(0xFF0000, 0.6);
          graphics.fillCircle(8, 20, 2);
          graphics.fillCircle(56, 24, 1.5);
          graphics.fillCircle(12, 50, 1.5);
          graphics.fillCircle(52, 48, 2);
          graphics.fillStyle(0xFFFF00, 0.4);
          graphics.fillCircle(6, 40, 1);
          graphics.fillCircle(58, 36, 1);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created improved ANDERS boss texture');
          return;
        }
        
        // Special athletic sprite for LARS HUGO with his iconic cap - IMPROVED
        if (enemy === 'lars-hugo') {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 66, 18, 4);
          
          // Running shoes with detail
          graphics.fillStyle(0xFF4500); // Orange running shoes
          graphics.fillRoundedRect(22, 62, 10, 5, 2);
          graphics.fillRoundedRect(32, 62, 10, 5, 2);
          // Shoe stripes
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(24, 63, 6, 1);
          graphics.fillRect(34, 63, 6, 1);
          // Shoe soles
          graphics.fillStyle(0x333333);
          graphics.fillRect(22, 66, 10, 2);
          graphics.fillRect(32, 66, 10, 2);
          
          // Athletic legs
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRoundedRect(25, 54, 6, 10, 2);
          graphics.fillRoundedRect(33, 54, 6, 10, 2);
          
          // Athletic shorts with stripe
          graphics.fillStyle(0x000080); // Navy shorts
          graphics.fillRoundedRect(22, 46, 20, 10, 3);
          // White stripe on shorts
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(22, 48, 20, 2);
          
          // Athletic body (green running shirt with number)
          graphics.fillStyle(0x228B22); // Forest green
          graphics.fillRoundedRect(20, 28, 24, 20, 4);
          // Shirt highlights
          graphics.fillStyle(0x2eaa2e);
          graphics.fillRect(22, 30, 8, 16);
          // Racing number
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(28, 32, 10, 12, 2);
          graphics.fillStyle(0x000000);
          graphics.fillRect(31, 34, 4, 8); // Number "1"
          
          // Athletic arms
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRoundedRect(14, 30, 7, 14, 3);
          graphics.fillRoundedRect(43, 30, 7, 14, 3);
          // Hands in running position
          graphics.fillCircle(16, 44, 4);
          graphics.fillCircle(48, 44, 4);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 20, 8, 10);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 16, 12);
          
          // THE ICONIC CAP! - Blue baseball cap with better detail
          graphics.fillStyle(0x1873CC); // Darker blue base
          graphics.fillEllipse(32, 8, 14, 6);
          graphics.fillStyle(0x1E90FF); // Dodger blue cap front
          graphics.fillRoundedRect(18, 4, 28, 10, 4);
          // Cap visor/brim with depth
          graphics.fillStyle(0x1565C0);
          graphics.fillRoundedRect(14, 12, 22, 5, 2);
          graphics.fillStyle(0x1E90FF);
          graphics.fillRoundedRect(14, 12, 22, 3, 2);
          // Cap button on top
          graphics.fillStyle(0xFFFFFF);
          graphics.fillCircle(32, 4, 2);
          // Cap logo (simple A for athlete)
          graphics.fillStyle(0xFFFFFF);
          graphics.fillTriangle(30, 10, 32, 6, 34, 10);
          
          // Happy athletic eyes
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 16, 4, 3);
          graphics.fillEllipse(37, 16, 4, 3);
          graphics.fillStyle(0x4a7023); // Green eyes
          graphics.fillCircle(27, 16, 2);
          graphics.fillCircle(37, 16, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 16, 1);
          graphics.fillCircle(37, 16, 1);
          
          // Friendly smile
          graphics.lineStyle(2, 0x8B4513);
          graphics.beginPath();
          graphics.arc(32, 20, 5, 0.3, Math.PI - 0.3, false);
          graphics.strokePath();
          
          // Rosy cheeks (athletic glow)
          graphics.fillStyle(0xFFB6C1, 0.5);
          graphics.fillCircle(22, 18, 3);
          graphics.fillCircle(42, 18, 3);
          
          // Sweat drops (he's been training!)
          graphics.fillStyle(0x87CEEB);
          graphics.fillCircle(48, 14, 2.5);
          graphics.fillCircle(50, 20, 2);
          graphics.fillCircle(52, 28, 1.5);
          // Sweat highlight
          graphics.fillStyle(0xFFFFFF, 0.7);
          graphics.fillCircle(47, 13, 1);
          graphics.fillCircle(49, 19, 0.8);
          
          // Motion lines (he's fast!)
          graphics.lineStyle(2, 0xCCCCCC, 0.5);
          graphics.lineBetween(4, 30, 12, 30);
          graphics.lineBetween(6, 40, 14, 40);
          graphics.lineBetween(4, 50, 12, 50);
          
          graphics.generateTexture(key, 64, 68);
          graphics.destroy();
          console.log('Created improved Lars Hugo athlete texture with cap');
          return;
        }
        
        // Special professional businessman sprite for OLE JAKOB
        if (enemy === 'ole-jakob') {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 62, 18, 5);
          
          // Polished dress shoes
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(20, 58, 10, 5, 2);
          graphics.fillRoundedRect(34, 58, 10, 5, 2);
          // Shoe shine
          graphics.fillStyle(0x333333);
          graphics.fillRect(22, 59, 4, 2);
          graphics.fillRect(36, 59, 4, 2);
          
          // Suit pants - tailored
          graphics.fillStyle(0x1a365d); // Navy blue
          graphics.fillRoundedRect(23, 44, 8, 16, 2);
          graphics.fillRoundedRect(33, 44, 8, 16, 2);
          // Pants crease
          graphics.lineStyle(1, 0x0f2445);
          graphics.lineBetween(27, 46, 27, 58);
          graphics.lineBetween(37, 46, 37, 58);
          
          // Suit jacket body - premium tailored look
          graphics.fillStyle(0x1a365d);
          graphics.fillRoundedRect(16, 24, 32, 24, 4);
          // Jacket lapels
          graphics.fillStyle(0x152a4a);
          graphics.fillTriangle(24, 24, 32, 36, 24, 48);
          graphics.fillTriangle(40, 24, 32, 36, 40, 48);
          // Jacket buttons
          graphics.fillStyle(0xFFD700);
          graphics.fillCircle(32, 36, 2);
          graphics.fillCircle(32, 42, 2);
          
          // White dress shirt visible
          graphics.fillStyle(0xffffff);
          graphics.fillRect(28, 26, 8, 20);
          
          // Golden tie
          graphics.fillStyle(0xFFD700);
          graphics.fillTriangle(30, 26, 32, 30, 34, 26); // Knot
          graphics.fillRect(31, 30, 2, 14); // Tie body
          graphics.fillTriangle(30, 44, 32, 48, 34, 44); // Tie point
          
          // Suit jacket sleeves/arms
          graphics.fillStyle(0x1a365d);
          graphics.fillRoundedRect(10, 26, 8, 20, 3);
          graphics.fillRoundedRect(46, 26, 8, 20, 3);
          // Shirt cuffs
          graphics.fillStyle(0xffffff);
          graphics.fillRect(10, 42, 8, 4);
          graphics.fillRect(46, 42, 8, 4);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(14, 48, 4);
          graphics.fillCircle(50, 48, 4);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 18, 8, 8);
          
          // Head - professional, confident
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 12, 12);
          
          // Well-groomed hair
          graphics.fillStyle(0x2c2c2c);
          graphics.fillEllipse(32, 6, 13, 7);
          graphics.fillRect(20, 6, 6, 6);
          graphics.fillRect(38, 6, 6, 6);
          // Hair part
          graphics.lineStyle(1, 0x1a1a1a);
          graphics.lineBetween(28, 2, 28, 8);
          
          // Confident eyes
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 12, 4, 3);
          graphics.fillEllipse(37, 12, 4, 3);
          graphics.fillStyle(0x1a365d); // Blue eyes matching suit
          graphics.fillCircle(27, 12, 2);
          graphics.fillCircle(37, 12, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 12, 1);
          graphics.fillCircle(37, 12, 1);
          
          // Slight knowing eyebrow raise
          graphics.lineStyle(2, 0x2c2c2c);
          graphics.lineBetween(24, 8, 30, 9);
          graphics.lineBetween(34, 9, 40, 8);
          
          // Confident, friendly smile
          graphics.lineStyle(2, 0x8B4513);
          graphics.beginPath();
          graphics.arc(32, 16, 4, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          
          // Glasses (professional look)
          graphics.lineStyle(1, 0x333333);
          graphics.strokeCircle(27, 12, 5);
          graphics.strokeCircle(37, 12, 5);
          graphics.lineBetween(32, 12, 32, 12);
          graphics.lineBetween(22, 12, 20, 10);
          graphics.lineBetween(42, 12, 44, 10);
          
          // Pocket square
          graphics.fillStyle(0xFFD700);
          graphics.fillTriangle(18, 28, 22, 28, 20, 32);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Ole Jakob professional businessman texture');
          return;
        }
        
        // Special medical professional sprite for KRISTIANE - lab coat and blonde hair
        if (enemy === 'kristiane') {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 62, 18, 5);
          
          // Professional shoes
          graphics.fillStyle(0xFFFFFF); // White medical shoes
          graphics.fillRoundedRect(22, 58, 10, 5, 2);
          graphics.fillRoundedRect(32, 58, 10, 5, 2);
          // Shoe soles
          graphics.fillStyle(0xCCCCCC);
          graphics.fillRect(22, 62, 10, 2);
          graphics.fillRect(32, 62, 10, 2);
          
          // Legs with scrub pants
          graphics.fillStyle(0x2E8B57); // Sea green scrubs
          graphics.fillRoundedRect(24, 44, 8, 16, 2);
          graphics.fillRoundedRect(32, 44, 8, 16, 2);
          
          // Lab coat body - long white coat
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(14, 22, 36, 32, 4);
          // Lab coat shading
          graphics.fillStyle(0xF5F5F5);
          graphics.fillRect(14, 22, 8, 32);
          graphics.fillRect(42, 22, 8, 32);
          // Lab coat lapels
          graphics.fillStyle(0xEEEEEE);
          graphics.fillTriangle(24, 22, 32, 34, 24, 46);
          graphics.fillTriangle(40, 22, 32, 34, 40, 46);
          // Lab coat buttons
          graphics.fillStyle(0xCCCCCC);
          graphics.fillCircle(32, 36, 2);
          graphics.fillCircle(32, 42, 2);
          graphics.fillCircle(32, 48, 2);
          
          // Scrub top visible underneath
          graphics.fillStyle(0x2E8B57);
          graphics.fillRect(28, 24, 8, 22);
          
          // Stethoscope around neck
          graphics.fillStyle(0x333333);
          graphics.lineStyle(3, 0x333333);
          graphics.beginPath();
          graphics.arc(32, 30, 10, 0.5, Math.PI - 0.5, false);
          graphics.strokePath();
          // Stethoscope chest piece
          graphics.fillStyle(0xC0C0C0);
          graphics.fillCircle(22, 34, 4);
          graphics.fillStyle(0x666666);
          graphics.fillCircle(22, 34, 2);
          
          // Lab coat sleeves/arms
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(8, 24, 8, 22, 3);
          graphics.fillRoundedRect(48, 24, 8, 22, 3);
          // Sleeve cuffs
          graphics.fillStyle(0xEEEEEE);
          graphics.fillRect(8, 42, 8, 4);
          graphics.fillRect(48, 42, 8, 4);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(12, 48, 4);
          graphics.fillCircle(52, 48, 4);
          
          // Clipboard in hand
          graphics.fillStyle(0x8B4513);
          graphics.fillRoundedRect(48, 40, 12, 16, 2);
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(49, 44, 10, 11);
          // Clipboard clip
          graphics.fillStyle(0xC0C0C0);
          graphics.fillRect(51, 40, 6, 3);
          // Medical cross on clipboard
          graphics.fillStyle(0xFF0000);
          graphics.fillRect(53, 47, 2, 6);
          graphics.fillRect(51, 49, 6, 2);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 16, 8, 8);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 12, 12);
          
          // Beautiful blonde hair - styled professionally
          graphics.fillStyle(0xF4D03F); // Golden blonde
          graphics.fillEllipse(32, 6, 14, 8);
          // Hair sides flowing down
          graphics.fillStyle(0xF4D03F);
          graphics.fillRoundedRect(18, 4, 6, 14, 3);
          graphics.fillRoundedRect(40, 4, 6, 14, 3);
          // Hair highlights
          graphics.fillStyle(0xFAE596);
          graphics.fillRect(26, 2, 4, 6);
          graphics.fillRect(34, 2, 4, 6);
          // Hair part
          graphics.lineStyle(1, 0xD4AC0D);
          graphics.lineBetween(32, 0, 32, 6);
          
          // Friendly intelligent eyes
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 12, 4, 3);
          graphics.fillEllipse(37, 12, 4, 3);
          graphics.fillStyle(0x3498DB); // Bright blue eyes
          graphics.fillCircle(27, 12, 2);
          graphics.fillCircle(37, 12, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 12, 1);
          graphics.fillCircle(37, 12, 1);
          // Eye sparkle
          graphics.fillStyle(0xFFFFFF, 0.8);
          graphics.fillCircle(26, 11, 0.8);
          graphics.fillCircle(36, 11, 0.8);
          
          // Professional eyebrows
          graphics.lineStyle(1.5, 0xD4AC0D);
          graphics.lineBetween(24, 8, 30, 9);
          graphics.lineBetween(34, 9, 40, 8);
          
          // Warm, caring smile
          graphics.lineStyle(2, 0xE08080);
          graphics.beginPath();
          graphics.arc(32, 16, 4, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          
          // Rosy cheeks
          graphics.fillStyle(0xFFB6C1, 0.4);
          graphics.fillCircle(22, 14, 3);
          graphics.fillCircle(42, 14, 3);
          
          // Professional glasses
          graphics.lineStyle(1.5, 0x333333);
          graphics.strokeCircle(27, 12, 5);
          graphics.strokeCircle(37, 12, 5);
          graphics.lineBetween(32, 12, 32, 12);
          graphics.lineBetween(22, 12, 20, 10);
          graphics.lineBetween(42, 12, 44, 10);
          
          // Name badge on lab coat
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(38, 26, 12, 8, 1);
          graphics.lineStyle(1, 0xCCCCCC);
          graphics.strokeRoundedRect(38, 26, 12, 8, 1);
          // Red medical cross on badge
          graphics.fillStyle(0xFF0000);
          graphics.fillRect(42, 27, 2, 6);
          graphics.fillRect(40, 29, 6, 2);
          
          // Pen in pocket
          graphics.fillStyle(0x1E90FF);
          graphics.fillRect(18, 26, 2, 8);
          graphics.fillStyle(0x000000);
          graphics.fillRect(18, 26, 2, 2);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Kristiane medical professional texture with blonde hair and lab coat');
          return;
        }
        
        // Special drummer sprite for FREDRIK - band shirt, drumsticks, and DRUMS!
        if (enemy === 'fredrik') {
          // Shadow (larger for drum kit)
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 74, 28, 6);
          
          // SNARE DRUM in front
          graphics.fillStyle(0xC0C0C0); // Chrome shell
          graphics.fillEllipse(32, 68, 20, 6);
          graphics.fillStyle(0x8B0000); // Red shell sides
          graphics.fillRect(12, 62, 40, 8);
          graphics.fillStyle(0xC0C0C0); // Chrome rim
          graphics.fillRect(12, 60, 40, 3);
          // Drum head (top)
          graphics.fillStyle(0xF5F5DC); // Cream drum head
          graphics.fillEllipse(32, 60, 18, 5);
          // Tension rods
          graphics.fillStyle(0x666666);
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = 32 + Math.cos(angle) * 16;
            const y = 60 + Math.sin(angle) * 4;
            graphics.fillCircle(x, y, 1.5);
          }
          
          // HI-HAT on left side
          graphics.fillStyle(0xFFD700); // Gold cymbal
          graphics.fillEllipse(6, 52, 8, 3);
          graphics.fillEllipse(6, 50, 8, 3);
          // Hi-hat stand
          graphics.fillStyle(0x666666);
          graphics.fillRect(5, 52, 2, 20);
          
          // CRASH CYMBAL on right side
          graphics.fillStyle(0xFFD700);
          graphics.fillEllipse(58, 48, 10, 4);
          // Cymbal stand
          graphics.fillStyle(0x666666);
          graphics.fillRect(57, 50, 2, 22);
          
          // Worn sneakers (rocker style) - moved up
          graphics.fillStyle(0x2c2c2c);
          graphics.fillRoundedRect(22, 52, 8, 4, 2);
          graphics.fillRoundedRect(34, 52, 8, 4, 2);
          // White toe caps
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(22, 54, 8, 2, 1);
          graphics.fillRoundedRect(34, 54, 8, 2, 1);
          
          // Skinny black jeans - shortened
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(24, 40, 7, 14, 2);
          graphics.fillRoundedRect(33, 40, 7, 14, 2);
          
          // Band t-shirt - BLACK with graphic
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(18, 22, 28, 20, 4);
          // Band logo area (stylized skull/rock symbol)
          graphics.fillStyle(0xFFFFFF);
          graphics.fillCircle(32, 30, 6);
          graphics.fillStyle(0x1a1a1a);
          graphics.fillCircle(29, 29, 1.5);
          graphics.fillCircle(35, 29, 1.5);
          graphics.fillRect(30, 33, 4, 2);
          // Lightning bolts on shirt
          graphics.fillStyle(0xFFD700);
          graphics.fillTriangle(22, 26, 24, 32, 26, 26);
          graphics.fillTriangle(38, 26, 40, 32, 42, 26);
          
          // Arms raised with drumsticks - in playing position
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRoundedRect(10, 24, 7, 14, 3);
          graphics.fillRoundedRect(47, 24, 7, 14, 3);
          // Hands gripping drumsticks (raised)
          graphics.fillCircle(12, 38, 4);
          graphics.fillCircle(52, 38, 4);
          
          // DRUMSTICKS hitting the drum!
          graphics.fillStyle(0xDEB887);
          graphics.lineStyle(3, 0xDEB887);
          // Left drumstick - coming down to hit snare
          graphics.lineBetween(8, 32, 24, 56);
          // Right drumstick - coming down to hit snare
          graphics.lineBetween(56, 32, 40, 56);
          // Drumstick tips near drum head
          graphics.fillStyle(0xF5DEB3);
          graphics.fillCircle(24, 56, 2.5);
          graphics.fillCircle(40, 56, 2.5);
          
          // Impact stars on drum (he's playing!)
          graphics.fillStyle(0xFFFF00, 0.8);
          graphics.fillCircle(26, 58, 3);
          graphics.fillCircle(38, 58, 3);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 16, 8, 8);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 10, 11);
          
          // Messy rocker hair - wild and spiky
          graphics.fillStyle(0x2c2c2c);
          graphics.fillEllipse(32, 4, 13, 7);
          // Spiky hair bits
          graphics.fillTriangle(20, 6, 18, -2, 24, 4);
          graphics.fillTriangle(28, 2, 26, -4, 32, 2);
          graphics.fillTriangle(36, 2, 38, -4, 34, 4);
          graphics.fillTriangle(44, 6, 46, -2, 40, 4);
          // Side hair
          graphics.fillRect(19, 4, 4, 10);
          graphics.fillRect(41, 4, 4, 10);
          
          // Energetic eyes
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 10, 4, 3);
          graphics.fillEllipse(37, 10, 4, 3);
          graphics.fillStyle(0x4a3728);
          graphics.fillCircle(27, 10, 2);
          graphics.fillCircle(37, 10, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 10, 1);
          graphics.fillCircle(37, 10, 1);
          
          // Excited eyebrows
          graphics.lineStyle(2, 0x2c2c2c);
          graphics.lineBetween(24, 5, 30, 6);
          graphics.lineBetween(34, 6, 40, 5);
          
          // Big excited grin
          graphics.lineStyle(2, 0x8B4513);
          graphics.beginPath();
          graphics.arc(32, 14, 5, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          // Teeth showing
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(28, 14, 8, 3);
          
          // Stubble
          graphics.fillStyle(0x444444, 0.3);
          graphics.fillRect(24, 16, 16, 4);
          
          // Earring (small hoop)
          graphics.lineStyle(2, 0xC0C0C0);
          graphics.strokeCircle(19, 12, 3);
          
          // Sweatband on wrist
          graphics.fillStyle(0xFF0000);
          graphics.fillRect(10, 34, 7, 4);
          graphics.fillRect(47, 34, 7, 4);
          
          // Music notes floating (he's always got rhythm)
          graphics.fillStyle(0xFF4500);
          graphics.fillCircle(4, 10, 3);
          graphics.fillRect(6, 4, 2, 8);
          graphics.fillStyle(0xFFD700);
          graphics.fillCircle(60, 8, 2.5);
          graphics.fillRect(62, 2, 2, 8);
          
          graphics.generateTexture(key, 64, 78);
          graphics.destroy();
          console.log('Created Fredrik drummer texture with band shirt, drumsticks, and drum kit');
          return;
        }
        
        // IMPROVED Regular enemy sprite generation
        // Shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(32, 60, 20, 5);
        
        // Legs with shoes
        graphics.fillStyle(0x2c2c2c); // Dark pants
        graphics.fillRoundedRect(24, 50, 7, 12, 2);
        graphics.fillRoundedRect(33, 50, 7, 12, 2);
        // Shoes
        graphics.fillStyle(0x1a1a1a);
        graphics.fillRoundedRect(22, 60, 10, 4, 2);
        graphics.fillRoundedRect(32, 60, 10, 4, 2);
        
        // Body (different color per enemy type) - with suit jacket effect
        const darkerColor = Phaser.Display.Color.ValueToColor(style.color).darken(30).color;
        graphics.fillStyle(darkerColor);
        graphics.fillRoundedRect(18, 28, 28, 24, 4);
        // Jacket highlight
        graphics.fillStyle(style.color);
        graphics.fillRoundedRect(20, 30, 24, 20, 3);
        // Shirt/tie
        graphics.fillStyle(0xffffff);
        graphics.fillRect(30, 30, 4, 16);
        graphics.fillStyle(style.accessory);
        graphics.fillTriangle(30, 30, 32, 34, 34, 30);
        graphics.fillRect(31, 34, 2, 12);
        
        // Arms with hands
        graphics.fillStyle(style.color);
        graphics.fillRoundedRect(10, 32, 8, 18, 3);
        graphics.fillRoundedRect(46, 32, 8, 18, 3);
        // Hands
        graphics.fillStyle(0xFFDBB5);
        graphics.fillCircle(14, 50, 4);
        graphics.fillCircle(50, 50, 4);
        
        // Briefcase/folder in hand
        graphics.fillStyle(style.accessory);
        graphics.fillRoundedRect(6, 48, 12, 8, 2);
        graphics.lineStyle(1, 0x000000);
        graphics.strokeRoundedRect(6, 48, 12, 8, 2);
        // Handle
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(10, 46, 4, 3);
        
        // Neck
        graphics.fillStyle(0xFFDBB5);
        graphics.fillRect(28, 22, 8, 8);
        
        // Head with better shape
        graphics.fillStyle(0xFFDBB5);
        graphics.fillCircle(32, 16, 12);
        
        // Hair (professional style)
        graphics.fillStyle(0x3C3C3C);
        graphics.fillEllipse(32, 8, 12, 8);
        graphics.fillRect(21, 8, 5, 8);
        graphics.fillRect(38, 8, 5, 8);
        
        // Face details - angry business person
        // Eyes with detail
        graphics.fillStyle(0xffffff);
        graphics.fillEllipse(27, 16, 4, 3);
        graphics.fillEllipse(37, 16, 4, 3);
        graphics.fillStyle(0x000000);
        graphics.fillCircle(27, 16, 2);
        graphics.fillCircle(37, 16, 2);
        
        // Angry eyebrows
        graphics.lineStyle(2, 0x3C3C3C);
        graphics.lineBetween(23, 11, 30, 13);
        graphics.lineBetween(34, 13, 41, 11);
        
        // Frown
        graphics.lineStyle(2, 0x8B4513);
        graphics.beginPath();
        graphics.arc(32, 24, 4, Math.PI + 0.3, -0.3, false);
        graphics.strokePath();
        
        // Optional: glasses for some enemies
        if (enemy === 'auditor' || enemy === 'data-analyst' || enemy === 'research-director') {
          graphics.lineStyle(1, 0x000000);
          graphics.strokeCircle(27, 16, 5);
          graphics.strokeCircle(37, 16, 5);
          graphics.lineBetween(32, 16, 32, 16);
        }
        
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
