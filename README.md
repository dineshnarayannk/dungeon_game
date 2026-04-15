# Dungeon 3D

A browser-based first-person dungeon shooter built with HTML, CSS, and vanilla JavaScript.
The game uses a simple raycasting engine to render a retro 3D world directly on the canvas, with no external game engine or framework.

## Overview

Dungeon 3D is a survival and progression shooter where the player explores dungeon levels, collects keys, defeats enemies, unlocks the exit gate, and advances through increasingly difficult stages. The game also includes a boss fight, gun store, level select screen, power-ups, audio, minimap, and save data using `localStorage`.

## Features

- Retro 3D raycasting renderer using HTML5 canvas
- 10 dungeon levels plus a final boss arena
- Key collection and kill-based gate unlocking
- Multiple guns with buying and equipping system
- Coins and persistent gun unlocks using `localStorage`
- Enemy spawning, scaling difficulty, and boss fight
- Power-ups for health, ammo, and shield
- Pause screen, level complete screen, and level select screen
- Home screen with settings and armory/store
- Sound effects and volume control
- Minimap, HUD, score, wave, ammo, keys, and kill counters
- Day/night and weather effects

## Gameplay Objective

For each normal level:

1. Collect all required keys
2. Kill the required number of enemies
3. Unlock the exit gate
4. Reach the exit to move to the next level

For the final stage:

1. Defeat the boss
2. Reach the exit gate after it appears

## Controls

+-------------------------+---------------------+
| Key                     | Action              |
+-------------------------+---------------------+
| `W` / `Arrow Up`        | Move forward        |
| `S` / `Arrow Down`      | Move backward       |
| `A` / `Arrow Left`      | Turn left           |
| `D` / `Arrow Right`     | Turn right          |
| `Shift`                 | Sprint              |
| `Mouse Move`            | Look / turn         |
| `Left Click` / `Space`  | Shoot               |
| `Esc`                   | Pause               |
| `R`                     | Restart current run |
+-------------------------+---------------------+

## Core Systems

### Raycasting Engine

- Walls are rendered with a raycasting approach
- A depth buffer is used so sprites do not render through walls
- The game draws wall slices column by column for the pseudo-3D effect

### Enemy System

- Enemies spawn at level start and continue spawning over time
- Enemy health and speed scale with later levels
- Boss arena uses a separate boss system

### Exit Gate System

- The gate stays locked until both requirements are completed
- Requirements:
  - all keys collected
  - required kill count reached

### Gun Store

Available weapons include:

- Pistol
- Shotgun
- Rifle
- Sniper
- Plasma Cannon
- Inferno Blaster

Players can:

- buy guns with coins
- equip unlocked guns
- keep owned/equipped guns saved in browser storage

### Power-Ups

- Health refill
- Ammo refill
- Temporary shield

### Progress Saving

The game stores data using `localStorage`, including:

- unlocked levels
- total coins
- owned guns
- equipped gun

## Screens / UI

- Home screen
- Settings screen
- Guns / Armory screen
- Level select screen
- Level card screen
- Pause overlay
- Level complete screen
- In-game HUD and minimap

## Project Structure

```text
Dungeon-game/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── enemies.js
    ├── game.js
    ├── guns.js
    ├── map.js
    ├── player.js
    ├── raycaster.js
    ├── save.js
    ├── sound.js
    ├── sprites.js
    └── weather.js
```

## File Guide

- `index.html`  
  Main game layout, overlays, buttons, and script loading.

- `css/style.css`  
  All game styling for HUD, menus, armory, pause screen, and overlays.

- `js/game.js`  
  Main game loop, UI flow, pause logic, level flow, HUD updates, and gameplay orchestration.

- `js/player.js`  
  Player state, controls, movement, sprinting, and keyboard handling.

- `js/raycaster.js`  
  Canvas rendering, raycasting logic, wall drawing, and depth buffer.

- `js/enemies.js`  
  Enemy spawning, enemy AI, enemy drawing, damage handling, and boss logic.

- `js/sprites.js`  
  Keys, coins, pickup placement, sprite rendering, and collection logic.

- `js/guns.js`  
  Gun definitions, gun store UI, gun buying, equipping, and armory details.

- `js/map.js`  
  All level definitions, map layouts, exit positions, and level requirements.

- `js/save.js`  
  Progress persistence such as coins, levels, and unlock-related data.

- `js/sound.js`  
  Audio loading and playback.

- `js/weather.js`  
  Day/night cycle, weather effects, and visual atmosphere updates.

## How to Run

You can run the game with any simple local server.

### Option 1: VS Code Live Server

1. Open the project in VS Code
2. Right-click `index.html`
3. Choose `Open with Live Server`

### Option 2: Python

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

### Option 3: Node.js

```bash
npx http-server
```

Then open the local URL shown in the terminal.

## Notes

- The game is designed for desktop keyboard and mouse controls
- Browser `localStorage` is used for saving progress
- Opening the file through a local server is recommended instead of double-clicking `index.html`

## Future Ideas

- More enemy types
- Improved weapon effects
- Better map variety
- Mobile support
- Difficulty modes
- Better save/profile system

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- HTML5 Canvas
- Browser Audio APIs

## License

This project is free to use for learning and personal development.
