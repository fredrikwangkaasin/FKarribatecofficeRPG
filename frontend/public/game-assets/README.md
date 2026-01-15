# Game Assets for Arribatec Office RPG

This directory contains all visual and audio assets for the game.

## Required Assets

### 1. Player Character Sprite
- **Location**: `sprites/player.png`
- **Format**: PNG with transparency
- **Size**: Spritesheet 128x192 pixels (4 columns × 4 rows)
- **Frame Size**: 32x48 pixels per frame
- **Frames**: 16 total (4 directions × 4 animation frames)
  ```
  Row 1: Down (facing camera) - idle, walk1, walk2, walk3
  Row 2: Up (facing away) - idle, walk1, walk2, walk3
  Row 3: Left - idle, walk1, walk2, walk3
  Row 4: Right - idle, walk1, walk2, walk3
  ```

### 2. Enemy Sprites (64x64 each)
**Location**: `sprites/enemies/`

**Finance Zone:**
- `auditor.png` - Serious businessperson with clipboard
- `budget-manager.png` - Professional with calculator
- `tax-consultant.png` - Person with documents
- `cfo.png` - Executive in suit (BOSS)

**Hospitality Zone:**
- `angry-customer.png` - Upset client
- `tour-operator.png` - Travel professional
- `event-planner.png` - Person with scheduling tools
- `hotel-manager.png` - Formal manager (BOSS)

**Research Zone:**
- `data-analyst.png` - Person with laptop/charts
- `research-director.png` - Lab coat professional
- `grant-writer.png` - Academic with papers
- `lead-scientist.png` - Senior researcher (BOSS)

### 3. Office Tileset
- **Location**: `tilesets/office-tileset.png`
- **Format**: PNG tileset
- **Size**: 256x256 pixels (8×8 grid of 32×32 tiles)
- **Tiles Needed** (64 tiles total):
  - Floor tiles: carpet (4 colors), tile floor (4 styles)
  - Walls: office walls (8 directions + corners)
  - Furniture: desk, chair, filing cabinet, plant, computer, printer
  - Doors: closed, open (2 variants)
  - Decorations: water cooler, whiteboard, pictures

### 4. UI Elements
**Location**: `ui/`

- `battle-menu.png` - 512x128 action menu background
- `hp-bar-bg.png` - 200x20 HP bar background
- `hp-bar-fill.png` - 200x20 HP bar fill (green)

### 5. Office Tilemap
- **Location**: `tilemaps/office.json`
- **Format**: Tiled JSON (orthogonal)
- **Map Size**: 50×40 tiles (1600×1280 pixels)
- **Layers**:
  1. Ground - Floor tiles
  2. Walls - Collision layer
  3. Decorations - Furniture, plants, etc.
  4. Zones - Invisible object layer with properties

**Zone Properties** (set in Tiled):
- `zone` (string): 'lobby', 'finance', 'hospitality', 'research', 'breakroom', 'boss-finance', 'boss-hospitality', 'boss-research'
- `collides` (bool): true for walls
- `encounterRate` (number): 30 (for encounter zones)

## Free Asset Sources

### Recommended Resources

1. **OpenGameArt.org**
   - [LPC Character Generator](https://opengameart.org/content/lpc-character-generator)
   - [RPG Indoor Tileset](https://opengameart.org/content/rpg-indoor-tileset-expansion-1)
   - [Office Tileset](https://opengameart.org/content/office-tileset)

2. **Itch.io**
   - [Top-Down RPG Assets](https://itch.io/game-assets/free/tag-top-down)
   - Filter by: License: Creative Commons, Tag: Pixel Art

3. **Kenney.nl**
   - [Roguelike Characters](https://kenney.nl/assets/roguelike-characters-pack)
   - [Roguelike Indoor Pack](https://kenney.nl/assets/roguelike-indoor-pack)

### AI-Generated Option

Use DALL-E 3 or Midjourney with prompts like:
```
"32x32 pixel art sprite of [description], SNES style, RPG character, transparent background, 4 direction walk cycle"
```

### Placeholder Assets (Current)

Until assets are sourced, the game will:
1. Display colored rectangles for sprites
2. Show error messages for missing tilemaps
3. Run in "Test Mode" with a simple colored background

## Creating the Tilemap

### Using Tiled (Free Software)

1. **Download Tiled**: https://www.mapeditor.org/
2. **Create New Map**:
   - Orientation: Orthogonal
   - Tile size: 32×32 pixels
   - Map size: 50×40 tiles
3. **Add Tileset**:
   - New Tileset → Based on Tileset Image
   - Select `office-tileset.png`
   - Tile width/height: 32×32
4. **Create Layers**:
   - Tile Layer: Ground
   - Tile Layer: Walls (set Collision property)
   - Tile Layer: Decorations
   - Object Layer: Zones
5. **Add Zone Objects**:
   - Draw rectangles for each zone
   - Set custom properties (zone, encounterRate)
6. **Export**: File → Export As → JSON

### Office Layout (10 Rooms)

```
┌─────────────────────────────────────┐
│  LOBBY (Spawn, Safe)                │
│  - Player starts here               │
│  - No encounters                    │
├──────────┬──────────┬───────────────┤
│ BREAK    │  CONF 1  │  CONF 2      │
│ ROOM     │          │               │
│ (Heal)   │          │               │
├──────────┼──────────┼───────────────┤
│ FINANCE  │  HOSPIT. │  RESEARCH     │
│ DEPT     │  DEPT    │  DEPT         │
│ (Enctr)  │ (Enctr)  │  (Enctr)      │
├──────────┼──────────┼───────────────┤
│ CFO      │  HOTEL   │  LEAD SCI     │
│ OFFICE   │  MGR OFF │  OFFICE       │
│ (Boss)   │  (Boss)  │  (Boss)       │
└──────────┴──────────┴───────────────┘
```

## Attribution

When using free assets, ensure proper attribution. Add credits to:
- In-game credits screen (GameOverScene)
- README.md project root
- Asset source files (LICENSE.txt)

Example attribution format:
```
Player sprite: [Artist Name] - [License] - [URL]
Office tileset: [Artist Name] - [License] - [URL]
```

## Asset Checklist

- [ ] Player character sprite (32x48, 16 frames)
- [ ] 12 enemy sprites (64x64 each)
- [ ] Office tileset (256x256, 64 tiles)
- [ ] UI elements (battle menu, HP bars)
- [ ] Office tilemap JSON file (50x40 tiles)
- [ ] Attribution file (CREDITS.txt)

## Notes

- All assets must have commercial-use licenses or be CC0/Public Domain
- Pixel art style should be consistent across all assets
- SNES/16-bit aesthetic recommended
- Test assets in-game before finalizing
- Compress PNGs with TinyPNG or similar tools
