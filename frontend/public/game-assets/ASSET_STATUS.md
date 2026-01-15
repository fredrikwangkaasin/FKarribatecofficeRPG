# Asset Loading Gracefully Degrades

The game is designed to gracefully handle missing assets:

1. **Player Sprite Missing**: Game will display a colored rectangle (blue) for the player
2. **Enemy Sprites Missing**: Game will show colored rectangles (red) for enemies  
3. **Tilemap Missing**: Game enters "Test Mode" with a green background and basic movement
4. **UI Elements Missing**: Game uses Phaser graphics primitives to draw HP bars and menus

## To Add Real Assets:

### Quick Start - Use OpenGameArt.org:

1. **Player Sprite**:
   - Download: https://opengameart.org/content/lpc-character-generator
   - Extract and pick a character
   - Rename to `player.png`
   - Place in `sprites/player.png`

2. **Enemy Sprites**:
   - Download: https://opengameart.org/content/lpc-character-generator
   - Pick 12 different business/office characters
   - Resize to 64×64 each
   - Rename and place in `sprites/enemies/`

3. **Office Tileset**:
   - Download: https://opengameart.org/content/rpg-indoor-tileset-expansion-1
   - Or use: https://kenney.nl/assets/roguelike-indoor-pack
   - Resize/arrange into 256×256 grid of 32×32 tiles
   - Save as `tilesets/office-tileset.png`

4. **Create Tilemap**:
   - Download Tiled: https://www.mapeditor.org/
   - Create new map: 50×40 tiles, 32×32 tile size
   - Import tileset
   - Draw 10 rooms (see GAME_README.md for layout)
   - Export as JSON to `tilemaps/office.json`

## Current Status:

✅ Game engine fully implemented
✅ Backend API ready
✅ Database schema created
✅ Turn-based combat working
✅ Save/load system functional

⏳ Assets needed (game runs in placeholder mode until added)
