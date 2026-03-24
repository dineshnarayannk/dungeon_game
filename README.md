# 🏰 Dungeon 3D

A browser-based first-person 3D dungeon survival shooter built with pure HTML, CSS and JavaScript. No game engine, no frameworks, no installs. Uses a **raycasting engine** inspired by Wolfenstein 3D and Doom to render a 3D world entirely in the browser.

---

## 🎮 How to Play

### Controls

+-----------------------+-------------------+
| Key                   | Action            |
+-----------------------|-------------------+
| `W` or `Arrow Up`     | Move forward      |
| `S` or `Arrow Down`   | Move backward     |
| `A` or `Arrow Left`   | Turn left         |
| `D` or `Arrow Right`  | Turn right        |
| `SPACE`               | Shoot             |
| `ESC`                 | Pause / Resume    |
| `R`                   | Restart game      |
+-----------------------+-------------------+

### Objective

- Find all hidden **keys** in each level
- **Shoot enemies** to earn points and survive
- Reach the **exit gate** to advance to the next level
- Complete all 5 levels then **defeat the Final Boss** to win

---

## 🗺️ Levels

+---------+---------------+------+----------+-------------------------------------------+
| Level   | Name          | Keys | Enemy HP | Theme                                     |
+---------+---------------+------+----------+-------------------------------------------+
| Level 1 | The Dungeon   | 3    | 2 HP     | Purple walls — open corridors, easy start |
| Level 2 | The Maze      | 3    | 3 HP     | Green walls — tight maze layout           |
| Level 3 | The Fortress  | 4    | 4 HP     | Red walls — symmetrical fortress map      |
| Level 4 | The Catacombs | 4    | 5 HP     | Dark purple — repeating grid corridors    |
| Level 5 | The Abyss     | 5    | 6 HP     | Near black walls — hardest dungeon        |
| Boss    | The Arena     | 0    | 30 HP    | Dark teal — Final Boss fight              |
+---------+---------------+------+----------+-------------------------------------------+

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
- Exit gate appears as a **glowing golden door** with green interior after boss dies

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

## ⏸ Pause System

- Press **ESC** or click the **⏸ button** to pause at any time
- Pause screen shows 3 options:
  - **▶ Resume** — triggers a 3..2..1 countdown then continues exactly where paused
  - **↺ Restart** — restarts the game from Level 1
  - **⌂ Main Menu** — returns to the start screen
- Pause button hidden on the start screen

---

## 🩸 Damage Effects

Three layered visual effects when the player takes damage:

+---------------------------+---------------------------+
| Effect                    | Triggers When             |
+---------------------------+---------------------------+
| Sharp red screen flash    | Every hit from an enemy   |
| Pulsing red overlay       | HP drops below 50         |
| Red vignette border       | HP drops below 75         |
+---------------------------+---------------------------+

---

## 🔊 Sound Effects

+-------------------+-----------------------------------+
| Sound             | Trigger                           |
+-------------------+-----------------------------------+
| `shoot.wav`       | Every time the player fires       |
| `enemyDie.mp3`    | Enemy or boss is killed           |
| `coin.wav`        | Coin collected                    |
| `key.wav`         | Key collected                     |
| `playerDie.ogg`   | Player HP hits zero               |
| `win.mp3`         | Game completed or boss defeated   |
+-------------------+-----------------------------------+

---

## 🗺️ Minimap

The minimap in the top-right corner shows:

- **Purple dot** — player position and look direction
- **Red dots** — all living enemy positions
- **Coloured dots** — uncollected key locations in their own colours
- **Yellow dot** — exit gate location (normal levels)
- **Green dot** — boss arena exit (only appears after boss is defeated)
- Hidden completely on the start screen

---

## 👁️ Sprite Occlusion

Enemies, coins and keys are only visible when they are physically in front of a wall from the player's perspective. A depth buffer stores the wall distance for every screen column during raycasting. Sprites are checked against this buffer before drawing — anything behind a wall is hidden. The dungeon feels properly three dimensional.

---

## 📁 Project Structure

```
dungeon3d/
├── index.html          ← Game canvas, HUD, script loader
├── README.md           ← This file
├── audio/
│   ├── shoot.wav       ← Gunshot sound
│   ├── enemyDie.mp3    ← Enemy death sound
│   ├── coin.wav        ← Coin pickup sound
│   ├── key.wav         ← Key pickup sound
│   ├── playerDie.ogg   ← Player death sound
│   └── win.mp3         ← Win / boss defeated sound
├── css/
│   └── style.css       ← Full screen layout, HUD, dark theme
└── js/
    ├── map.js          ← All 6 level definitions (maps, keys, exits)
    ├── player.js       ← Player state, movement, keyboard input
    ├── raycaster.js    ← 3D raycasting engine + depth buffer
    ├── sprites.js      ← Coins, keys, collection logic, occlusion
    ├── enemies.js      ← Enemy AI, boss logic, HP bars, exit gate
    ├── sound.js        ← Sound system using Audio API
    └── game.js         ← Main loop, HUD, gun, particles, pause system
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

### Option 2: Node.js http-server

```bash
npm install -g http-server
cd dungeon3d
http-server .
# Open http://localhost:8080
```

### Option 3: Python

```bash
cd dungeon3d
python -m http.server 8080
# Open http://localhost:8080
```

> ⚠️ Never open index.html by double-clicking. Always use a local server.

---

## ⚙️ How the Raycasting Engine Works

The 3D effect works by casting rays from the player's position across a 60° field of view. Each ray travels through the map grid until it hits a wall. The distance to the wall determines how tall to draw that wall column on screen — closer walls appear taller, farther walls appear shorter.

```
Player → cast 160 rays → measure wall distance → draw vertical wall slices
```

A depth buffer stores the corrected wall distance for every screen column. Sprites are only drawn when their distance is less than the wall distance at their screen column — this prevents anything from showing through walls.

This technique is the same used in **Wolfenstein 3D (1992)** and **Doom (1993)**.

---

## 🛠️ Built With

+-----------------------+-----------------------------------+
| Technology            | Purpose                           |
+-----------------------+-----------------------------------+
| HTML5 Canvas          | Rendering the entire 3D scene     |
| Vanilla JavaScript    | Raycasting engine, game logic, AI |
| CSS3                  | Full screen layout, HUD styling   |
| Web Audio API         | Sound effects                     |
+-----------------------+-----------------------------------+

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
- Wave-based enemy spawning every 7 seconds
- Ammo system with enemy drops
- Kill feed display
- Gun model with muzzle flash
- Blood particle effects
- Enemy HP bars above their heads
- Enemy hit flash effect
- Enemy red dots on minimap

### v2.1 — Multiple Levels
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

### v3.0 — Final Boss
- Boss Arena added as Level 6
- Final Boss with 30 HP and two phases
- Phase 2 enraged mode at 50% HP
- Large boss HP bar at top of screen
- Exit gate hidden until boss is defeated
- Full HP and 35 ammo on boss entry
- Boss shown as red dot on minimap
- Dedicated boss win screen

### v3.1 — Audio Update
- 6 sound effects added
- Shoot, enemy death, coin pickup, key pickup, player death, win sounds
- All sounds managed through sound.js
- Sounds rewind before playing for rapid fire support

### v3.2 — Polish Update
- Pause system added — ESC or pause button
- Resume with 3 second countdown
- Main Menu button returns to start screen
- Sprite occlusion fixed using depth buffer
- Enemies, coins and keys no longer visible through walls
- Minimap hidden on start screen
- Favicon 404 error fixed

---

## 💡 Future Ideas

- Multiple weapons — shotgun, rifle
- Health and armour pickups
- Difficulty modes — Easy, Normal, Hard
- Leaderboard using localStorage
- Wall textures
- Secret rooms
- Locked doors
- Screen shake on damage

---

## 📄 License

Open source and free to use for learning and personal projects.

---

*Built with HTML · CSS · JavaScript*
*No libraries. No frameworks. Just a browser and a text editor.*