# 🏰 Dungeon 3D

A browser-based first-person 3D dungeon survival shooter built with pure HTML, CSS and JavaScript. No game engine, no frameworks, no installs. Uses a **raycasting engine** inspired by Wolfenstein 3D and Doom to render a 3D world entirely in the browser.

---

## 🎮 How to Play

### Controls

| Key | Action |
|-----|--------|
| `W` or `Arrow Up` | Move forward |
| `S` or `Arrow Down` | Move backward |
| `A` or `Arrow Left` | Turn left |
| `D` or `Arrow Right` | Turn right |
| `SPACE` | Shoot |
| `R` | Restart game |

### Objective

- Find all hidden **keys** in each level
- **Shoot enemies** to earn points and survive
- Reach the **exit gate** to advance to the next level
- Complete all 5 levels then **defeat the Final Boss** to win

---

## 🗺️ Levels

+------------+---------------+------+----------+--------------------------------------------+
| Level      | Name          | Keys | Enemy HP | Theme                                      |
+------------+---------------+------+----------+--------------------------------------------+
| Level 1    | The Dungeon   | 3    | 2 HP     | Purple walls — open corridors, easy start  |
| Level 2    | The Maze      | 3    | 3 HP     | Green walls — tight maze layout            |
| Level 3    | The Fortress  | 4    | 4 HP     | Red walls — symmetrical fortress map       |
| Level 4    | The Catacombs | 4    | 5 HP     | Dark purple — repeating grid corridors     |
| Level 5    | The Abyss     | 5    | 6 HP     | Near black walls — hardest dungeon         |
| Boss Arena | The Arena     | 0    | 30 HP    | Dark teal — Final Boss fight               |
+------------+---------------+------+----------+--------------------------------------------+
---

## 👹 Final Boss

After escaping Level 5 the player enters the **Boss Arena** — a closed room with no keys, no coins and no escape until the boss is defeated.

- **30 hits** to kill
- **Phase 1** (100%–50% HP) — Dark red, normal speed
- **Phase 2** (below 50% HP) — Turns orange, moves faster, **ENRAGED** warning appears
- **Exit gate** stays completely hidden until the boss dies
- Player enters with **full HP** and **35 ammo**
- Boss HP bar displayed at the top center of the screen throughout the fight
- Boss shown as a **red dot** on the minimap

---

## 🔫 Combat System

- **Raycast shooting** — bullets travel instantly along the player's line of sight
- **15 frame cooldown** between shots
- **30–35 ammo** per level — manage carefully
- **40% chance** enemies drop +5 ammo on death
- **Kill feed** in top-right corner tracks every kill and ammo drop
- **+100 points** per enemy kill
- **+200 points** per key collected
- **+500 points** for defeating the Final Boss

---

## 🌊 Wave System

- Enemies spawn continuously every **7 seconds** throughout each level
- Each level starts with a fixed number of enemies
- Enemy HP and speed **scale up** with each level
- All enemy positions shown as **red dots** on the minimap

---

## 🩸 Damage Effects

Three layered visual effects when the player takes damage:

| Effect | Triggers When |
|--------|--------------|
| Sharp red screen flash | Every hit from an enemy |
| Pulsing red overlay | HP drops below 50 |
| Red vignette border | HP drops below 75 |

---

## 🗺️ Minimap

The minimap in the top-right corner shows:

- **Purple dot** — player position and look direction
- **Red dots** — all living enemy positions
- **Coloured dots** — uncollected key locations in their own colours
- **Yellow dot** — exit gate location (normal levels)
- **Green dot** — boss arena exit (only appears after boss is defeated)

---

## 📁 Project Structure

```
dungeon3d/
├── index.html          ← Game canvas, HUD, script loader
├── README.md           ← This file
├── css/
│   └── style.css       ← Full screen layout, HUD, dark theme
└── js/
    ├── map.js          ← All 6 level definitions (maps, keys, exits)
    ├── player.js       ← Player state, movement, keyboard input
    ├── raycaster.js    ← 3D raycasting engine (core of the game)
    ├── sprites.js      ← Coins, keys, collection logic
    ├── enemies.js      ← Enemy AI, boss logic, HP bars, exit gate
    └── game.js         ← Main loop, HUD, gun, particles, level system
```

---

## 🚀 Getting Started

### Option 1: VS Code Live Server (Recommended)

```bash
# Open the dungeon3d folder in VS Code
code dungeon3d

# Right-click index.html in the sidebar
# Click "Open with Live Server"
# Browser opens at http://127.0.0.1:5500
```

> ⚠️ Never open index.html by double-clicking. Always use a local server.

---

## ⚙️ How the Raycasting Engine Works

The 3D effect works by casting rays from the player's position across a 60° field of view. Each ray travels through the map grid until it hits a wall. The distance to the wall determines how tall to draw that wall column on screen — closer walls appear taller, farther walls appear shorter.

```
Player → cast 160 rays → measure wall distance → draw vertical wall slices
```

This is the same technique used in **Wolfenstein 3D (1992)** and **Doom (1993)**.

---

## 🛠️ Built With

| Technology | Purpose |
|------------|---------|
| HTML5 Canvas | Rendering the entire 3D scene |
| Vanilla JavaScript | Raycasting engine, game logic, AI |
| CSS3 | Full screen layout, HUD styling |

No libraries. No frameworks. No build tools. Just open and play.

---

## 📋 Development Updates

### v1.0 — Initial Release
- 3D raycasting engine
- Basic dungeon map with walls
- Player movement and collision

### v1.1 — Health Damage Effects
- Red screen flash on enemy hit
- Pulsing red overlay below 50 HP
- Red vignette border below 75 HP

### v2.0 — Combat Update
- Shooting mechanic with SPACE key
- Wave-based enemy spawning
- Ammo system with enemy drops
- Kill feed display
- Gun model with muzzle flash
- Blood particle effects
- Enemy HP bars above their heads
- Enemy hit flash effect
- Enemy red dots on minimap

### v2.1 — Multiple Levels Update
- 3 levels with different maps and wall colours
- Level complete transition screen
- Level name banner on load
- Keys loaded from level definitions
- Exit dot on minimap per level

### v2.2 — Level Expansion
- Level 4: The Catacombs added
- Level 5: The Abyss added
- Start screen updated with all level names
- Enemy scaling per level

### v3.0 — Final Boss Update
- Boss Arena added as Level 6
- Final Boss with 30 HP and two phases
- Phase 2 enraged mode at 50% HP
- Large boss HP bar at top of screen
- Exit gate hidden until boss is defeated
- Full HP and 35 ammo on boss entry
- Boss shown as red dot on minimap
- Gate dot only appears after boss dies
- Dedicated boss win screen

---

## 💡 Future Ideas

- Sound effects using Web Audio API
- Multiple weapons — shotgun, rifle
- Health and armour pickups
- Pause menu
- Difficulty modes
- Leaderboard using localStorage
- Wall textures
- Secret rooms

---

## 📄 License

Open source and free to use for learning and personal projects.

---

*Built with HTML · CSS · JavaScript*
*No libraries. No frameworks. Just a browser and a text editor.*