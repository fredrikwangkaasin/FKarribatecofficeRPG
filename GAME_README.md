# Arribatec Office RPG - Implementation Complete

A top-down SNES-style RPG built with Phaser3 where players navigate an Arribatec office and battle clients with logical arguments.

## 🎮 Game Features

### Core Gameplay
- **Top-down navigation** with grid-based movement (32×32 tiles)
- **Turn-based combat** using logical arguments (ARGUE, DEFLECT, EVIDENCE, PERSUADE)
- **Random encounters** in department zones (Finance, Hospitality, Research)
- **Boss battles** against department heads (permanently defeated)
- **Level progression** with XP system (exponential curve, max level 20)
- **Break room healing** for HP restoration
- **Auto-save system** with backend persistence (60-second intervals + event triggers)

### Multi-Tenant Architecture
- **Tenant-isolated saves** - each tenant's game data is completely separate
- **User authentication** - JWT-based auth with Keycloak integration
- **Backend API** - RESTful endpoints for load/save/reset operations
- **Fallback to localStorage** if backend is unavailable

## 📁 Project Structure

```
FKarribatecofficerpg/
├── frontend/
│   ├── src/
│   │   ├── game/
│   │   │   ├── config.ts                 # Phaser game configuration
│   │   │   ├── data/
│   │   │   │   ├── enemies.ts            # 12 enemy definitions with stats
│   │   │   │   └── gameState.ts          # Game state types and helpers
│   │   │   ├── scenes/
│   │   │   │   ├── PreloadScene.ts       # Asset loading with progress bar
│   │   │   │   ├── OfficeScene.ts        # Main exploration scene
│   │   │   │   ├── BattleScene.ts        # Turn-based combat
│   │   │   │   ├── UIScene.ts            # HUD overlay (HP, level, gold, XP)
│   │   │   │   └── GameOverScene.ts      # Victory screen
│   │   │   └── entities/
│   │   │       └── Player.ts             # (future enhancement)
│   │   ├── components/
│   │   │   └── GamePage.tsx              # React wrapper for Phaser
│   │   └── utils/
│   │       └── gameApi.ts                # Backend API client
│   └── public/
│       └── game-assets/
│           ├── sprites/                  # Player & enemy sprites
│           ├── tilesets/                 # Office tileset (32×32)
│           ├── tilemaps/                 # Office map JSON (Tiled)
│           ├── ui/                       # Battle UI elements
│           └── README.md                 # Asset sourcing guide
├── backend/
│   ├── Controllers/
│   │   └── GameStateController.cs        # API endpoints (load/save/reset)
│   ├── Repositories/
│   │   └── GameStateRepository.cs        # Database operations with tenant isolation
│   ├── Models/
│   │   └── GameStateModels.cs            # DTOs for game state
│   └── sql/
│       └── init-game-tables.sql          # Database schema creation
```

## 🚀 Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

Dependencies added:
- `phaser@^3.80.0` - Game engine
- `@types/phaser@^3.80.0` - TypeScript definitions

**Backend:**
- No additional dependencies needed (uses existing Nexus Client packages)

### 2. Initialize Database

Run the SQL script to create the GameStates table:

```bash
# From backend directory
sqlcmd -S localhost -d YourDatabaseName -i sql/init-game-tables.sql
```

Or run manually via SQL Server Management Studio.

### 3. Add Game Assets

**Option A: Source Free Assets (Recommended)**

Follow the guide in `frontend/public/game-assets/README.md`:
1. Download from OpenGameArt.org, Kenney.nl, or itch.io
2. Place assets in respective folders
3. Create office tilemap using Tiled (https://www.mapeditor.org/)

Required assets:
- Player sprite: 128×192 spritesheet (32×48 per frame, 4×4 grid)
- 12 enemy sprites: 64×64 each
- Office tileset: 256×256 (8×8 grid of 32×32 tiles)
- Office tilemap: 50×40 tiles in Tiled JSON format
- UI elements: Battle menu, HP bars

**Option B: Use AI Generation**

Generate with DALL-E 3 or Midjourney:
```
"32x32 pixel art sprite of [description], SNES style, RPG character, transparent background"
```

**Option C: Placeholder Mode**

The game will run in "test mode" with colored rectangles if assets are missing.

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Game

Navigate to: `https://demo.localtest.me:7312/FKarribatecofficerpg/game`

Or click "Play Game" button from the homepage.

## 🎯 Game Controls

| Control | Action |
|---------|--------|
| **Arrow Keys** | Move player (grid-based) |
| **E** | Interact (Break room heal, Boss doors) |
| **Mouse Click** | Select battle actions |
| **ESC** | Cancel boss battle prompt |

## 🏢 Office Map Layout

```
┌─────────────────────────────────────┐
│  LOBBY (Spawn, Safe Zone)           │
│  - Player starts here               │
│  - No random encounters             │
├──────────┬──────────┬───────────────┤
│ BREAK    │  CONF 1  │  CONF 2       │
│ ROOM     │          │               │
│ (Heal)   │          │               │
├──────────┼──────────┼───────────────┤
│ FINANCE  │  HOSPIT. │  RESEARCH     │
│ DEPT     │  DEPT    │  DEPT         │
│ (30% enc)│ (30% enc)│  (30% enc)    │
├──────────┼──────────┼───────────────┤
│ CFO      │  HOTEL   │  LEAD SCI     │
│ OFFICE   │  MGR OFF │  OFFICE       │
│ (Boss)   │  (Boss)  │  (Boss)       │
└──────────┴──────────┴───────────────┘
```

## ⚔️ Battle System

### Action Types

| Action | Damage | Special Effect |
|--------|--------|----------------|
| **ARGUE** | 25 base | Standard logical argument |
| **DEFLECT** | 18 base | Redirect conversation |
| **EVIDENCE** | 33 base | High accuracy, fact-based |
| **PERSUADE** | 18 base | Emotional appeal, may confuse |

### Damage Formula

```
damage = baseDamage + (attackerLogic / 10) - (defenderResilience / 15) + random(-5, 5)
```

### Enemy Types (12 Total)

**Finance Zone:**
- Auditor (60 HP, 15 XP, 20 gold)
- Budget Manager (70 HP, 20 XP, 25 gold)
- Tax Consultant (75 HP, 25 XP, 30 gold)
- **CFO** - BOSS (180 HP, 100 XP, 200 gold)

**Hospitality Zone:**
- Angry Customer (55 HP, 15 XP, 20 gold)
- Tour Operator (70 HP, 20 XP, 25 gold)
- Event Planner (65 HP, 25 XP, 30 gold)
- **Hotel Manager** - BOSS (170 HP, 100 XP, 200 gold)

**Research Zone:**
- Data Analyst (65 HP, 15 XP, 20 gold)
- Research Director (75 HP, 20 XP, 25 gold)
- Grant Writer (70 HP, 25 XP, 30 gold)
- **Lead Scientist** - BOSS (200 HP, 100 XP, 200 gold)

## 📊 Player Progression

### Stats
- **HP**: Health points (starts at 100)
- **Logic**: Attack stat (affects damage dealt)
- **Resilience**: Defense stat (reduces damage taken)
- **Charisma**: Special stat (affects persuade success)

### Leveling System
- **Level 1→2**: 100 XP
- **Level 2→3**: 150 XP (1.5× multiplier)
- **Level 3→4**: 225 XP (exponential growth)
- **Max Level**: 20

**Per Level Gains:**
- +10 HP
- +2 Logic
- +1 Resilience
- +1 Charisma
- Full HP restore on level up

### Defeat Penalty
- Lose 50% of gold
- Respawn at Lobby with full HP

## 💾 Save System

### Auto-Save Triggers
1. Every 60 seconds (automatic)
2. After every battle (win or lose)
3. After level up
4. After Break room healing
5. After boss defeat

### Data Stored (Tenant-Isolated)
- Player position (X, Y coordinates)
- Current zone
- Level, XP, gold
- HP (current and max)
- Stats (Logic, Resilience, Charisma)
- Defeated bosses (array of IDs)
- Total play time (seconds)

### API Endpoints

```
GET  /api/gamestate        - Load saved game
POST /api/gamestate/save   - Save current game state
POST /api/gamestate/reset  - Delete save (reset game)
```

All endpoints require `Authorization: Bearer <token>` header.

## 🎨 Visual Style

- **Resolution**: 800×600 pixels
- **Tile Size**: 32×32 pixels
- **Sprite Size**: Player 32×48, Enemies 64×64
- **Color Scheme**: Arribatec blue (#0066CC) for UI elements
- **Aesthetic**: SNES/16-bit pixel art style

## 🏆 Game Completion

The game is won when all 3 boss enemies are defeated:
1. CFO (Finance)
2. Hotel Manager (Hospitality)
3. Lead Scientist (Research)

Victory screen shows:
- Final level
- Total gold collected
- Final stats
- Play time
- List of defeated bosses

Players can continue exploring after victory (bosses don't respawn).

## 🔧 Technical Features

### Frontend
- **Phaser 3.80.0** with TypeScript
- **React 18** wrapper for game lifecycle
- **Material-UI** for game controls/UI
- **Vite** build tool with HMR
- **JWT authentication** via Keycloak

### Backend
- **.NET 8** Web API
- **Dapper** for database operations
- **IContextAwareDatabaseService** for tenant isolation
- **SQL Server** with MERGE upsert operations
- **Bearer token authentication** on all endpoints

### Multi-Tenant Support
- Automatic tenant extraction from JWT claims
- Database queries filtered by `TenantId`
- No data leakage between tenants
- Separate save files per tenant per user

## 🐛 Troubleshooting

### Assets Not Loading
- Check browser console for 404 errors
- Verify assets are in `frontend/public/game-assets/` folders
- Ensure file names match exactly (case-sensitive)
- Check `PreloadScene.ts` sprite keys match file names

### Game Won't Start
- Verify JWT token is valid (check Network tab)
- Ensure backend is running (`http://localhost:7412`)
- Check CORS settings if calling from different domain
- Verify database table exists (`GameStates`)

### Save/Load Fails
- Check backend logs for database errors
- Verify tenant ID is in JWT token claims
- Ensure `IContextAwareDatabaseService` is registered in Program.cs
- Check localStorage for backup save (fallback)

### Black Screen
- Open browser console for Phaser errors
- Check if assets loaded successfully
- Verify Phaser config is correct
- Test with fallback mode (no tilemap)

## 📝 Next Steps & Enhancements

Potential future additions:
1. **Inventory system** - Items to boost stats or restore HP
2. **Equipment** - Weapons/armor for stat bonuses
3. **More zones** - Additional office areas and enemies
4. **Difficulty modes** - Easy/Normal/Hard with scaled enemy stats
5. **Achievements** - Track milestones and unlock rewards
6. **Multiplayer leaderboards** - Compare stats across tenant users
7. **Sound effects & music** - Audio for battles and exploration
8. **Mobile support** - Touch controls and responsive canvas
9. **Quest system** - Side quests with rewards
10. **Character customization** - Choose player appearance

## 📜 Credits

- **Game Engine**: Phaser 3 (https://phaser.io/)
- **Assets**: See `frontend/public/game-assets/CREDITS.txt` for attribution
- **Framework**: Arribatec Nexus Platform
- **Authentication**: Keycloak OIDC

## 📄 License

[Your License Here]

---

**Ready to Play!** Navigate to `/game` route and start battling office clients! 🎮
