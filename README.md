# 🏰 Dungeon 3D

A browser-based first-person 3D dungeon survival shooter built with pure HTML, CSS and JavaScript. No game engine, no frameworks, no installs. Uses a **raycasting engine** inspired by Wolfenstein 3D and Doom to render a 3D world entirely in the browser.

---

## 🎮 How to Play

### Controls

+-------------------------+-----------------------------+
| Key                     | Action                      |
+-------------------------+-----------------------------+
| `W` or `Arrow Up`       | Move forward                |
| `S` or `Arrow Down`     | Move backward               |
| `A` or `Arrow Left`     | Turn left                   |
| `D` or `Arrow Right`    | Turn right                  |
| `Shift + W`             | Sprint — moves 2.2x faster  |
| `SPACE` or `Left Click` | Shoot                       |
| `Mouse Move`            | Turn left / right           |
| `ESC`                   | Pause / Resume              |
| `R`                     | Restart game                |
+-------------------------+-----------------------------+

### Objective

- Find all hidden **keys** in each level
- **Kill** the required number of enemies
- Both requirements met — **exit gate opens**
- Reach the **exit gate** to advance to the next level
- Complete all 5 levels then **defeat the Final Boss** to win

---

## 🗺️ Levels

+---------+---------------+------+--------------+----------+-------------------------------+
| Level   | Name          | Keys | Kills Needed | Enemy HP | Theme                         |
+---------+---------------+------+--------------+----------+-------------------------------+
| Level 1 | The Dungeon   | 3    | 4            | 2 HP     | Purple walls — open corridors |
| Level 2 | The Maze      | 3    | 5            | 3 HP     | Green walls — tight maze      |
| Level 3 | The Fortress  | 4    | 6            | 4 HP     | Red walls — symmetrical map   |
| Level 4 | The Catacombs | 4    | 7            | 5 HP     | Dark purple — grid corridors  |
| Level 5 | The Abyss     | 5    | 8            | 6 HP     | Near black — hardest dungeon  |
| Boss    | The Arena     | 0    | Boss         | 30 HP    | Dark teal — Final Boss fight  |
+---------+---------------+------+--------------+----------+-------------------------------+

---

## 👹 Final Boss

After escaping Level 5 the player enters the **Boss Arena** — a closed room with no keys, no coins and no escape until the boss is defeated.

- **30 hits** to kill
- **Phase 1** (100%–50% HP) — Dark red, normal speed
- **Phase 2** (below 50% HP) — Turns orange, moves faster, **ENRAGED** warning
- **Exit gate** stays completely hidden until the boss dies
- Player enters with **full HP** and **35 ammo**
- Boss HP bar displayed at top center of screen
- Boss shown as **red dot** on minimap
- Exit gate appears as **glowing golden door** after boss dies

---

## 🔫 Combat System

- **Raycast shooting** — bullets travel instantly along line of sight
- **15 frame cooldown** between shots
- **30–35 ammo** per level — manage carefully
- **40% chance** enemies drop +5 ammo on death
- **Kill feed** in top-right corner tracks every kill and drop
- **+100 points** per enemy kill
- **+200 points** per key collected
- **+500 points** for defeating the Final Boss

---

## 🚪 Exit Gate System

The exit gate is **hidden** until both conditions are met every level:

- Collect all required **keys**
- Kill the required number of **enemies**

A live progress bar at the bottom of the screen tracks both requirements. Both turn green with a ✓ tick when completed. The gate then appears as a glowing golden door and a green dot appears on the minimap.

---

## 🌊 Wave System

- Enemies spawn continuously every **7 seconds** throughout each level
- Each level starts with a fixed number of enemies
- Enemy HP and speed **scale up** with each level
- All enemy positions shown as **red dots** on the minimap

---

## 🎭 Enemy & Collectible Visuals

+-----------+---------------------------------------------------------------+
| Item      | Visual                                                        |
+-----------+---------------------------------------------------------------+
| Enemies   | Red ghost shape with white eyes and black pupils              |
| Keys      | Detailed ornate golden key with ring, wings, shaft and teeth  |
| Coins     | 3D gold dollar coin with $ sign, rim detail and stars         |
| Exit Gate | Glowing golden door frame with green interior                 |
+-----------+---------------------------------------------------------------+

---

## 🎲 Random Key & Coin Placement

Every time a level loads — including restarts — keys and coins are placed at **completely random positions** on the map. No two playthroughs are the same.

Rules for placement:
- Keys must be at least **4 tiles** from player start
- Keys must be at least **3 tiles** from each other
- Coins must be at least **2 tiles** from player start
- Nothing spawns inside walls or on the exit

---

## ⏸ Pause System

- Press **ESC** or click the **⏸ button** to pause at any time
- Pause screen shows 3 options:
  - **▶ Resume** — triggers a 3..2..1 countdown then continues
  - **↺ Restart** — restarts from Level 1
  - **⌂ Main Menu** — returns to the home screen
- Mouse cursor changes to pointer over pause buttons

---

## 🏆 Level Complete Screen

After completing each level a dedicated **Level Complete** screen appears showing:
- Level name and number
- Current score and kills
- Three buttons — **Retry** (restart same level), **Next** (go to next level), **Menu** (home screen)
- Retry restarts from the level just completed — not from Level 1
- After the Final Boss — only **Menu** button shown, no Next

---

## 💊 Power-Up System

Three power-ups available during gameplay, shown as glowing buttons below the pause button:

+----------+------+------+-------------------------------------------------+
| Power-Up | Icon | Uses | Effect                                          |
+----------+------+-------+------------------------------------------------+
| Health   | ❤️   | 2    | Instantly restores HP to 100                    |
| Ammo     | 🔫   | 2   | Instantly refills ammo to 35                     |
| Shield   | 🛡️   | 1    | 20 second invincibility — no damage from enemies |
+----------+------+------+--------------------------------------------------+

- Shield shows a **blue pulsing vignette** around the screen while active
- A **blue timer bar** at top of screen shows remaining shield time
- Count badge on each button shows remaining uses
- Buttons grey out when empty

---

## 🩸 Damage Effects

Three layered visual effects when the player takes damage:

+-------------------------+-------------------------+
| Effect                  | Triggers When           |
+-------------------------+-------------------------+
| Sharp red screen flash  | Every hit from an enemy |
| Pulsing red overlay     | HP drops below 50       |
| Red vignette border     | HP drops below 75       |
+-------------------------+-------------------------+

---

## 🌙 Day / Night & Weather System

Two automatic cycles run independently during gameplay:

### Day / Night Cycle — 4 minute full cycle
+---------+-----------------+-----------------+----------+
| Phase   | Sky             | Walls           | Duration |
+---------+-----------------+-----------------+----------+
| Day     | Blue-white      | Full brightness | 60 sec   |
| Sunset  | Orange/red      | 75% brightness  | 60 sec   |
| Night   | Dark blue/black | 40% brightness  | 60 sec   |
| Dawn    | Purple/pink     | 60% brightness  | 60 sec   |
+---------+-----------------+-----------------+----------+

### Weather Cycle — 3 minute full cycle
+---------+-------------------------------+----------+
| Weather | Effect                        | Duration |
+---------+-------------------------------+----------+
| Clear   | No effect                     | 45 sec   |
| Rain    | White rain streaks falling    | 45 sec   |
| Storm   | Heavy rain + lightning flash  | 45 sec   |
| Fog     | White fog patches on screen   | 45 sec   |
+---------+-------------------------------+----------+

- **Torch flicker** — wall brightness gently pulses like a torch
- **Boss Arena** — always night, no weather
- Weather indicator shown bottom-left during gameplay

---

## 🔊 Sound Effects

+-----------------+---------------------------------+
| Sound           | Trigger                         |
+-----------------+---------------------------------+
| `shoot.wav`     | Every time the player fires     |
| `enemyDie.mp3`  | Enemy or boss is killed         |
| `coin.wav`      | Coin collected                  |
| `key.wav`       | Key collected                   |
| `playerDie.ogg` | Player HP hits zero             |
| `win.mp3`       | Game completed or boss defeated |
+-----------------+---------------------------------+

Volume can be adjusted from the **Settings** page.

---

## 🏠 Home Screen

The main menu features:
- **Animated player character** in the center with bobbing animation
- **PLAY button** — right side, starts the game immediately
- **SETTINGS button** — left side, opens settings panel
- **GUNS button** — left side, gun selection (coming soon)
- Level list pills showing all 6 stages

---

## ⚙️ Settings

Accessible from the home screen Settings button:

+-----------+---------------------------------------------------------------+ 
| Setting   | Options                                                       |
+-----------+---------------------------------------------------------------+
| Volume    | Slider 0–100% — adjusts all game sounds                       |
| Language  | English, Tamil, Hindi, French, German, Spanish                |
| Support   | Opens email to dineshnk167@gmail.com with pre-filled subject  |
+-----------+---------------------------------------------------------------+
---

## 🗺️ Minimap

The minimap in the top-right corner shows:

- **Purple dot** — player position and look direction
- **Red dots** — all living enemy positions
- **Coloured dots** — uncollected key locations in their own colours
- **Yellow dot** — exit gate (normal levels, only after gate unlocks)
- **Green dot** — boss arena exit (only after boss dies)
- **Red dot** — boss position in arena
- Hidden completely on the home screen

---

## 👁️ Sprite Occlusion

Enemies, coins and keys are only visible when physically in front of a wall. A depth buffer stores wall distance per screen column during raycasting. Sprites are checked against this buffer before drawing — nothing shows through walls.

---

## 📁 Project Structure

```
dungeon3d/
├── index.html            ← Game canvas, HUD, home screen, settings, level complete
├── README.md             ← This file
├── audio/
│   ├── shoot.wav
│   ├── enemyDie.mp3
│   ├── coin.wav
│   ├── key.wav
│   ├── playerDie.ogg
│   └── win.mp3
├── css/
│   └── style.css         ← All styles — game, home screen, settings, powerups, level complete
└── js/
    ├── map.js            ← All 6 level definitions with maps, keys, exits, kill requirements
    ├── player.js         ← Player state, movement, sprint, keyboard and mouse input
    ├── raycaster.js      ← 3D raycasting engine, depth buffer, day/night colours
    ├── sprites.js        ← Random key/coin placement, coin and key visuals, collection
    ├── enemies.js        ← Ghost enemy visual, boss logic, HP bars, exit gate, occlusion
    ├── sound.js          ← Sound system — loads and plays all 6 audio files
    ├── weather.js        ← Day/night cycle, rain, storm, fog, torch flicker
    └── game.js           ← Main loop, HUD, gun, pause, power-ups, level complete screen
```

---

## 🚀 Getting Started

### Option 1: VS Code Live Server (Recommended)

```bash
code dungeon3d
# Right-click index.html → Open with Live Server
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

Rays are cast from the player across a 60° field of view. Each ray travels the map grid until hitting a wall. Wall distance determines column height — closer = taller. A depth buffer stores the corrected wall distance per column. Sprites only draw when their distance is less than the wall distance at their screen column — nothing shows through walls.

```
Player → 160 rays → measure wall distance → draw wall slices → check sprites against depth buffer
```

Same technique as **Wolfenstein 3D (1992)** and **Doom (1993)**.

---

## 🛠️ Built With

+---------------------+---------------------------------------------------+
| Technology          |Purpose                                            |
+---------------------+---------------------------------------------------+
| HTML5 Canvas        | Rendering the 3D scene                            |  
| Vanilla JavaScript  | Raycasting, game logic, AI, weather               |
| CSS3                | Full screen layout, HUD, home screen, animations  |
| Web Audio API       | Sound effects                                     |
+---------------------+---------------------------------------------------+

No libraries. No frameworks. No build tools.

---

## 📋 Development Changelog

### v1.0 — Initial Release
- 3D raycasting engine
- Basic dungeon map, player movement, collision

### v1.1 — Health Damage Effects
- Red screen flash, pulsing overlay, vignette border

### v2.0 — Combat Update
- Shooting, wave spawning, ammo, kill feed, gun model, particles
- Enemy HP bars, hit flash, enemy minimap dots

### v2.1 — Multiple Levels
- 3 levels, level complete screen, key minimap dots

### v2.2 — Level Expansion
- Level 4 and Level 5 added, enemy scaling

### v3.0 — Final Boss
- Boss Arena, 30 HP boss, Phase 2 enraged mode
- Boss HP bar, hidden exit gate, full restore on entry

### v3.1 — Audio Update
- 6 sound effects, sound.js system, cloneNode playback

### v3.2 — Polish Update
- Pause system with countdown resume, sprite occlusion depth buffer
- Minimap hidden on start screen, favicon fix

### v3.3 — Gameplay Update
- Exit gate visual for all levels — unlocks after keys + kills
- Kill requirement system with live progress bar
- Mouse left click shoots, mouse move turns player
- Restart and main menu pause button fixes

### v3.4 — Power-Ups Update
- Health, Ammo and Shield power-ups with limited uses
- Shield blocks all damage for 20 seconds
- Blue vignette and timer bar during shield

### v3.5 — Weather Update
- Day/Night 4-phase cycle — 4 minute loop
- Weather 4-phase cycle — 3 minute loop
- Rain, Storm with lightning, Fog, Clear
- Torch flicker on walls, weather HUD indicator

### v3.6 — Visuals Update
- Ghost enemy visual with eyes and wavy body
- Ornate golden key visual with ring and wings
- Gold dollar coin visual with $ sign and stars
- Random key and coin placement every level load
- Sprint system — Shift + W for 2.2x speed

### v3.7 — UI Update
- Level Complete screen with Retry, Next and Menu buttons
- Retry restarts from same level not Level 1
- Home screen with animated player character
- Play, Settings and Guns buttons on home screen
- Settings panel — volume slider, language, support email
- Support opens email to dineshnk167@gmail.com

---

## 💡 Planned Features

- Gun selection system (Pistol, Shotgun, Rifle)
- Enemy type variety
- Leaderboard using localStorage
- Wall textures
- Secret rooms
- Difficulty modes

---

## 📄 License

Open source and free to use for learning and personal projects.

---

*Built with HTML · CSS · JavaScript*
*No libraries. No frameworks. Just a browser and a text editor.*