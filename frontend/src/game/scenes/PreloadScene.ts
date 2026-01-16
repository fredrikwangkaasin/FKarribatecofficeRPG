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
      'fredrik', // Drummer who wears band shirts and asks pop quiz questions
      'henrik', // Bald guy with mustache and purple scarf who asks Dark Souls questions
      'nils', // Small brown dog who speaks only in dog language
      'anna' // Danish woman with dark hair who asks questions about Denmark
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
      'fredrik': { color: 0x1a1a1a, accessory: 0xFF4500, isDrummer: true }, // Fredrik - Band shirt drummer
      'henrik': { color: 0x2c2c2c, accessory: 0x800080, isDarkSouls: true }, // Henrik - Bald with mustache and purple scarf
      'nils': { color: 0xA0522D, accessory: 0xFFD700, isDog: true }, // Nils - American Hairless Terrier with auburn fur
      'tufte': { color: 0x4169E1, accessory: 0xFFD700, isTufte: true }, // Tufte - Woman with long blond hair and distinct eyebrows
      'mats': { color: 0x2F4F4F, accessory: 0x00CED1, isMats: true }, // Mats - Man with long dark beard
      'anya': { color: 0x800020, accessory: 0x333333, isAnya: true }, // Anya - Woman with dark hair and glasses, bartender
      'martine': { color: 0x1a1a1a, accessory: 0xFFD700, isMartine: true }, // Martine - Blond woman with black clothing, Twilight fan
      'anna': { color: 0xC41E3A, accessory: 0xFFFFFF, isAnna: true } // Anna - Danish woman with dark hair
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
        
        // HENRIK - Bald guy with mustache and purple scarf, Dark Souls expert
        if ((style as any).isDarkSouls) {
          // Shadow
          graphics.fillStyle(0x000000, 0.4);
          graphics.fillEllipse(32, 62, 18, 5);
          
          // Dark boots (souls-like aesthetic)
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(22, 55, 9, 8, 2);
          graphics.fillRoundedRect(33, 55, 9, 8, 2);
          // Boot buckles
          graphics.fillStyle(0xC0C0C0);
          graphics.fillRect(24, 57, 5, 2);
          graphics.fillRect(35, 57, 5, 2);
          
          // Dark pants
          graphics.fillStyle(0x2c2c2c);
          graphics.fillRoundedRect(24, 40, 7, 16, 2);
          graphics.fillRoundedRect(33, 40, 7, 16, 2);
          
          // Dark hoodie/jacket (souls vibe)
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(16, 22, 32, 20, 4);
          // Hoodie detail
          graphics.fillStyle(0x2c2c2c);
          graphics.fillRoundedRect(18, 24, 28, 16, 3);
          // Hood behind head
          graphics.fillStyle(0x1a1a1a);
          graphics.fillEllipse(32, 6, 16, 10);
          
          // Purple scarf wrapped around neck (prominent!)
          graphics.fillStyle(0x800080);
          graphics.fillRoundedRect(20, 18, 24, 8, 3);
          // Scarf ends hanging down
          graphics.fillStyle(0x800080);
          graphics.fillRoundedRect(16, 22, 6, 18, 2);
          graphics.fillRoundedRect(42, 22, 6, 18, 2);
          // Scarf tips
          graphics.fillTriangle(16, 40, 22, 40, 19, 46);
          graphics.fillTriangle(42, 40, 48, 40, 45, 46);
          // Scarf wrap detail
          graphics.fillStyle(0x9932CC);
          graphics.fillRect(22, 19, 20, 2);
          graphics.fillRect(18, 24, 4, 14);
          graphics.fillRect(42, 24, 4, 14);
          
          // Arms
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(8, 26, 8, 16, 3);
          graphics.fillRoundedRect(48, 26, 8, 16, 3);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(12, 44, 4);
          graphics.fillCircle(52, 44, 4);
          
          // Estus Flask in hand! (iconic Dark Souls item)
          graphics.fillStyle(0xFF6600);
          graphics.fillRoundedRect(4, 40, 8, 12, 3);
          graphics.fillStyle(0xFFAA00);
          graphics.fillRect(6, 42, 4, 8);
          // Flask cork
          graphics.fillStyle(0x8B4513);
          graphics.fillRect(6, 38, 4, 3);
          // Fire glow from flask
          graphics.fillStyle(0xFFFF00, 0.5);
          graphics.fillCircle(8, 44, 6);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 14, 8, 6);
          
          // Head - BALD
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 8, 12);
          // Bald head shine
          graphics.fillStyle(0xFFE4C4, 0.6);
          graphics.fillCircle(28, 4, 4);
          
          // Prominent MUSTACHE
          graphics.fillStyle(0x4a3728);
          // Left side of mustache
          graphics.fillEllipse(26, 14, 6, 3);
          // Right side of mustache
          graphics.fillEllipse(38, 14, 6, 3);
          // Center of mustache
          graphics.fillRect(28, 13, 8, 3);
          // Mustache curls at ends
          graphics.fillCircle(20, 14, 2);
          graphics.fillCircle(44, 14, 2);
          
          // Eyes - wise/knowing look
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 8, 4, 3);
          graphics.fillEllipse(37, 8, 4, 3);
          graphics.fillStyle(0x4a3728);
          graphics.fillCircle(27, 8, 2);
          graphics.fillCircle(37, 8, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 8, 1);
          graphics.fillCircle(37, 8, 1);
          
          // Slight furrowed brow (serious gamer)
          graphics.lineStyle(2, 0x8B7355);
          graphics.lineBetween(23, 4, 30, 5);
          graphics.lineBetween(34, 5, 41, 4);
          
          // Small knowing smile under mustache
          graphics.lineStyle(2, 0x8B4513);
          graphics.beginPath();
          graphics.arc(32, 18, 3, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          
          // Ears
          graphics.fillStyle(0xFFDBB5);
          graphics.fillEllipse(19, 8, 3, 5);
          graphics.fillEllipse(45, 8, 3, 5);
          
          // "YOU DIED" text floating above (Dark Souls reference)
          graphics.fillStyle(0x8B0000, 0.8);
          graphics.fillRect(18, -10, 28, 8);
          graphics.fillStyle(0xFF0000);
          // Simple skull icon instead of text
          graphics.fillCircle(32, -6, 4);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(30, -7, 1);
          graphics.fillCircle(34, -7, 1);
          graphics.fillRect(30, -4, 4, 2);
          
          graphics.generateTexture(key, 64, 72);
          graphics.destroy();
          console.log('Created Henrik Dark Souls texture with bald head, mustache, and purple scarf');
          return;
        }
        
        // NILS - American Hairless Terrier with auburn fur
        if ((style as any).isDog) {
          // Auburn/reddish-brown color palette
          const auburnMain = 0xA0522D;      // Main auburn body
          const auburnLight = 0xCD853F;     // Lighter auburn highlights
          const auburnDark = 0x8B4513;      // Darker auburn shadows
          const skinPink = 0xE8B4B8;        // Pink skin showing through
          
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 58, 18, 4);
          
          // === BODY (draw first as base) ===
          // Main body - large oval
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(32, 40, 18, 12);
          
          // Chest/front body connecting to neck
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(18, 38, 10, 10);
          
          // Rear/hip area
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(46, 40, 8, 10);
          
          // Belly highlight
          graphics.fillStyle(auburnLight);
          graphics.fillEllipse(32, 44, 14, 6);
          
          // Skin showing through (hairless look)
          graphics.fillStyle(skinPink, 0.25);
          graphics.fillEllipse(30, 42, 12, 6);
          
          // === LEGS (connected to body) ===
          // Back left leg
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(22, 48, 4, 8);
          graphics.fillEllipse(22, 54, 3, 5);
          graphics.fillStyle(auburnDark);
          graphics.fillEllipse(22, 58, 4, 2);
          
          // Back right leg
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(42, 48, 4, 8);
          graphics.fillEllipse(42, 54, 3, 5);
          graphics.fillStyle(auburnDark);
          graphics.fillEllipse(42, 58, 4, 2);
          
          // Front left leg
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(14, 46, 4, 8);
          graphics.fillEllipse(14, 54, 3, 5);
          graphics.fillStyle(auburnDark);
          graphics.fillEllipse(14, 58, 4, 2);
          
          // Front right leg (slightly behind)
          graphics.fillStyle(auburnDark);
          graphics.fillEllipse(24, 46, 3, 7);
          graphics.fillEllipse(24, 53, 2, 4);
          graphics.fillEllipse(24, 57, 3, 2);
          
          // === TAIL (connected to rear) ===
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(52, 36, 6, 3);
          graphics.fillEllipse(56, 32, 4, 2);
          graphics.fillEllipse(58, 28, 3, 2);
          graphics.fillStyle(auburnLight);
          graphics.fillCircle(59, 26, 2);
          
          // === NECK (connecting body to head) ===
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(12, 34, 8, 8);
          graphics.fillEllipse(10, 30, 7, 7);
          
          // === HEAD ===
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(8, 22, 10, 10);
          
          // Forehead highlight
          graphics.fillStyle(auburnLight);
          graphics.fillEllipse(8, 18, 6, 4);
          
          // === MUZZLE (connected to head) ===
          graphics.fillStyle(auburnMain);
          graphics.fillEllipse(2, 24, 8, 6);
          graphics.fillStyle(auburnLight);
          graphics.fillEllipse(0, 25, 6, 4);
          
          // Nose
          graphics.fillStyle(0x1a1a1a);
          graphics.fillCircle(-4, 25, 3);
          graphics.fillStyle(0x333333);
          graphics.fillCircle(-5, 24, 1);
          
          // === EARS (bat-like, erect) ===
          graphics.fillStyle(auburnMain);
          graphics.fillTriangle(2, 22, 0, 8, 8, 14);
          graphics.fillTriangle(14, 22, 12, 8, 20, 14);
          // Inner ear pink
          graphics.fillStyle(skinPink);
          graphics.fillTriangle(3, 20, 1, 10, 7, 15);
          graphics.fillTriangle(13, 20, 13, 10, 18, 15);
          
          // === EYES ===
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(4, 20, 3, 2.5);
          graphics.fillEllipse(11, 20, 3, 2.5);
          graphics.fillStyle(0x4a3728);
          graphics.fillCircle(4, 20, 1.5);
          graphics.fillCircle(11, 20, 1.5);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(4, 20, 0.8);
          graphics.fillCircle(11, 20, 0.8);
          // Eye shine
          graphics.fillStyle(0xffffff);
          graphics.fillCircle(3, 19, 0.5);
          graphics.fillCircle(10, 19, 0.5);
          
          // === MOUTH ===
          graphics.lineStyle(1, 0x1a1a1a);
          graphics.beginPath();
          graphics.arc(-1, 27, 2, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          // Tongue
          graphics.fillStyle(0xFF6B6B);
          graphics.fillEllipse(-1, 30, 2, 3);
          
          // === COLLAR ===
          graphics.fillStyle(0xFF0000);
          graphics.fillRoundedRect(6, 30, 8, 3, 1);
          graphics.fillStyle(0xFFD700);
          graphics.fillCircle(10, 34, 2);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Nils - American Hairless Terrier with auburn fur');
          return;
        }
        
        // TUFTE - Woman with long blond hair and distinct eyebrows
        if ((style as any).isTufte) {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 60, 18, 4);
          
          // Legs with professional pants
          graphics.fillStyle(0x2F4F4F);
          graphics.fillRoundedRect(24, 48, 8, 14, 3);
          graphics.fillRoundedRect(32, 48, 8, 14, 3);
          // Professional shoes
          graphics.fillStyle(0x1a1a1a);
          graphics.fillEllipse(28, 61, 5, 2);
          graphics.fillEllipse(36, 61, 5, 2);
          
          // Body - professional blue blouse
          graphics.fillStyle(0x4169E1);
          graphics.fillRoundedRect(20, 26, 24, 24, 4);
          // Darker cardigan/jacket
          graphics.fillStyle(0x2F4F4F);
          graphics.fillRoundedRect(18, 26, 6, 22, 2);
          graphics.fillRoundedRect(40, 26, 6, 22, 2);
          // Blouse collar
          graphics.fillStyle(0xFFFFFF);
          graphics.fillTriangle(28, 26, 32, 32, 36, 26);
          
          // Arms
          graphics.fillStyle(0x2F4F4F);
          graphics.fillRoundedRect(12, 28, 8, 16, 3);
          graphics.fillRoundedRect(44, 28, 8, 16, 3);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(16, 46, 4);
          graphics.fillCircle(48, 46, 4);
          
          // Book/notepad in hand (political analyst)
          graphics.fillStyle(0x8B0000);
          graphics.fillRoundedRect(42, 40, 10, 12, 1);
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(44, 42, 6, 8);
          // Book binding
          graphics.fillStyle(0xDAA520);
          graphics.fillRect(42, 40, 2, 12);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 18, 8, 10);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 12, 12);
          
          // Long blond hair - flowing behind and around face
          graphics.fillStyle(0xFFD700);
          // Back hair layer
          graphics.fillEllipse(32, 14, 16, 14);
          // Hair going down left side
          graphics.fillRoundedRect(16, 8, 8, 30, 4);
          // Hair going down right side
          graphics.fillRoundedRect(40, 8, 8, 30, 4);
          // Top of head hair
          graphics.fillEllipse(32, 4, 14, 8);
          // Fringe/bangs
          graphics.fillStyle(0xFFD700);
          graphics.fillEllipse(26, 4, 6, 4);
          graphics.fillEllipse(38, 4, 6, 4);
          graphics.fillEllipse(32, 2, 8, 4);
          
          // Face (draw over hair)
          graphics.fillStyle(0xFFDBB5);
          graphics.fillEllipse(32, 12, 10, 10);
          
          // DISTINCT EYEBROWS - prominent and expressive
          graphics.fillStyle(0x8B7355);
          // Left eyebrow - thick and arched
          graphics.fillRoundedRect(23, 6, 8, 3, 1);
          // Right eyebrow - thick and arched
          graphics.fillRoundedRect(33, 6, 8, 3, 1);
          // Add extra thickness to make them really stand out
          graphics.fillStyle(0x5C4033);
          graphics.fillRoundedRect(24, 5, 6, 2, 1);
          graphics.fillRoundedRect(34, 5, 6, 2, 1);
          
          // Eyes - intelligent, analytical look
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 11, 4, 3);
          graphics.fillEllipse(37, 11, 4, 3);
          graphics.fillStyle(0x4682B4); // Blue eyes
          graphics.fillCircle(27, 11, 2);
          graphics.fillCircle(37, 11, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 11, 1);
          graphics.fillCircle(37, 11, 1);
          // Eye shine
          graphics.fillStyle(0xffffff);
          graphics.fillCircle(26, 10, 0.8);
          graphics.fillCircle(36, 10, 0.8);
          
          // Small nose
          graphics.fillStyle(0xE8B4B8);
          graphics.fillEllipse(32, 14, 2, 2);
          
          // Slight smile
          graphics.lineStyle(1.5, 0xCC8080);
          graphics.beginPath();
          graphics.arc(32, 17, 3, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          
          // Norwegian flag pin
          graphics.fillStyle(0xFF0000);
          graphics.fillRect(10, 30, 6, 4);
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(11, 30, 2, 4);
          graphics.fillStyle(0x002868);
          graphics.fillRect(12, 30, 1, 4);
          
          // Ears (behind hair)
          graphics.fillStyle(0xFFDBB5);
          graphics.fillEllipse(20, 12, 2, 4);
          graphics.fillEllipse(44, 12, 2, 4);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Tufte - woman with long blond hair and distinct eyebrows');
          return;
        }
        
        // MATS - Man with long dark beard
        if ((style as any).isMats) {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 60, 18, 4);
          
          // Legs with jeans (tech guy casual)
          graphics.fillStyle(0x4169E1);
          graphics.fillRoundedRect(24, 48, 8, 14, 3);
          graphics.fillRoundedRect(32, 48, 8, 14, 3);
          // Sneakers
          graphics.fillStyle(0x2F4F4F);
          graphics.fillEllipse(28, 61, 6, 3);
          graphics.fillEllipse(36, 61, 6, 3);
          // Shoe accent
          graphics.fillStyle(0x00CED1);
          graphics.fillRect(25, 59, 3, 1);
          graphics.fillRect(37, 59, 3, 1);
          
          // Body - tech t-shirt
          graphics.fillStyle(0x2F4F4F);
          graphics.fillRoundedRect(20, 26, 24, 24, 4);
          // Tech logo on shirt (simple circuit pattern)
          graphics.lineStyle(1, 0x00CED1);
          graphics.lineBetween(28, 34, 36, 34);
          graphics.lineBetween(32, 30, 32, 38);
          graphics.fillStyle(0x00CED1);
          graphics.fillCircle(28, 34, 2);
          graphics.fillCircle(36, 34, 2);
          graphics.fillCircle(32, 30, 2);
          graphics.fillCircle(32, 38, 2);
          
          // Arms
          graphics.fillStyle(0x2F4F4F);
          graphics.fillRoundedRect(12, 28, 10, 16, 3);
          graphics.fillRoundedRect(42, 28, 10, 16, 3);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(17, 46, 4);
          graphics.fillCircle(47, 46, 4);
          
          // Laptop in hands (tech guy!)
          graphics.fillStyle(0x333333);
          graphics.fillRoundedRect(20, 44, 24, 14, 2);
          graphics.fillStyle(0x4169E1);
          graphics.fillRect(22, 46, 20, 10);
          // Screen glow
          graphics.fillStyle(0x00CED1, 0.3);
          graphics.fillRect(24, 48, 16, 6);
          // Code on screen
          graphics.fillStyle(0x00FF00);
          graphics.fillRect(24, 48, 8, 1);
          graphics.fillRect(26, 50, 6, 1);
          graphics.fillRect(24, 52, 10, 1);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 16, 8, 12);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 10, 12);
          
          // Good dark hair - full and styled
          graphics.fillStyle(0x1a1a1a);
          // Main hair volume on top
          graphics.fillEllipse(32, 2, 14, 10);
          graphics.fillEllipse(32, 0, 12, 8);
          // Side volume
          graphics.fillEllipse(22, 6, 6, 8);
          graphics.fillEllipse(42, 6, 6, 8);
          // Styled wave/swoop to the side
          graphics.fillEllipse(24, 0, 8, 6);
          graphics.fillEllipse(40, 2, 8, 5);
          // Top texture and volume
          graphics.fillStyle(0x2a2a2a);
          graphics.fillEllipse(28, -2, 6, 4);
          graphics.fillEllipse(36, -1, 6, 4);
          // Hair shine highlights
          graphics.fillStyle(0x3a3a3a);
          graphics.fillEllipse(30, 0, 4, 3);
          graphics.fillEllipse(34, 1, 4, 3);
          
          // LONG DARK BEARD - the defining feature!
          graphics.fillStyle(0x1a1a1a);
          // Beard base covering lower face and going down
          graphics.fillEllipse(32, 20, 12, 10);
          graphics.fillEllipse(32, 28, 10, 10);
          graphics.fillEllipse(32, 34, 8, 8);
          // Beard going even longer!
          graphics.fillEllipse(32, 40, 6, 6);
          // Mustache connecting to beard
          graphics.fillEllipse(27, 16, 5, 3);
          graphics.fillEllipse(37, 16, 5, 3);
          // Soul patch in center
          graphics.fillRect(30, 18, 4, 4);
          // Beard texture details
          graphics.fillStyle(0x2a2a2a);
          graphics.fillEllipse(28, 24, 3, 4);
          graphics.fillEllipse(36, 24, 3, 4);
          graphics.fillEllipse(32, 32, 4, 4);
          
          // Eyes - peering through
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 10, 4, 3);
          graphics.fillEllipse(37, 10, 4, 3);
          graphics.fillStyle(0x4a3728); // Brown eyes
          graphics.fillCircle(27, 10, 2);
          graphics.fillCircle(37, 10, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 10, 1);
          graphics.fillCircle(37, 10, 1);
          // Eye shine
          graphics.fillStyle(0xffffff);
          graphics.fillCircle(26, 9, 0.8);
          graphics.fillCircle(36, 9, 0.8);
          
          // Eyebrows
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(23, 6, 8, 2, 1);
          graphics.fillRoundedRect(33, 6, 8, 2, 1);
          
          // Nose (peeking through mustache area)
          graphics.fillStyle(0xE8B4B8);
          graphics.fillEllipse(32, 13, 3, 2);
          
          // Ears
          graphics.fillStyle(0xFFDBB5);
          graphics.fillEllipse(19, 10, 3, 5);
          graphics.fillEllipse(45, 10, 3, 5);
          
          // Headphones around neck (tech guy accessory)
          graphics.fillStyle(0x333333);
          graphics.fillEllipse(22, 24, 4, 3);
          graphics.fillEllipse(42, 24, 4, 3);
          graphics.lineStyle(2, 0x333333);
          graphics.beginPath();
          graphics.arc(32, 6, 14, Math.PI + 0.3, -0.3, false);
          graphics.strokePath();
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Mats - man with long dark beard and tech accessories');
          return;
        }
        
        // ANYA - Woman with dark hair and glasses (bartender)
        if ((style as any).isAnya) {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 60, 18, 4);
          
          // Legs with dark pants
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(26, 48, 6, 14, 2);
          graphics.fillRoundedRect(32, 48, 6, 14, 2);
          // Heeled shoes
          graphics.fillStyle(0x000000);
          graphics.fillEllipse(29, 61, 5, 3);
          graphics.fillEllipse(35, 61, 5, 3);
          
          // Body - bartender vest/apron
          graphics.fillStyle(0x800020); // Burgundy
          graphics.fillRoundedRect(22, 28, 20, 22, 4);
          // White shirt underneath
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(26, 30, 12, 8, 2);
          // Apron
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(24, 38, 16, 12, 2);
          // Apron pocket
          graphics.fillStyle(0x2a2a2a);
          graphics.fillRect(28, 42, 8, 4);
          
          // Arms
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRoundedRect(14, 30, 8, 14, 3);
          graphics.fillRoundedRect(42, 30, 8, 14, 3);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(18, 46, 4);
          graphics.fillCircle(46, 46, 4);
          
          // Cocktail shaker in hand!
          graphics.fillStyle(0xC0C0C0);
          graphics.fillRoundedRect(44, 38, 6, 14, 2);
          graphics.fillStyle(0x888888);
          graphics.fillRect(44, 38, 6, 3);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 18, 8, 12);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 12, 12);
          
          // Dark hair - stylish bob cut
          graphics.fillStyle(0x1a1a1a);
          // Hair volume on top
          graphics.fillEllipse(32, 4, 14, 10);
          graphics.fillEllipse(32, 2, 12, 8);
          // Side hair framing face
          graphics.fillEllipse(20, 10, 5, 12);
          graphics.fillEllipse(44, 10, 5, 12);
          // Bangs
          graphics.fillRect(24, 2, 16, 6);
          // Hair shine
          graphics.fillStyle(0x3a3a3a);
          graphics.fillEllipse(28, 2, 4, 3);
          graphics.fillEllipse(36, 3, 4, 3);
          
          // GLASSES - distinctive feature!
          graphics.lineStyle(2, 0x333333);
          // Left lens
          graphics.strokeCircle(26, 12, 5);
          // Right lens
          graphics.strokeCircle(38, 12, 5);
          // Bridge
          graphics.lineBetween(31, 12, 33, 12);
          // Temples
          graphics.lineBetween(21, 12, 18, 10);
          graphics.lineBetween(43, 12, 46, 10);
          
          // Eyes behind glasses
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(26, 12, 3, 2.5);
          graphics.fillEllipse(38, 12, 3, 2.5);
          graphics.fillStyle(0x4a3728); // Brown eyes
          graphics.fillCircle(26, 12, 1.5);
          graphics.fillCircle(38, 12, 1.5);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(26, 12, 0.8);
          graphics.fillCircle(38, 12, 0.8);
          
          // Eyebrows
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(23, 7, 6, 1.5, 1);
          graphics.fillRoundedRect(35, 7, 6, 1.5, 1);
          
          // Friendly smile
          graphics.lineStyle(1.5, 0xCC6666);
          graphics.beginPath();
          graphics.arc(32, 16, 4, 0.2, Math.PI - 0.2, false);
          graphics.strokePath();
          
          // Nose
          graphics.fillStyle(0xE8B4B8);
          graphics.fillEllipse(32, 15, 2, 1.5);
          
          // Ears
          graphics.fillStyle(0xFFDBB5);
          graphics.fillEllipse(18, 12, 2, 4);
          graphics.fillEllipse(46, 12, 2, 4);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Anya - bartender with dark hair and glasses');
          return;
        }
        
        // MARTINE - Blond woman with black clothing (Twilight fan)
        if ((style as any).isMartine) {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 60, 18, 4);
          
          // Legs with black skinny jeans
          graphics.fillStyle(0x0a0a0a);
          graphics.fillRoundedRect(26, 48, 6, 14, 2);
          graphics.fillRoundedRect(32, 48, 6, 14, 2);
          // Black boots
          graphics.fillStyle(0x000000);
          graphics.fillRoundedRect(24, 58, 8, 6, 2);
          graphics.fillRoundedRect(32, 58, 8, 6, 2);
          // Boot buckle detail
          graphics.fillStyle(0x888888);
          graphics.fillRect(26, 60, 4, 1);
          graphics.fillRect(34, 60, 4, 1);
          
          // Body - black band t-shirt or gothic top
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(22, 28, 20, 22, 4);
          // Twilight logo hint on shirt
          graphics.fillStyle(0x800000);
          graphics.fillEllipse(32, 36, 6, 6);
          // Apple silhouette (Twilight book cover reference)
          graphics.fillStyle(0x1a1a1a);
          graphics.fillEllipse(32, 35, 3, 3);
          // Red trim on neckline
          graphics.fillStyle(0x800000);
          graphics.fillRect(28, 28, 8, 2);
          
          // Arms in black sleeves
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(14, 30, 8, 14, 3);
          graphics.fillRoundedRect(42, 30, 8, 14, 3);
          // Pale hands
          graphics.fillStyle(0xFFF0F0);
          graphics.fillCircle(18, 46, 4);
          graphics.fillCircle(46, 46, 4);
          
          // Holding a book (Twilight!)
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(12, 42, 10, 14, 2);
          graphics.fillStyle(0x800000); // Red for Twilight cover
          graphics.fillRect(14, 44, 6, 10);
          
          // Neck
          graphics.fillStyle(0xFFF0F0); // Pale skin
          graphics.fillRect(28, 18, 8, 12);
          // Black choker necklace
          graphics.fillStyle(0x000000);
          graphics.fillRect(28, 24, 8, 2);
          
          // Head - pale skin
          graphics.fillStyle(0xFFF0F0);
          graphics.fillCircle(32, 12, 12);
          
          // LONG BLOND HAIR - flowing and beautiful
          graphics.fillStyle(0xFFD700);
          // Hair top
          graphics.fillEllipse(32, 4, 14, 10);
          graphics.fillEllipse(32, 2, 12, 8);
          // Long flowing hair on sides going down
          graphics.fillEllipse(18, 14, 6, 16);
          graphics.fillEllipse(46, 14, 6, 16);
          // Hair flowing over shoulders
          graphics.fillEllipse(16, 28, 5, 12);
          graphics.fillEllipse(48, 28, 5, 12);
          // Hair tips
          graphics.fillEllipse(15, 38, 4, 8);
          graphics.fillEllipse(49, 38, 4, 8);
          // Bangs
          graphics.fillRect(24, 0, 16, 6);
          // Hair shine/highlights
          graphics.fillStyle(0xFFE55C);
          graphics.fillEllipse(26, 2, 4, 3);
          graphics.fillEllipse(38, 2, 4, 3);
          graphics.fillEllipse(18, 20, 2, 6);
          graphics.fillEllipse(46, 20, 2, 6);
          
          // Eyes - dramatic with eyeliner
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 12, 4, 3);
          graphics.fillEllipse(37, 12, 4, 3);
          // Golden/amber eyes (like vampire!)
          graphics.fillStyle(0xDAA520);
          graphics.fillCircle(27, 12, 2);
          graphics.fillCircle(37, 12, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 12, 1);
          graphics.fillCircle(37, 12, 1);
          // Eye shine
          graphics.fillStyle(0xffffff);
          graphics.fillCircle(26, 11, 0.8);
          graphics.fillCircle(36, 11, 0.8);
          // Eyeliner/dramatic lashes
          graphics.fillStyle(0x000000);
          graphics.fillRoundedRect(23, 10, 8, 1.5, 1);
          graphics.fillRoundedRect(33, 10, 8, 1.5, 1);
          
          // Eyebrows
          graphics.fillStyle(0xDAA520);
          graphics.fillRoundedRect(24, 7, 6, 1.5, 1);
          graphics.fillRoundedRect(34, 7, 6, 1.5, 1);
          
          // Red/dark lipstick
          graphics.fillStyle(0x800000);
          graphics.fillEllipse(32, 17, 4, 1.5);
          
          // Nose
          graphics.fillStyle(0xFFE4E1);
          graphics.fillEllipse(32, 15, 2, 1.5);
          
          // Ears (hidden by hair mostly)
          graphics.fillStyle(0xFFF0F0);
          graphics.fillEllipse(19, 12, 2, 3);
          graphics.fillEllipse(45, 12, 2, 3);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Martine - blond woman in black, Twilight fan');
          return;
        }
        
        // ANNA - Danish woman with dark hair
        if ((style as any).isAnna) {
          // Shadow
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillEllipse(32, 60, 18, 4);
          
          // Legs with dark blue jeans
          graphics.fillStyle(0x1a3a5c);
          graphics.fillRoundedRect(26, 48, 6, 14, 2);
          graphics.fillRoundedRect(32, 48, 6, 14, 2);
          // Black ankle boots
          graphics.fillStyle(0x1a1a1a);
          graphics.fillRoundedRect(24, 58, 8, 6, 2);
          graphics.fillRoundedRect(32, 58, 8, 6, 2);
          
          // Body - red/maroon sweater (Danish color)
          graphics.fillStyle(0xC41E3A);
          graphics.fillRoundedRect(22, 28, 20, 22, 4);
          // Sweater neckline
          graphics.fillStyle(0xB01030);
          graphics.fillEllipse(32, 28, 6, 3);
          // White cross hint (Danish flag)
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(30, 32, 4, 14);
          graphics.fillRect(24, 38, 16, 3);
          
          // Arms in red sweater
          graphics.fillStyle(0xC41E3A);
          graphics.fillRoundedRect(14, 30, 8, 14, 3);
          graphics.fillRoundedRect(42, 30, 8, 14, 3);
          // Hands
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(18, 46, 4);
          graphics.fillCircle(46, 46, 4);
          
          // Small Danish flag in hand
          graphics.fillStyle(0xC41E3A);
          graphics.fillRect(8, 42, 12, 8);
          graphics.fillStyle(0xFFFFFF);
          graphics.fillRect(11, 42, 3, 8);
          graphics.fillRect(8, 45, 12, 2);
          // Flag pole
          graphics.fillStyle(0x8B4513);
          graphics.fillRect(7, 38, 2, 14);
          
          // Neck
          graphics.fillStyle(0xFFDBB5);
          graphics.fillRect(28, 20, 8, 10);
          
          // Head
          graphics.fillStyle(0xFFDBB5);
          graphics.fillCircle(32, 12, 12);
          
          // DARK HAIR - long and flowing
          graphics.fillStyle(0x1a1209);
          // Hair top
          graphics.fillEllipse(32, 4, 14, 10);
          graphics.fillEllipse(32, 2, 12, 8);
          // Long dark hair on sides
          graphics.fillEllipse(18, 14, 6, 16);
          graphics.fillEllipse(46, 14, 6, 16);
          // Hair flowing over shoulders
          graphics.fillEllipse(16, 28, 5, 12);
          graphics.fillEllipse(48, 28, 5, 12);
          // Hair tips
          graphics.fillEllipse(15, 38, 4, 8);
          graphics.fillEllipse(49, 38, 4, 8);
          // Bangs/fringe
          graphics.fillRect(24, 0, 16, 6);
          // Side swept bangs
          graphics.fillEllipse(24, 6, 6, 4);
          // Hair shine/highlights
          graphics.fillStyle(0x2a2219);
          graphics.fillEllipse(26, 2, 4, 3);
          graphics.fillEllipse(38, 4, 3, 2);
          
          // Eyes - warm and friendly
          graphics.fillStyle(0xffffff);
          graphics.fillEllipse(27, 12, 4, 3);
          graphics.fillEllipse(37, 12, 4, 3);
          // Blue eyes (Scandinavian!)
          graphics.fillStyle(0x4169E1);
          graphics.fillCircle(27, 12, 2);
          graphics.fillCircle(37, 12, 2);
          graphics.fillStyle(0x000000);
          graphics.fillCircle(27, 12, 1);
          graphics.fillCircle(37, 12, 1);
          // Eye shine
          graphics.fillStyle(0xffffff);
          graphics.fillCircle(26, 11, 0.8);
          graphics.fillCircle(36, 11, 0.8);
          
          // Dark eyebrows
          graphics.fillStyle(0x1a1209);
          graphics.fillRoundedRect(24, 8, 6, 1.5, 1);
          graphics.fillRoundedRect(34, 8, 6, 1.5, 1);
          
          // Friendly smile
          graphics.fillStyle(0xCC6666);
          graphics.fillEllipse(32, 17, 4, 2);
          
          // Nose
          graphics.fillStyle(0xFFCCB5);
          graphics.fillEllipse(32, 14, 2, 2);
          
          // Ears (mostly hidden by hair)
          graphics.fillStyle(0xFFDBB5);
          graphics.fillEllipse(19, 12, 2, 3);
          graphics.fillEllipse(45, 12, 2, 3);
          
          // Small earrings
          graphics.fillStyle(0xFFD700);
          graphics.fillCircle(19, 14, 1.5);
          graphics.fillCircle(45, 14, 1.5);
          
          graphics.generateTexture(key, 64, 64);
          graphics.destroy();
          console.log('Created Anna - Danish woman with dark hair');
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
    
    // Create Jens Stoltenberg portrait for victory screen
    // Based on photo: gray-haired man, glasses, navy suit, white shirt, dark tie, friendly smile
    if (!this.textures.exists('stoltenberg-portrait')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      const size = 128; // Larger portrait for popup
      const cx = size / 2; // Center x
      const cy = size / 2; // Center y
      
      // Background gradient - soft blue/gray
      graphics.fillStyle(0x2C3E50);
      graphics.fillRect(0, 0, size, size);
      graphics.fillStyle(0x34495E, 0.7);
      graphics.fillRect(0, size/3, size, size*2/3);
      
      // Shoulders/suit - dark navy blue
      graphics.fillStyle(0x1a2634);
      graphics.fillRect(cx - 50, cy + 30, 100, 50);
      // Suit lapels
      graphics.fillStyle(0x151d26);
      graphics.fillTriangle(cx - 50, cy + 30, cx - 20, cy + 30, cx - 35, cy + 60);
      graphics.fillTriangle(cx + 50, cy + 30, cx + 20, cy + 30, cx + 35, cy + 60);
      
      // White shirt collar
      graphics.fillStyle(0xFFFFFF);
      graphics.fillTriangle(cx - 18, cy + 30, cx - 8, cy + 30, cx - 13, cy + 50);
      graphics.fillTriangle(cx + 18, cy + 30, cx + 8, cy + 30, cx + 13, cy + 50);
      
      // Dark tie
      graphics.fillStyle(0x0a1020);
      graphics.fillTriangle(cx - 6, cy + 30, cx + 6, cy + 30, cx, cy + 60);
      
      // Neck
      graphics.fillStyle(0xE8BEAC);
      graphics.fillRect(cx - 10, cy + 18, 20, 18);
      
      // Face - lighter skin tone
      graphics.fillStyle(0xF5D6C6);
      graphics.fillCircle(cx, cy, 32);
      
      // Face shading for depth
      graphics.fillStyle(0xE8BEAC, 0.5);
      graphics.fillCircle(cx - 18, cy + 5, 12);
      graphics.fillCircle(cx + 18, cy + 5, 12);
      
      // Ears
      graphics.fillStyle(0xE8BEAC);
      graphics.fillCircle(cx - 30, cy, 6);
      graphics.fillCircle(cx + 30, cy, 6);
      
      // Gray hair - distinguished silver
      graphics.fillStyle(0x9CA3AF);
      graphics.fillCircle(cx, cy - 16, 26);
      graphics.fillStyle(0xB0B8C4);
      graphics.fillCircle(cx, cy - 18, 22);
      // Hair sides/temples
      graphics.fillStyle(0x9CA3AF);
      graphics.fillEllipse(cx - 26, cy - 6, 10, 16);
      graphics.fillEllipse(cx + 26, cy - 6, 10, 16);
      
      // Forehead (face color to cover bottom of hair)
      graphics.fillStyle(0xF5D6C6);
      graphics.fillEllipse(cx, cy - 6, 26, 18);
      
      // Eyebrows - gray
      graphics.fillStyle(0x808890);
      graphics.fillRect(cx - 20, cy - 10, 14, 3);
      graphics.fillRect(cx + 6, cy - 10, 14, 3);
      
      // Eyes (no glasses)
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(cx - 14, cy - 2, 5);
      graphics.fillCircle(cx + 14, cy - 2, 5);
      graphics.fillStyle(0x4A6FA5); // Blue-gray eyes
      graphics.fillCircle(cx - 14, cy - 2, 3);
      graphics.fillCircle(cx + 14, cy - 2, 3);
      graphics.fillStyle(0x000000);
      graphics.fillCircle(cx - 14, cy - 2, 1.5);
      graphics.fillCircle(cx + 14, cy - 2, 1.5);
      
      // Nose
      graphics.lineStyle(1.5, 0xD4A690);
      graphics.lineBetween(cx, cy - 2, cx - 2, cy + 8);
      graphics.lineBetween(cx - 2, cy + 8, cx, cy + 10);
      graphics.lineBetween(cx, cy + 10, cx + 2, cy + 8);
      
      // Friendly smile
      graphics.lineStyle(2, 0xB57B6D);
      graphics.beginPath();
      graphics.arc(cx, cy + 14, 12, 0.3, Math.PI - 0.3, false);
      graphics.strokePath();
      
      // Slight teeth showing (friendly smile)
      graphics.fillStyle(0xFFF8F0);
      graphics.fillRect(cx - 8, cy + 14, 16, 4);
      
      // Smile lines (crow's feet) - adds warmth
      graphics.lineStyle(1, 0xD4A690, 0.5);
      graphics.lineBetween(cx - 24, cy + 2, cx - 28, cy - 1);
      graphics.lineBetween(cx + 24, cy + 2, cx + 28, cy - 1);
      
      graphics.generateTexture('stoltenberg-portrait', size, size);
      graphics.destroy();
      console.log('Created Jens Stoltenberg portrait for victory screen');
    }
    
    // Create simple particle texture for confetti effects
    if (!this.textures.exists('particle')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('particle', 8, 8);
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
          
          // Check if save has level info, otherwise go to level select
          const savedLevel = savedState.level || 'office';
          const targetScene = savedLevel === 'kielland' ? 'KiellandScene' : 'OfficeScene';
          
          // Ask player if they want to continue or start fresh
          this.showContinuePrompt(savedState, targetScene);
        } else {
          // New game - go to level select
          this.initNewGameAndSelectLevel();
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        this.initNewGameAndSelectLevel();
      }
    } else {
      // No API available
      this.initNewGameAndSelectLevel();
    }
    
    // Launch UI overlay
    this.scene.launch('UIScene');
  }
  
  private showContinuePrompt(savedState: any, targetScene: string) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    const bg = this.add.rectangle(width / 2, height / 2, 500, 250, 0x000000, 0.9);
    bg.setStrokeStyle(2, 0x0066CC);
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 80, '🎮 Save Data Found!', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Save info
    const stats = savedState.playerStats;
    const info = this.add.text(width / 2, height / 2 - 30, 
      `Level: ${stats.level} | Gold: ${stats.gold} | Zone: ${savedState.currentZone}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // Continue button
    const continueBtn = this.add.text(width / 2, height / 2 + 20, '[ CONTINUE ]', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#00FF00',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    // New game button
    const newGameBtn = this.add.text(width / 2, height / 2 + 70, '[ NEW GAME - Level Select ]', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FF6600',
      backgroundColor: '#331100',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    // Button hover effects
    continueBtn.on('pointerover', () => continueBtn.setColor('#00FF00').setScale(1.05));
    continueBtn.on('pointerout', () => continueBtn.setColor('#00FF00').setScale(1));
    newGameBtn.on('pointerover', () => newGameBtn.setColor('#FF8800').setScale(1.05));
    newGameBtn.on('pointerout', () => newGameBtn.setColor('#FF6600').setScale(1));
    
    // Continue game
    continueBtn.on('pointerdown', () => {
      bg.destroy();
      title.destroy();
      info.destroy();
      continueBtn.destroy();
      newGameBtn.destroy();
      
      this.scene.start(targetScene, {
        spawnPosition: savedState.position,
        currentZone: savedState.currentZone
      });
    });
    
    // New game
    newGameBtn.on('pointerdown', () => {
      bg.destroy();
      title.destroy();
      info.destroy();
      continueBtn.destroy();
      newGameBtn.destroy();
      
      this.initNewGameAndSelectLevel();
    });
    
    // Keyboard shortcuts
    const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const nKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    
    enterKey.once('down', () => {
      continueBtn.emit('pointerdown');
    });
    
    nKey.once('down', () => {
      newGameBtn.emit('pointerdown');
    });
  }
  
  private initNewGameAndSelectLevel() {
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
    
    // Go to level select
    this.scene.start('LevelSelectScene');
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
