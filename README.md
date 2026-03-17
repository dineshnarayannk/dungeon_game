🏰 DUNGEON 3D

A browser-based 3D dungeon game built with pure HTML, CSS and JavaScript — no game engine, no frameworks, no installs. Uses a raycasting engine (the same technique as Wolfenstein 3D and Doom) to render a 3D world in real time.

🎮 Demo

Open index.html with Live Server in VS Code and press Space to start!

📁 Project Structure
dungeon3d/
├── index.html        ← Game canvas, HUD, and script loader
├── css/
│   └── style.css     ← Dark theme, HUD bars, layout
└── js/
    ├── map.js        ← Dungeon grid layout (16x16)
    ├── player.js     ← Player state, movement, keyboard input
    ├── raycaster.js  ← 3D raycasting engine (core of the game)
    ├── sprites.js    ← Coins, keys, and collection logic
    ├── enemies.js    ← Enemy AI, movement, and damage
    └── game.js       ← Main loop, HUD, minimap, start screen

🕹️ How to Play
Controls
KeyActionW or Arrow UpMove forwardS or Arrow DownMove backwardA or Arrow LeftTurn leftD or Arrow RightTurn rightSpaceStart the gameRRestart the game
Objective

Explore the dungeon and collect all 3 keys hidden around the map
Watch the key counter in the top bar (0/3 → 1/3 → 2/3 → 3/3)
Once all 3 keys are collected, navigate to the bottom-right corner of the dungeon (position 14, 14) to escape and win!

Key Locations
KeyColourMap PositionKey 1🟡 GoldTop-right corner (14, 2)Key 2🔵 BlueBottom-left corner (1, 13)Key 3🩷 PinkBottom-right corner (13, 13)
Collectibles

💰 Coins — Gold glowing circles scattered around the dungeon. Walk into them for +10 score
🔑 Keys — Walk into them to collect. All 3 needed to unlock the exit
❤️ HP Pickups — Restores health when collected
🛡️ Shield Pickups — Temporary invincibility

Enemies

3 red enemies patrol the dungeon
They chase you when you get within 6 tiles
Contact drains your HP bar
If HP reaches 0 → Game Over → press R to restart


🚀 Getting Started
Option 1: VS Code Live Server (Recommended)
bash# 1. Clone or download the project
git clone https://github.com/yourusername/dungeon3d.git
cd dungeon3d

# 2. Open in VS Code
code .

# 3. Right-click index.html in the sidebar
# 4. Click "Open with Live Server"
# 5. Browser opens at http://127.0.0.1:5500
Option 2: Node.js http-server
bash# Install http-server globally (once)
npm install -g http-server

# Run inside the project folder
cd dungeon3d
http-server .

# Open http://localhost:8080 in your browser
Option 3: Python
bashcd dungeon3d

# Python 3
python -m http.server 8080

# Open http://localhost:8080 in your browser

⚠️ Never open index.html by double-clicking it. Always use a local server — otherwise the JS files will fail to load due to browser CORS restrictions.


⚙️ How It Works
Raycasting Engine (raycaster.js)
The 3D effect works by casting rays from the player's position across a 60° field of view. Each ray travels through the map grid until it hits a wall. The distance to the wall determines how tall to draw that wall column on screen — closer walls appear taller.
Player position → cast 160 rays → measure wall distance → draw vertical slices
This is the exact same technique used in Wolfenstein 3D (1992) and Doom (1993).
Map System (map.js)
The dungeon is a 16×16 grid of 1s and 0s:

1 = wall
0 = open floor

javascriptconst MAP = [
  [1,1,1,1,1,1,1,1,...],
  [1,0,0,0,0,0,1,0,...],
  ...
];
Sprite Projection (sprites.js)
Coins and keys are projected into 3D space using angle and distance from the player. Sprites farther away appear smaller and darker.
Enemy AI (enemies.js)
Enemies use simple distance-based AI — if the player is within 6 tiles, the enemy moves directly toward the player while avoiding walls.

🛠️ Built With
TechnologyPurposeHTML5 CanvasRendering the 3D sceneVanilla JavaScriptGame logic, raycasting, AICSS3HUD, layout, dark theme
No libraries. No frameworks. No build tools. Just open and play.

💡 Ideas to Extend the Game

Shooting — Track bullet positions, move each frame, check collision with enemies
More levels — Create new MAP arrays, load next level when exit is reached
Sound effects — Use the Web Audio API for footsteps and hit sounds
Textures — Load images and use ctx.drawImage() per wall slice
Bigger maps — Increase MAP grid size, update ROWS and COLS
Mobile controls — Add on-screen joystick with touchstart/touchend events
Multiplayer — Sync player positions via Node.js WebSocket server


📸 Screenshots
Press Space → Explore dungeon → Collect keys → Find exit → Escape!

📄 License
This project is open source and free to use for learning purposes.

🙌 Acknowledgements
Inspired by the classic raycasting technique from id Software's Wolfenstein 3D (1992). Built as a learning project to demonstrate that 3D games can be made with just a browser and a text editor.