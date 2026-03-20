// ── GAME STATE ────────────────────────────────────────────────
let gameState       = 'start';
let gameStarted     = false;
let kills           = 0;
let ammo            = 30;
let muzzleFlash     = 0;
let shootCooldown   = 0;
let waveTimer       = 0;
let wave            = 1;
let particles       = [];
let killFeed        = [];
let damageFlashTimer = 0;
let spawnInterval   = null;
let levelTransTimer = 0;
let levelTransMsg   = '';

// ── LOAD LEVEL ────────────────────────────────────────────────
function loadLevel(idx) {
  const lv = LEVELS[idx];

  MAP  = lv.map;
  ROWS = MAP.length;
  COLS = MAP[0].length;

  player.x     = lv.playerStart.x;
  player.y     = lv.playerStart.y;
  player.angle = 0;
  player.hp    = Math.min(100, player.hp + 30);

  ammo         = 30;
  wave         = 1;
  waveTimer    = 150;
  enemies      = [];
  particles    = [];
  killFeed     = [];

  initSprites();

  if (spawnInterval) clearInterval(spawnInterval);
  spawnWave(lv.spawnCount, lv);

  spawnInterval = setInterval(() => {
    if (gameState !== 'playing') return;
    spawnOneEnemy(lv);
  }, 7000);

  document.getElementById('level-title').textContent =
    'DUNGEON 3D  —  LEVEL ' + (idx + 1) + ': ' + lv.name;
  document.getElementById('lvl-val').textContent = idx + 1;

  gameState = 'playing';
}

// ── INIT GAME ─────────────────────────────────────────────────
function initGame() {
  currentLevel = 0;
  score        = 0;
  kills        = 0;
  player.hp    = 100;
  player.angle = 0;
  gameState    = 'playing';
  loadLevel(0);
}

// ── SHOOT ─────────────────────────────────────────────────────
function shoot() {
  if (ammo <= 0 || shootCooldown > 0 || gameState !== 'playing') return;
  ammo--;
  shootCooldown = 15;
  muzzleFlash   = 6;

  let sin = Math.sin(player.angle);
  let cos = Math.cos(player.angle);

  for (let d = 0.5; d < MAX_DEPTH; d += 0.1) {
    let bx = player.x + cos * d;
    let by = player.y + sin * d;
    if (isWall(bx, by)) break;

    for (let e of enemies) {
      if (!e.alive) continue;
      let dx = e.x - bx, dy = e.y - by;
      if (Math.sqrt(dx * dx + dy * dy) < 0.4) {
        e.hp--;
        e.flashTimer = 8;
        for (let p = 0; p < 6; p++) {
          particles.push({
            x: e.x, y: e.y,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,
            life: 20, maxLife: 20,
            color: '#cc0000',
          });
        }
        if (e.hp <= 0) {
          e.alive = false;
          kills++;
          score += 100;
          killFeed.unshift({ msg: '+100  ENEMY DOWN', timer: 60 });
          if (killFeed.length > 4) killFeed.pop();
          if (Math.random() < 0.4) {
            ammo = Math.min(30, ammo + 5);
            killFeed.unshift({ msg: '+5 AMMO DROP', timer: 60 });
          }
        }
        return;
      }
    }
  }
}

// ── TRIGGER DAMAGE FLASH ──────────────────────────────────────
function triggerDamageFlash() {
  damageFlashTimer = 18;
}

// ── DRAW PARTICLES ────────────────────────────────────────────
function drawParticles() {
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) return false;
    let proj = worldToScreen(p.x, p.y);
    if (!proj) return p.life > 0;
    ctx.globalAlpha = p.life / p.maxLife * 0.85;
    ctx.fillStyle   = p.color;
    ctx.beginPath();
    ctx.arc(proj.sx, HALF, Math.max(2, proj.size * 0.08), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return true;
  });
}

// ── DRAW GUN ──────────────────────────────────────────────────
function drawGun() {
  let bob = Math.sin(Date.now() * 0.008) * 4;
  let gx  = W / 2 + 120;
  let gy  = H - 20 + bob;

  // Muzzle flash
  if (muzzleFlash > 0) {
    ctx.fillStyle = `rgba(255,200,0,${muzzleFlash / 6 * 0.9})`;
    ctx.beginPath();
    ctx.arc(gx, gy - 130, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.95)';
    ctx.beginPath();
    ctx.arc(gx, gy - 130, 12, 0, Math.PI * 2);
    ctx.fill();
    muzzleFlash--;
  }

  // Barrel
  ctx.fillStyle = '#888';
  ctx.fillRect(gx - 10, gy - 140, 22, 90);

  // Body
  ctx.fillStyle = '#666';
  ctx.fillRect(gx - 26, gy - 55, 54, 48);

  // Grip
  ctx.fillStyle = '#555';
  ctx.fillRect(gx - 10, gy - 10, 22, 45);

  // Trigger guard
  ctx.fillStyle = '#777';
  ctx.fillRect(gx - 24, gy - 48, 10, 20);

  // Top rail
  ctx.fillStyle = '#999';
  ctx.fillRect(gx - 8, gy - 138, 18, 8);
}

// ── DRAW MINIMAP ──────────────────────────────────────────────
function drawMinimap() {
  const mw = 80, mh = 80;
  const ms = mw / COLS;
  const ox = W - mw - 8, oy = 8;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(ox, oy, mw, mh);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (MAP[y][x] === 1) {
        ctx.fillStyle = '#3a3460';
        ctx.fillRect(ox + x * ms, oy + y * ms, ms, ms);
      }
    }
  }

  // Exit dot
  const exPos = LEVELS[currentLevel].exit;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(ox + exPos.x * ms, oy + exPos.y * ms, 3, 0, Math.PI * 2);
  ctx.fill();

  // Key Dot
  keys_items.forEach(k => {
    if (!k.alive) return;
    ctx.fillStyle = k.color;
    ctx.beginPath();
    ctx.arc(ox + k.x * ms, oy + k.y * ms, 3, 0, Math.PI*2);
    ctx.fill();
    // Small white ring around key dot so it stands out
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ox + k.x * ms, oy + k.y * ms, 4, 0, Math.PI*2);
    ctx.stroke();
  })

  // Enemy dots
  enemies.forEach(e => {
    if (!e.alive) return;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(ox + e.x * ms, oy + e.y * ms, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Player dot
  ctx.fillStyle = '#7c6fff';
  ctx.beginPath();
  ctx.arc(ox + player.x * ms, oy + player.y * ms, 3, 0, Math.PI * 2);
  ctx.fill();

  // Direction line
  ctx.strokeStyle = '#7c6fff';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(ox + player.x * ms, oy + player.y * ms);
  ctx.lineTo(
    ox + (player.x + Math.cos(player.angle) * 1.5) * ms,
    oy + (player.y + Math.sin(player.angle) * 1.5) * ms
  );
  ctx.stroke();
}

// ── DRAW HUD ──────────────────────────────────────────────────
function drawHUD() {

  // 1. Hit flash
  if (damageFlashTimer > 0) {
    ctx.fillStyle = `rgba(200,0,0,${damageFlashTimer / 18 * 0.25})`;
    ctx.fillRect(0, 0, W, H);
    damageFlashTimer--;
  }

  // 2. Low HP pulse
  if (player.hp < 50) {
    let intensity = (50 - player.hp) / 50 * 0.18;
    let pulse     = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    ctx.fillStyle = `rgba(180,0,0,${intensity * pulse})`;
    ctx.fillRect(0, 0, W, H);
  }

  // 3. Edge vignette
  if (player.hp < 75) {
    let ei = (75 - player.hp) / 75 * 0.45;
    let g  = ctx.createRadialGradient(W/2, H/2, H*0.45, W/2, H/2, H*0.95);
    g.addColorStop(0, 'rgba(180,0,0,0)');
    g.addColorStop(1, `rgba(180,0,0,${ei})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // KEYS row
  const lv = LEVELS[currentLevel];
  ctx.fillStyle = '#777';
  ctx.font      = '9px monospace';
  ctx.fillText('KEYS', 10, H - 68);
  for (let i = 0; i < lv.keysNeeded; i++) {
    ctx.fillStyle = i < collectedKeys ? '#FFD700' : '#333';
    ctx.fillRect(10 + i * 20, H - 63, 12, 10);
    ctx.beginPath();
    ctx.arc(10 + i * 20 + 6, H - 64, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // AMMO row
  ctx.fillStyle = '#888';
  ctx.font      = '10px monospace';
  ctx.fillText('AMMO: ' + ammo, 10, H - 46);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(10, H - 42, 80, 5);
  ctx.fillStyle = ammo > 10 ? '#e8b84b' : '#e74c3c';
  ctx.fillRect(10, H - 42, (ammo / 30) * 80, 5);

  // HP row
  ctx.fillStyle = '#888';
  ctx.font      = '10px monospace';
  ctx.fillText('HP', 10, H - 28);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(10, H - 24, 120, 8);
  let hpPct = player.hp / 100;
  ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(10, H - 24, hpPct * 120, 8);

  // Crosshair
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2, HALF-14); ctx.lineTo(W/2, HALF+14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2-14, HALF); ctx.lineTo(W/2+14, HALF); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, HALF, 6, 0, Math.PI*2); ctx.stroke();

  // Kill feed
  killFeed = killFeed.filter(k => k.timer > 0);
  killFeed.forEach((k, i) => {
    ctx.fillStyle = `rgba(255,150,100,${k.timer / 60})`;
    ctx.font      = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(k.msg, W - 10, 20 + i * 18);
    k.timer--;
  });
  ctx.textAlign = 'left';

  // Wave / level banner
  if (waveTimer > 0) {
    let alpha = Math.min(1, waveTimer / 40);
    ctx.fillStyle = `rgba(255,200,0,${alpha})`;
    ctx.font      = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL ' + (currentLevel + 1) + '  —  ' + lv.name, W / 2, H / 2 - 40);
    ctx.fillStyle = `rgba(200,200,200,${alpha})`;
    ctx.font      = 'bold 20px monospace';
    ctx.fillText('Find ' + lv.keysNeeded + ' keys and reach the exit!', W / 2, H / 2 + 10);
    ctx.textAlign = 'left';
    waveTimer--;
  }

  // Flash message
  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flashTimer / 40 * 0.9})`;
    ctx.font      = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(flashMsg, W / 2, HALF - 30);
    flashTimer--;
    ctx.textAlign = 'left';
  }

  // Level complete screen
  if (gameState === 'levelcomplete') {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFD700';
    ctx.font      = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(levelTransMsg, W / 2, H / 2 - 60);
    ctx.fillStyle = '#fff';
    ctx.font      = '22px monospace';
    ctx.fillText('Score: ' + score + '   Kills: ' + kills, W / 2, H / 2 - 10);
    ctx.fillStyle = '#7c6fff';
    ctx.font      = 'bold 24px monospace';
    ctx.fillText(
      'LEVEL ' + (currentLevel + 2) + ': ' + LEVELS[currentLevel + 1].name,
      W / 2, H / 2 + 45
    );
    ctx.fillStyle = '#aaa';
    ctx.font      = '16px monospace';
    ctx.fillText('Get ready...', W / 2, H / 2 + 85);
    ctx.textAlign = 'left';
    levelTransTimer--;
    if (levelTransTimer <= 0) {
      currentLevel++;
      loadLevel(currentLevel);
    }
  }

  // Win screen
  if (gameState === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFD700';
    ctx.font      = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU ESCAPED!', W / 2, H / 2 - 60);
    ctx.fillStyle = '#fff';
    ctx.font      = '24px monospace';
    ctx.fillText('ALL 5 LEVELS COMPLETED!', W / 2, H / 2 - 10);
    ctx.fillStyle = '#aaa';
    ctx.font      = '20px monospace';
    ctx.fillText('Final Score: ' + score + '   Total Kills: ' + kills, W / 2, H / 2 + 40);
    ctx.fillStyle = '#7c6fff';
    ctx.font      = '16px monospace';
    ctx.fillText('Press R to play again', W / 2, H / 2 + 85);
    ctx.textAlign = 'left';
  }

  // Death screen
  if (gameState === 'dead') {
    ctx.fillStyle = 'rgba(80,0,0,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e74c3c';
    ctx.font      = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED', W / 2, H / 2 - 50);
    ctx.fillStyle = '#fff';
    ctx.font      = '20px monospace';
    ctx.fillText('Score: ' + score + '   Kills: ' + kills, W / 2, H / 2 + 5);
    ctx.fillStyle = '#aaa';
    ctx.font      = '15px monospace';
    ctx.fillText('Press R to restart', W / 2, H / 2 + 50);
    ctx.textAlign = 'left';
  }

  // Start screen
  if (gameState === 'start') {
    ctx.fillStyle = 'rgba(0,0,0,0.93)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#7c6fff';
    ctx.font      = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DUNGEON 3D', W / 2, H / 2 - 150);

    ctx.fillStyle = '#e8b84b';
    ctx.font      = 'bold 20px monospace';
    ctx.fillText('3 LEVELS  —  SURVIVE  —  ESCAPE', W / 2, H / 2 - 105);

    ctx.fillStyle = '#7c6fff';
    ctx.font      = 'bold 17px monospace';
    ctx.fillText('LEVEL 1  —  THE DUNGEON', W / 2, H / 2 - 45);
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('LEVEL 2  —  THE MAZE',    W / 2, H / 2 - 20);
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('LEVEL 3  —  THE FORTRESS', W / 2, H / 2 + 5);
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('LEVEL 4  —  THE CATACOMBS',W/2 , H/2 + 28);
    ctx.fillStyle = '#888888';
    ctx.fillText('LEVEL 5  —  THE ABYSS', W/2, H/2 + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 26px monospace';
    ctx.fillText('Press  SPACE  to Start', W / 2, H / 2 + 100);

    ctx.fillStyle = '#555';
    ctx.font      = '14px monospace';
    ctx.fillText('W A S D  move   |   Arrow Keys  look   |   SPACE  shoot', W / 2, H / 2 + 145);
    ctx.fillText('Collect all keys  →  Reach the exit  →  Next level',      W / 2, H / 2 + 168);
    ctx.textAlign = 'left';
  }
}

// ── UPDATE HTML HUD ───────────────────────────────────────────
function updateHUD() {
  document.getElementById('hp-val').textContent    = Math.max(0, Math.floor(player.hp));
  document.getElementById('coin-val').textContent  = score;
  document.getElementById('key-val').textContent   = collectedKeys + '/' + LEVELS[currentLevel].keysNeeded;
  document.getElementById('pos-val').textContent   = Math.floor(player.x) + ',' + Math.floor(player.y);
  document.getElementById('score-val').textContent = score;
  document.getElementById('kill-val').textContent  = kills;
  document.getElementById('ammo-val').textContent  = ammo;
  document.getElementById('wave-val').textContent  = wave;
  document.getElementById('lvl-val').textContent   = currentLevel + 1;
}

// ── MAIN LOOP ─────────────────────────────────────────────────
function loop() {
  handleInput();
  if (gameState === 'playing') {
    updateEnemies();
    collectItems();
  }
  drawScene();
  drawSprites();
  drawEnemies();
  drawParticles();
  drawGun();
  drawHUD();
  drawMinimap();
  updateHUD();
  requestAnimationFrame(loop);
}

// ── START ─────────────────────────────────────────────────────
loop();