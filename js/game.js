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
let isPaused = false;
let countdownTimer = 0;
let countdownValue = 3;
let healthCharges = 2;
let ammoCharges = 2;
let shieldCharges = 1;
let shieldActive = false;
let shieldTimer = 0;
let lcLevel = 0;
let globalVolume = 0.7;

// ── LOAD LEVEL ────────────────────────────────────────────────
function loadLevel(idx) {
  const lv = LEVELS[idx];

  MAP  = lv.map;
  ROWS = MAP.length;
  COLS = MAP[0].length;

  player.x     = lv.playerStart.x;
  player.y     = lv.playerStart.y;
  player.angle = 0;
  if (idx === LEVELS.length - 1){
    // Boss arena - fully restore HP and ammo
    player.hp = 100;
    ammo = 35;
    initBoss();
  }else {
    player.hp = Math.min(100,player.hp + 30) ;
  }

  ammo         = 30;
  wave         = 1;
  waveTimer    = 150;
  enemies      = [];
  particles    = [];
  killFeed     = [];
  kills        = 0;

  initSprites();

  if (spawnInterval) clearInterval(spawnInterval);
  if (idx < LEVELS.length - 1){
    spawnWave(lv.spawnCount, lv);
    spawnInterval = setInterval(() => {
      if (gameState !== 'playing') return;
      spawnOneEnemy(lv);
    }, 7000);
  }

  document.getElementById('level-title').textContent =
    'DUNGEON 3D  —  LEVEL ' + (idx + 1) + ': ' + lv.name;
  document.getElementById('lvl-val').textContent = idx + 1;

  gameState = 'playing';
}

// ── INIT GAME ─────────────────────────────────────────────────
function initGame() {
  const home = document.getElementById('home-screen');
  if (home) home.classList.add('hidden');
  currentLevel = 0;
  score        = 0;
  kills        = 0;
  player.hp    = 100;
  player.angle = 0;
  gameState    = 'playing';
  dayTimer = 0;
  weatherTimer = 0;
  dayPhase = 'day';
  weatherPhase = 'clear';
  rainDrops = [];
  lightningTimer = 0;
  lightningAlpha = 0;
  loadLevel(0);
  document.getElementById('pause-btn').classList.remove('hidden');
  healthCharges = 2;
  ammoCharges = 2;
  shieldCharges = 1;
  shieldActive = false;
  shieldTimer = 0;
  const sBtn = document.getElementById('shield-btn');
  if (sBtn) sBtn.classList.remove('active');
  updatePowerUI();
  const pw = document.getElementById('powerups');
  if (pw) pw.classList.remove('hidden');
  hideLevelComplete();
  const nextBtn = document.getElementById('lc-next');
  if (nextBtn) nextBtn.style.display = 'flex';
}

function togglePause() {
  if (gameState !== 'playing' && gameState !== 'paused') return ;
  if (gameState === 'playing') {
    gameState = 'paused';
    document.exitPointerLock();
    isPaused = true;
    document.getElementById('pause-btn').textContent = '▶';
  } else if (gameState === 'paused') {
    startResume();
  }
}

function startResume() {
  gameState = 'countdown';
  countdownValue = 3;
  countdownTimer = 60;
}

function resumeGame() {
  gameState = 'playing' ;
  isPaused = false ;
  document.getElementById('pause-btn').textContent = '⏸';
}

function goMainMenu() {
  if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; }
  gameState = 'start';
  isPaused = false;
  gameStarted = false;
  currentLevel = 0;
  score = 0; kills = 0 ; 
  enemies = []; particles = []; killFeed = [];
  exitVisible = false; damageFlashTimer = 0; waveTimer = 0;
  document.exitPointerLock();
  const pb = document.getElementById('pause-btn');
  if (pb) { pb.textContent = '⏸'; pb.classList.add('hidden'); }
  const lt = document.getElementById('level-title');
  if (lt) lt.textContent = 'DUNGEON 3D';

  // Show home screen
  const home = document.getElementById('home-screen');
  if (home) home.classList.remove('hidden');

  hideLevelComplete();
} 

function startGameFromHome() {
  const home = document.getElementById('home-screen');
  if (home) home.classList.add('hidden');
  gameStarted = true;
  initGame();
}

function openSettings() {
  const s = document.getElementById('settings-screen');
  if (s) s.classList.remove('hidden');
}

function closeSettings() {
  const s = document.getElementById('settings-screen');
  if (s) s.classList.add('hidden');
}

function changeVolume(val) {
  globalVolume = val / 100 ;
  // Update all sound volumes
  if (typeof sounds !== 'undefined') {
    Object.keys(sounds).forEach(key => {
      if (sounds[key]) sounds[key].volume = globalVolume;
    });
  }
}

function openSupport() {
  window.open(
    'mailto:dineshnk167@gmail.com' + 
    '?subject=Dungeon 3D Support' + 
    '&body=Hi, I need help with Dungeon 3D.%0A%0A' +
    'Issue: %0A%0ADevice: ' + navigator.userAgent,
    '_blank'
  );
}

function openGuns() {
  alert('Guns feature coming soon!');
}

// Update home screen coin count
function updateHomeCoin(){
  const el = document.getElementById('home-coin-count');
  if (el) el.textContent = score;
}

// Draw animated player character on home screen
function drawHomePlayer() {
  const hc = document.getElementById('home-player-canvas');
  if (!hc) return;
  const hctx = hc.getContext('2d');
  const hw = hc.width , hh = hc.height;
  hctx.clearRect(0,0, hw, hh);

  let t = Date.now() * 0.002;
  let bob = Math.sin(t) * 4;
  let cx = hw / 2;
  let cy = hh / 2 + bob;

  // Shadow
  hctx.beginPath();
  hctx.ellipse(cx, hh - 20, 40, 10, 0, 0, Math.PI * 2);
  hctx.fillStyle = 'rgba(0,0,0,0.4)';
  hctx.fill();

  // Body armour
  hctx.fillStyle = '#3a3a5a';
  hctx.beginPath();
  hctx.roundRect(cx - 28, cy - 20, 56, 80, 8);
  hctx.fill();

  // Armour chest plate
  hctx.fillStyle = '#4a4a7a';
  hctx.beginPath();
  hctx.roundRect(cx - 20, cy - 15, 40, 50, 6);
  hctx.fill();

  // Armour detail lines
  hctx.strokeStyle = '#6a6aaa';
  hctx.lineWidth = 2;
  hctx.beginPath();
  hctx.moveTo(cx, cy - 10); hctx.lineTo(cx, cy + 30);
  hctx.stroke();
  hctx.beginPath();
  hctx.moveTo(cx - 18, cy + 5); hctx.lineTo(cx + 18, cy + 5);
  hctx.stroke();

  // Helmet
  hctx.fillStyle = '#2a2a4a';
  hctx.beginPath();
  hctx.arc(cx, cy - 40, 28, 0, Math.PI * 2);
  hctx.fill();

  // Visor 
  hctx.fillStyle = '#00bfff';
  hctx.shadowColor = '#00bfff';
  hctx.shadowBlur = 10;
  hctx.beginPath();
  hctx.roundRect(cx - 16, cy - 50, 32, 14, 4);
  hctx.fill();
  hctx.shadowBlur = 0;

  // Helmet detail
  hctx.fillStyle = '#1a1a3a';
  hctx.beginPath();
  hctx.arc(cx, cy - 60, 10, Math.PI, 0);
  hctx.fill();

  // Left Arm
  hctx.fillStyle = '#3a3a5a';
  hctx.beginPath();
  hctx.roundRect(cx - 42, cy - 16, 16, 55, 6);
  hctx.fill();

  // Right arm holding gun
  hctx.fillStyle = '#3a3a5a';
  hctx.beginPath();
  hctx.roundRect(cx + 26, cy - 16, 16, 55, 6);
  hctx.fill()

  // Gun barrel
  hctx.fillStyle = '#555';
  hctx.fillRect(cx + 38, cy + 10, 22, 10);
  hctx.fillStyle = '#444';
  hctx.fillRect(cx + 32, cy + 5 , 18, 28);
  hctx.fillStyle = '#333';
  hctx.fillRect(cx + 36, cy + 28, 10, 16);

  // Gun glow
  hctx.fillStyle = 'rgba(255,200,0,0.15)';
  hctx.beginPath();
  hctx.arc(cx + 58, cy + 15, 8, 0, Math.PI * 2);
  hctx.fill();

  // Legs
  hctx.fillStyle = '#2a2a4a';
  hctx.beginPath();
  hctx.roundRect(cx - 22, cy + 58, 18, 50, 5);
  hctx.fill();
  hctx.beginPath();
  hctx.roundRect(cx + 4, cy + 58, 18, 50, 5);
  hctx.fill();

  // Boots
  hctx.fillStyle = '#1a1a2a';
  hctx.beginPath();
  hctx.roundRect(cx - 24, cy + 98, 22, 16, 4);
  hctx.fill();
  hctx.beginPath();
  hctx.roundRect(cx + 2, cy + 98, 22, 16, 4);
  hctx.fill();

  // Shoulder pads
  hctx.fillStyle = '#5a5a8a';
  hctx.beginPath();
  hctx.ellipse(cx - 34, cy - 18, 12, 8, -0.3, 0, Math.PI * 2);
  hctx.fill();
  hctx.beginPath();
  hctx.ellipse(cx + 34, cy - 18, 12, 8, 0.3, 0, Math.PI * 2);
  hctx.fill();
}

function showLevelComplete(idx) {
  lcLevel = idx;
  const lv = LEVELS[idx];
  const screen = document.getElementById('level-complete-screen');
  const banner = document.getElementById('lc-banner');
  const name = document.getElementById('lc-level-name');
  const sc = document.getElementById('lc-score');
  const kl = document.getElementById('lc-kills-stat');
  const next = document.getElementById('lc-next');

  if (!screen) return;

  // Boss complete - different message , no next button
  if (idx === LEVELS.length - 1) {
    banner.textContent = 'BOSS DEFEATED!';
    name.textContent = 'ALL LEVELS COMPLETE!';
    if (next) next.style.display = 'none';
  } else {
    banner.textContent = 'LEVEL COMPLETED!';
    name.textContent = 'LEVEL ' + (idx + 1) + '  —  ' + lv.name;
    if (next) next.style.display = 'flex';
  }

  sc.textContent = 'SCORE: ' + score;
  kl.textContent = 'KILLS: ' + kills;

  screen.classList.remove('hidden');

  // Pause the game while screen shows
  if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; }
}

function hideLevelComplete() {
  const screen = document.getElementById('level-complete-screen');
  if (screen) screen.classList.add('hidden');
}

function lcRetry() {
  hideLevelComplete();
  // Restart from the level the player just completed
  score = 0; kills = 0;
  player.hp = 100;
  player.angle = 0;
  gameState = 'playing';
  loadLevel(lcLevel);
}

function lcNext() {
  hideLevelComplete();
  if (lcLevel + 1 < LEVELS.length) {
    currentLevel = lcLevel + 1;
    gameState = 'playing';
    loadLevel(currentLevel);
  }
}

function lcMenu() {
  hideLevelComplete();
  goMainMenu();
}

function usePower(type) {
  if (gameState !== 'playing') return;

  if (type === 'health'){
    if (healthCharges <= 0) return;
    healthCharges--;
    player.hp = 100;
    killFeed.unshift({msg: '❤ HEALTH RESTORED!',timer: 60 });
    if (killFeed.length > 4) killFeed.pop();
    if (typeof playSound === 'function') playSound('key');
    updatePowerUI();
  }

  if (type === 'ammo') {
    if (ammoCharges <= 0)return;
    ammoCharges--;
    ammo = 35;
    killFeed.unshift({msg: '🔫 AMMO REFILLED!', timer: 60});
    if (killFeed.length > 4) killFeed.pop();
    if (typeof playSound === 'function') playSound('coin');
    updatePowerUI();
  }

  if (type === 'shield') {
    if (shieldCharges <= 0 || shieldActive) return;
    shieldCharges--;
    shieldActive = true;
    shieldTimer = 20 * 60;
    killFeed.unshift({msg: '🛡 SHIELD ACTIVE 20s!', timer: 60 }) ;
    if (killFeed.length > 4) killFeed.pop();
    if (typeof playSound === 'function') playSound('key');
    document.getElementById('shield-btn').classList.add('active');
    updatePowerUI();
  }
}

function updatePowerUI() {
  const hBtn = document.getElementById('health-btn');
  const aBtn = document.getElementById('ammo-btn') ;
  const sBtn = document.getElementById('shield-btn');
  const hCnt = document.getElementById('health-count');
  const aCnt = document.getElementById('ammo-count');
  const sCnt = document.getElementById('shield-count');

  if (!hBtn) return;

  hCnt.textContent = healthCharges;
  aCnt.textContent = ammoCharges;
  sCnt.textContent = shieldActive ? '⏱' : shieldCharges;

  hBtn.classList.toggle('empty',healthCharges <= 0);
  aBtn.classList.toggle('empty', ammoCharges <= 0);
  sBtn.classList.toggle('empty', shieldCharges <= 0 && !shieldActive);
}

// ── SHOOT ─────────────────────────────────────────────────────
function shoot() {
  if (ammo <= 0 || shootCooldown > 0 || gameState !== 'playing') return;
  ammo--;
  shootCooldown = 15;
  muzzleFlash   = 6;

  playSound('shoot');

  let sin = Math.sin(player.angle);
  let cos = Math.cos(player.angle);

  for (let d = 0.5; d < MAX_DEPTH; d += 0.1) {
    let bx = player.x + cos * d;
    let by = player.y + sin * d;
    if (isWall(bx, by)) break;

    // BOSS Hit check 
    if (currentLevel === LEVELS.length - 1 && boss.alive) {
      let dx = boss.x - bx , dy = boss.y - by;
      if (Math.sqrt(dx*dx + dy*dy) < 0.7){
        boss.hp--;
        boss.flashTimer = 8;

        // Blood Particles
        for (let p = 0; p < 8 ; p++){
          particles.push({
            x: boss.x, y: boss.y,
            vx: (Math.random() - 0.5) * 0.06,
            vy: (Math.random() - 0.5) * 0.06,
            life: 25, maxLife: 25,
            color: boss.hp / boss.maxHp < 0.5 ? '#ff6600' : '#cc0000',
          });
        }
        if (boss.hp <= 0){
          boss.alive = false ;
          playSound('enemyDie');
          kills++;
          score += 500;
          exitVisible = true;
          killFeed.unshift({msg: 'BOSS DEFEATED!  +500', timer:120});
          if (killFeed.length > 4) killFeed.pop();
          // Golden particles burst at exit location
          for (let p = 0; p< 20 ; p++){
            particles.push({
              x: LEVELS[currentLevel].exit.x,
              y: LEVELS[currentLevel].exit.y,
              vx: (Math.random() - 0.5) * 0.1,
              vy: (Math.random() - 0.5) * 0.1,
              life: 40, maxLife: 40,
              color: '#FFD700',
            });
          }
        }
        return ;
      }
    }
    // --NORMAL ENEMY HIT CHECK
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
          playSound('enemyDie');
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
  if (currentLevel !== LEVELS.length - 1 && exitVisible) {
    const exPos = LEVELS[currentLevel].exit;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(ox + exPos.x * ms, oy + exPos.y * ms, 3, 0, Math.PI*2);
    ctx.fill();
  }

  // Boss dot on minimap
  if (currentLevel === LEVELS.length - 1 && boss.alive) {
    ctx.fillStye = '#ff0000' ;
    ctx.beginPath();
    ctx.arc(ox , boss.x * ms, oy + boss.y * ms, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
  }

  // Player dot
  ctx.fillStyle = '#7c6fff';
  ctx.beginPath();
  ctx.arc(ox + player.x * ms, oy + player.y * ms, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

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
  ctx.closePath();
  
  // Exit gate dot on minimap 
  if (currentLevel === LEVELS.length - 1 && exitVisible){
    ctx.fillStyle = '#00FF88';
    ctx.beginPath();
    ctx.arc(ox + LEVELS[currentLevel].exit.x * ms, oy + LEVELS[currentLevel].exit.y * ms, 4, 0, Math.PI * 2);
    ctx.fill();
  }

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

  // Shield active overlay - blue tint around edges
  if (shieldActive) {
    let pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.005);
    let sg = ctx.createRadialGradient(W/2, H/2, H*0.4, W/2, H/2, H*0.95);
    sg.addColorStop(0, 'rgba(0,150,255,0)') ;
    sg.addColorStop(1, `rgba(0,150,255,${pulse})`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    // Shield timer bar at top
    let timeLeft = shieldTimer / (20 * 60);
    ctx.fillStyle = 'rgba(0,0,0,0.5)' ;
    ctx.fillRect(W/2 - 80 , 8, 160 , 10);
    ctx.fillStyle = '#00bfff';
    ctx.fillRect(W/2 - 80, 8, 160 * timeLeft , 10);
    ctx.strokeStyle = '#0080aa' ;
    ctx.lineWidth = 1;
    ctx.strokeRect(W/2 - 80 , 8, 160, 10);
    ctx.fillStyle = '#fff' ;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center' ;
    ctx.fillText('SHIELD', W/2, 24);
    ctx.textAlign = 'left';
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

  if (gameState === 'playing' && currentLevel !== LEVELS.length - 1) {
    const lv      = LEVELS[currentLevel];
    let keysLeft  = Math.max(0, lv.keysNeeded  - collectedKeys);
    let killsLeft = Math.max(0, lv.killsNeeded - kills);
    let keysOk    = collectedKeys >= lv.keysNeeded;
    let killsOk   = kills >= lv.killsNeeded;

    // Background pill — wider and centered properly
    let barW = 420;
    let barX = W/2 - barW/2;
    let barY = H - 92;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 38, 8);
    ctx.fill();

    ctx.font      = 'bold 14px monospace';
    ctx.textAlign = 'center';

    // Keys — left side
    if (keysOk) {
      ctx.fillStyle = '#2ecc71';
      ctx.fillText('KEYS  ' + collectedKeys + '/' + lv.keysNeeded + '  ✓', barX + barW * 0.28, barY + 25);
    } else {
      ctx.fillStyle = '#e8b84b';
      ctx.fillText('KEYS  ' + collectedKeys + '/' + lv.keysNeeded, barX + barW * 0.28, barY + 25);
    }

    // Divider line — center
    ctx.fillStyle = '#444';
    ctx.fillRect(W/2 - 1, barY + 6, 2, 26);

    // Kills — right side
    if (killsOk) {
      ctx.fillStyle = '#2ecc71';
      ctx.fillText('KILLS  ' + kills + '/' + lv.killsNeeded + '  ✓', barX + barW * 0.72, barY + 25);
    } else {
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('KILLS  ' + kills + '/' + lv.killsNeeded, barX + barW * 0.72, barY + 25);
    }

    ctx.textAlign = 'left';
  }

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
  if (waveTimer > 0 && currentLevel !== LEVELS.length - 1) {
    let alpha = Math.min(1, waveTimer / 40);
    ctx.fillStyle = `rgba(255,200,0,${alpha})`;
    ctx.font      = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL ' + (currentLevel + 1) + '  —  ' + lv.name, W / 2, H / 2 - 40);
    ctx.fillStyle = `rgba(200,200,200,${alpha})`;
    ctx.font      = 'bold 20px monospace';
    ctx.fillText( 'Find ' + lv.keysNeeded + ' keys   +   Kills ' + lv.killsNeeded + ' enemies', W/2 , H/2 + 10) ;
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

  // Boss enraged warning 
  if (currentLevel === LEVELS.length - 1 && boss.alive && boss.hp / boss.maxHp < 0.5){
    let pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
    ctx.fillStyle = `rgba(255,100,0,${pulse * 0.8})`;
    ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center' ;
    ctx.fillText('BOSS ENRAGED!',W/2,H - 60);
    ctx.textAlign = 'left';
  }

  // Exit open hint
  if (exitVisible && currentLevel !== LEVELS.length - 1){
    let pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.004);
    ctx.fillStyle = `rgba(0,255,136,${pulse})`;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center' ;
    ctx.fillText('EXIT GATE UNLOCKED — REACH IT!',W/2,H - 35);
    ctx.textAlign = 'left';
  }
  if (exitVisible && currentLevel === LEVELS.length - 1){
    let pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.004);
    ctx.fillStyle = `rgba(0,255,136,${pulse})`;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center' ;
    ctx.fillText('EXIT GATE OPEN —  REACH IT TO WIN!',W/2, H - 55);
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
}

function drawPauseScreen() {
  if (gameState !== 'paused') return ;

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0,0,W,H);

  // Panel Background 
  let pw = 400, ph = 320;
  let px = W/2 - pw / 2 , py = H/2 - ph/2;
  ctx.fillStyle = 'rgba(15,15,30,0.97)';
  ctx.beginPath();
  ctx.roundRect(px,py,pw,ph,16);
  ctx.fill();
  ctx.strokeStyle = '#7c6fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px,py,pw,ph,16);
  ctx.stroke();

  // Pause title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center' ;
  ctx.fillText('⏸ PAUSED', W/2, py + 55);

  // Level and score info
  ctx.fillStyle = '#555';
  ctx.font = '13px monospace';
  ctx.fillText(
    'Level ' + (currentLevel + 1) + '  —  ' + LEVELS[currentLevel].name,
    W/2 , py + 85 
  );
  ctx.fillStyle = '#444';
  ctx.fillText('Score: ' + score + '  Kills: ' + kills,W/2, py + 105);

  // Resume button 
  let rbx = W/2 - 90, rby = py + 125, rbw = 180 , rbh = 56 ;
  ctx.fillStyle = '#27ae60';
  ctx.beginPath();
  ctx.roundRect(rbx,rby,rbw,rbh,12);
  ctx.fill() ;
  ctx.strokeStyle = '#2ecc71' ;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rbx,rby,rbw,rbh,12);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('▶ RESUME',W/2, rby + 36);

  // RESTART button 
  let resbx = px + 30, resby = py + 210, resbw = 155, resbh = 52 ;
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.roundRect(resbx,resby,resbw,resbh,12);
  ctx.fill();
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(resbx,resby,resbw,resbh,12);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('↺  RESTART',resbx + resbw /2 , resby + 32);

  // MAIN MENU button
  let mmbx = px + pw - 185, mmby = py + 210, mmbw = 155 , mmbh = 52 ;
  ctx.fillStyle = '#2980b9';
  ctx.beginPath();
  ctx.roundRect(mmbx,mmby,mmbw,mmbh,12);
  ctx.fill();
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 2;
  ctx.beginPath() ;
  ctx.roundRect(mmbx,mmby,mmbw,mmbh,12);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace' ;
  ctx.fillText('⌂  MAIN MENU',mmbx + mmbw / 2, mmby + 32);

  ctx.textAlign = 'left';

  // Store button 
  window._pauseBtns = {
    resume: { x:rbx, y:rby, w:rbw, h:rbh },
    restart: { x:resbx, y:resby, w:resbw, h:resbh },
    mainmenu: { x:mmbx, y:mmby, w:mmbw, h:mmbh },
  };
}

function drawCountdown() {
  if (gameState !== 'countdown') return ;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0,0,W,H);

  let alpha = Math.min(1,countdownTimer / 20);
  let scale = 1 + (1 - countdownTimer / 60) * 0.5;

  ctx.save() ;
  ctx.translate(W/2,H/2);
  ctx.scale(scale,scale);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = 'bold 120px monospace' ;
  ctx.textAlign = 'center' ;
  ctx.textBaseline = 'middle' ;
  ctx.fillText(countdownValue, 0, 0);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '18px monospace' ;
  ctx.textAlign = 'center' ;
  ctx.textBaseline = 'alphabetic' ;
  ctx.fillText('Get Ready...', W/2, H/2 + 80 );
  ctx.textAlign = 'left';
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

  if (gameState === 'playing' && currentLevel !== LEVELS.length - 1){
    const lv = LEVELS[currentLevel];
    let keysOk = collectedKeys >= lv.keysNeeded;
    let killsOk = kills >= lv.killsNeeded;
    const msg = document.getElementById('msg');
    if (!msg) return; 
    if (!exitVisible) {
      if (!keysOk && !killsOk) {
        msg.textContent = 'Collect  ' + lv.keysNeeded + ' keys  +  Kill ' + lv.killsNeeded + ' enemies to open the gate!';
      } else if ( !keysOk) {
        msg.textContent = 'Need ' + (lv.keysNeeded - colllectedKeys) + ' more keys to open the gate!' ;
      } else if (!killsOk) {
        msg.textContent = 'Kills ' + (lv.killsNeeded - kills) +  ' more enemies to open the gate!';
      }
    } else {
      msg.textContent = 'Gate is open — reach the exit!' ;
    }
  }
}

canvas.addEventListener('mousedown', e => {
  if (e.button !== 0) return; 

  if (gameState === 'start') {
    gameStarted = true;
    initGame();
    return;
  }

  if (gameState === 'playing') {
    canvas.requestPointerLock();
    shoot();
    return;
  }

  if (gameState === 'paused') {
    document.exitPointerLock();
    if (!window._pauseBtns) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width ;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const btns = window._pauseBtns;

    if (mx > btns.resume.x && mx < btns.resume.x + btns.resume.w &&
        my > btns.resume.y && my < btns.resume.y + btns.resume.h) {
      startResume(); return;
    }
    if (mx > btns.restart.x && mx < btns.restart.x + btns.restart.w && 
        my >  btns.restart.y && my < btns.restart.y + btns.restart.h) {
      isPaused = false ;
      document.getElementById('pause-btn').textContent = '⏸';
      initGame(); return;
    }
    if (mx > btns.mainmenu.x && mx < btns.mainmenu.x + btns.mainmenu.w &&
        my > btns.mainmenu.y && my < btns.mainmenu.y + btns.mainmenu.h) {
      goMainMenu(); return;
    }
  }
});

canvas.addEventListener('mousemove', e => {
  if (gameState !== 'playing') return;
  player.angle += e.movementX * 0.002;
}); 

canvas.addEventListener('contextMenu', e => {
  e.preventDefault();
});

canvas.addEventListener('mousemove', e => {
  if (gameState !== 'playing') {
    if (gameState === 'paused' && window._pauseBtns) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX ;
      const my = (e.clientY - rect.top) * scaleY;
      const btns = window._pauseBtns;

      let hovering = 
        (mx > btns.resume.x && mx < btns.resume.x + btns.resume.w && 
         my > btns.resume.y && mx < btns.resume.y + btns.resume.h) ||
        (mx > btns.restart.x && mx < btns.restart.x + btns.restart.w &&
         my > btns.restart.y && my < btns.restart.y + btns.restart.h) ||
        (mx > btns.mainmenu.x && mx < btns.mainmenu.x + btns.mainmenu.w &&
         my > btns.mainmenu.y && my < btns.mainmenu.y + btns.mainmenu.h);
      
      canvas.style.cursor = hovering ? 'pointer' : 'default';
    } else {
      canvas.style.cursor = 'default';
    }
    return;
  }
  // During gameplay - turn player with mouse
  player.angle += e.movementX * 0.002;
  canvas.style.cursor = 'crosshair';
})


// ── MAIN LOOP ─────────────────────────────────────────────────
function loop() {
  // Hide pause button on start screen 
  const pauseBtn = document.getElementById('pause-btn') ;
  if (pauseBtn) {
    if (gameState === 'start') {
      pauseBtn.classList.add('hidden');
    } else {
      pauseBtn.classList.remove('hidden');
    }
  }
  const pw = document.getElementById('powerups') ;
  if (pw) {
    if (gameState === 'start' || gameState === 'dead' || gameState === 'win') {
      pw.classList.add('hidden');
    } else {
      pw.classList.remove('hidden');
    }
  }
  
  handleInput();
  if (gameState === 'playing') {
    updateEnemies();
    collectItems();
    updateWeather();

    // Update shield timer
    if (shieldActive) {
      shieldTimer--;
      if (shieldTimer <= 0) {
        shieldActive = false;
        const sBtn = document.getElementById('shield-btn');
        if (sBtn) sBtn.classList.remove('active');
        killFeed.unshift({ msg: '🛡 SHIELD EXPIRED', timer: 60 });
        updatePowerUI();
      }
    }
    if (currentLevel === LEVELS.length - 1){
      updateBoss();
      checkExit();
      if (introTimer > 0) introTimer--;
    }
  }

  // Countdown logic
  if (gameState === 'countdown') {
    countdownTimer--;
    if(countdownTimer <= 0){
      countdownValue--;
      if (countdownValue <= 0) {
        resumeGame();
      } else {
        countdownTimer = 60;
      }
    }
  }
  drawScene();
  drawWeather();
  drawSprites();
  drawEnemies();
  drawExit();
  if (currentLevel === LEVELS.length - 1){
    drawBoss();
    drawBossHPBar();
  }
  drawParticles();
  drawGun();
  drawHUD();
  drawWeatherHUD();
  drawPauseScreen();
  drawCountdown();
  if (gameState !== 'start') drawMinimap();
  updateHUD();
  // Animate home player
  if (gameState === 'start') {
    drawHomePlayer();
    updateHomeCoin();
  }
  requestAnimationFrame(loop);
}

// ── START ─────────────────────────────────────────────────────
loop();