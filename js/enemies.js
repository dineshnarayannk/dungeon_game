let enemies = [];

function spawnOneEnemy(lv) {
  let ex, ey, attempts = 0;
  do {
    ex = 1 + Math.floor(Math.random() * 14);
    ey = 1 + Math.floor(Math.random() * 14);
    attempts++;
  } while (
    (isWall(ex + 0.5, ey + 0.5) ||
     isWall(ex + 0.3, ey + 0.3) ||
     isWall(ex + 0.7, ey + 0.7) ||
     Math.sqrt((ex - player.x) ** 2 + (ey - player.y) ** 2) < 4)
    && attempts < 50
  );

  const lv2 = lv || LEVELS[currentLevel];
  enemies.push({
    x:          ex + 0.5,
    y:          ey + 0.5,
    hp:         lv2.enemyHp,
    maxHp:      lv2.enemyHp,
    speed:      lv2.enemySpeed,
    alive:      true,
    flashTimer: 0,
  });
}

function spawnWave(count, lv) {
  for (let i = 0; i < count; i++) spawnOneEnemy(lv);
}

// Keep initEnemies for backward compat
function initEnemies() {
  enemies = [];
  spawnWave(LEVELS[currentLevel].spawnCount, LEVELS[currentLevel]);
}

function drawEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;
    let proj = worldToScreen(e.x, e.y);
    if (!proj) return;
    let { sx, size, dist, column } = proj;
    if (dist > MAX_DEPTH) return;
    
    // Only draw if enemy is in front of wall
    if (column >= 0 && column < RAYS && dist >= zBuffer[column]) return ;

    let bright   = Math.max(0.2, 1 - dist / MAX_DEPTH);
    let flashing = e.flashTimer > 0;

    // Body
    ctx.globalAlpha = bright;
    ctx.fillStyle   = flashing ? '#ff9999' : '#c0392b';
    ctx.fillRect(sx - size * 0.22, HALF - size * 0.45, size * 0.44, size * 0.65);

    // Head
    ctx.fillStyle = flashing ? '#ffcccc' : '#e74c3c';
    ctx.beginPath();
    ctx.arc(sx, HALF - size * 0.5, size * 0.24, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(sx - size * 0.09, HALF - size * 0.56, size * 0.07, size * 0.14);
    ctx.fillRect(sx + size * 0.02, HALF - size * 0.56, size * 0.07, size * 0.14);

    // HP bar — always full opacity
    ctx.globalAlpha = 1;
    let bw = Math.max(20, size * 0.55);
    let bh = 5;
    let bx = sx - bw / 2;
    let by = HALF - size * 0.82;
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.fillStyle = '#333333';
    ctx.fillRect(bx, by, bw, bh);
    let hpRatio   = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(bx, by, bw * hpRatio, bh);

    ctx.globalAlpha = 1;
    if (e.flashTimer > 0) e.flashTimer--;
  });
}

function updateEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;

    let dx   = player.x - e.x;
    let dy   = player.y - e.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      const R  = 0.35;
      let nx   = e.x + (dx / dist) * e.speed;
      let ny   = e.y + (dy / dist) * e.speed;
      let canX = !isWall(nx + R, e.y) && !isWall(nx - R, e.y) &&
                 !isWall(nx + R, e.y + R) && !isWall(nx - R, e.y + R);
      let canY = !isWall(e.x, ny + R) && !isWall(e.x, ny - R) &&
                 !isWall(e.x + R, ny + R) && !isWall(e.x - R, ny + R);
      if (canX) e.x = nx;
      if (canY) e.y = ny;
    }

    // Damage on contact
    if (dist < 0.5) {
      player.hp = Math.max(0, player.hp - 0.4);
      triggerDamageFlash();
    }

    if (player.hp <= 0 && gameState !== 'dead') {
      gameState = 'dead';
      playSound('playerDie');
    }

    // Unstuck — push out of walls
    const R = 0.35;
    if (isWall(e.x, e.y) || isWall(e.x + R, e.y) || isWall(e.x - R, e.y) ||
        isWall(e.x, e.y + R) || isWall(e.x, e.y - R)) {
      const nudges = [
        [0.1,0],[-0.1,0],[0,0.1],[0,-0.1],
        [0.1,0.1],[-0.1,0.1],[0.1,-0.1],[-0.1,-0.1]
      ];
      for (let [ox, oy] of nudges) {
        let tx = e.x + ox, ty = e.y + oy;
        if (!isWall(tx, ty) && !isWall(tx + R, ty) && !isWall(tx - R, ty) &&
            !isWall(tx, ty + R) && !isWall(tx, ty - R)) {
          e.x = tx; e.y = ty; break;
        }
      }
    }
  });
}

let boss = {
  x: 8,
  y: 8,
  hp: 30,
  maxHp: 30,
  speed: 0.012,
  alive: false,
  flashTimer: 0,
};

let exitVisible = false;
let screenShake = 0;
let introTimer = 0;

function initBoss() {
  boss = {
    x: 8,
    y: 8,
    hp: 30,
    maxHp: 30,
    speed: 0.012,
    alive: true,
    flashTimer: 0,
  };
  exitVisible = false;
  screenShake = 0;
  introTimer = 150;
}

function updateBoss() {
  if (!boss.alive || introTimer > 0) return;
  let dx = player.x - boss.x;
  let dy = player.y - boss.y;
  let dist = Math.sqrt(dx*dx + dy*dy);
  // Phase 2 - below 50% HP boss speeds up
  let spd = boss.hp / boss.maxHp < 0.5 ? 0.022 : boss.speed;
  if (dist > 0.5) {
    let nx = boss.x + (dx / dist) * spd;
    let ny = boss.y + (dy / dist) * spd;
    if (!isWall(nx,boss.y)) boss.x = nx ;
    if (!isWall(boss.x, ny)) boss.y = ny;
  }
  //Damage player on contact - harder than normal enemies
  if (dist < 0.8){
    player.hp = Math.max(0, player.hp - 1.5);
    damageFlashTimer = 18;
    screenShake = 8;
  }
  if (player.hp <= 0 && gameState !== 'dead' ) {
    gameState = 'dead';
    playSound('playerDie');
  }
  if (boss.flashTimer > 0) boss.flashTimer--;
}

function drawBoss() {
  if (!boss.alive) return;
  let proj = worldToScreen(boss.x , boss.y);
  if (!proj) return ;
  let { sx, size } = proj;

  // Calculate dist manually for zBuffer check
  let dx = boss.x - player.x ;
  let dy = boss.y - player.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  let column = Math.floor(((W/2 + (Math.atan2(dy,dx) - player.angle) * (W/FOV)) / W ) * RAYS);

  if (dist > MAX_DEPTH) return ;
  if (column >= 0 && column < RAYS && dist >= zBuffer[column]) return;

  let br = Math.max(0.3, 1 - dist / MAX_DEPTH);
  let f1 = boss.flashTimer > 0;
  let phase2 = boss.hp / boss.maxHp < 0.5;

  ctx.globalAlpha = br;

  // Glow Aura 
  ctx.fillStyle = phase2 ? 'rgba(255,100,0,0.15)' : 'rgba(200,0,0,0.1)';
  ctx.beginPath(); ctx.arc(sx, HALF, size * 0.75, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = f1 ? '#ffaaaa' : phase2 ? '#cc4400' : '#8B0000' ;
  ctx.fillRect(sx - size * 0.45, HALF - size*0.55, size*0.9, size*0.75);
  // Head 
  ctx.fillStyle = f1 ? '#ffcccc' : phase2 ? '#ff6600' : '#cc0000' ;
  ctx.beginPath(); ctx.arc(sx , HALF - size*0.55, size*0.38, 0, Math.PI*2); ctx.fill();
  // Eyes
  ctx.fillStyle = f1 ? '#fff' : phase2 ? '#ffff00' : '#ff4444' ;
  ctx.beginPath(); ctx.arc(sx - size*0.12, HALF - size*0.58, size*0.09, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + size*0.12, HALF - size*0.58, size*0.09 , 0, Math.PI*2); ctx.fill();
  // Horns 
  ctx.fillStyle = '#880000';
  ctx.fillRect(sx - size*0.18, HALF - size*0.75, size*0.10, size*0.22);
  ctx.fillRect(sx + size*0.08, HALF - size*0.75, size*0.10, size*0.22);
  ctx.fillRect(sx - size*0.32, HALF - size*0.65,  size*0.08, size*0.16);
  ctx.fillRect(sx + size*0.24, HALF - size*0.65, size*0.08, size*0.16);
  // Arms 
  ctx.fillStyle = phase2 ? '#cc4400' : '#8B0000';
  ctx.fillRect(sx - size*0.7, HALF - size*0.3, size*0.28, size*0.18);
  ctx.fillRect(sx + size*0.42, HALF - size*0.3, size*0.28, size*0.18);

  ctx.globalAlpha  = 1;
}

function drawBossHPBar() {
  if (!boss.alive) return ;
  let ratio = Math.max(0, boss.hp / boss.maxHp) ;
  let phase2 = ratio < 0.5 ;
  let bw = W * 0.5 , bh = 18;
  let bx = W / 2 - bw / 2 , by = 16;
  
  // Label 
  ctx.fillStyle = phase2 ? '#ff6600' : '#cc0000';
  ctx.font  = 'bold 13px monospace';
  ctx.fontAlign = 'center';
  ctx.fillText(phase2 ? 'FINAL BOSS  ⚠  ENRAGED' : 'FINAL BOSS', W/2 , by - 3);
  ctx.textAlign = 'left';
  // BAckground 
  ctx.fillStyle = '#1a0000'; ctx.fillRect(bx - 2, by, bw + 4, bh + 4);
  ctx.fillStyle = '#330000'; ctx.fillRect(bx, by + 2, bw, bh);
  // HP fill
  let grad = ctx.createLinearGradient(bx, 0, bx + bw , 0);
  if (phase2) { grad.addColorStop(0,'#ff2200'); grad.addColorStop(1,'#ff8800'); }
  else  { grad.addColorStop(0,'#8B0000'); grad.addColorStop(1,'#cc0000'); }
  ctx.fillStyle = grad;
  ctx.fillRect(bx, by + 2, bw * ratio, bh);
  // Pulse when critical
  if (ratio < 0.25) {
    let pulse = 0.3 + 0.3 * Math.sin(Date.now()*0.01);
    ctx.fillStyle = `rgba(255,0,0,${pulse})`;
    ctx.fillRect(bx , by + 2, bw * ratio , bh);
  }
  // Border
  ctx.stroketyle = '#660000'; ctx.lineWidth = 2;
  ctx.strokeRect(bx, by + 2, bw, bh);
}

function drawExit() {
  if (!exitVisible) return;

  const exPos = LEVELS[currentLevel].exit;
  let dx = exPos.x - player.x ;
  let dy = exPos.y - player.y;
  let exDist = Math.sqrt(dx * dx + dy * dy);

  let proj = worldToScreen(exPos.x , exPos.y);
  if (!proj) return ;

  let { sx , size , dist , column } = proj ;
  if (exDist > MAX_DEPTH) return;

  // zBuffer check - dont show through walls
  if (column >= 0 && column < RAYS && exDist >= zBuffer[column]) return ;
  
  let pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
  ctx.globalAlpha = Math.max(0.4,1 - exDist/ MAX_DEPTH) * pulse;

  // Gate frame -- golden 
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(sx - size*0.25, HALF - size*0.6,size*0.5,size*0.65);

  // Gate inner - green
  ctx.fillStyle = '#00FF88';
  ctx.fillRect(sx - size*0.18, HALF - size*0.52, size*0.36,size*0.5);

  // Glow 
  ctx.fillStyle = `rgba(255,215,0,${0.15 * pulse})` ;
  ctx.beginPath();
  ctx.arc(sx , HALF - size*0.3, size*0.6, 0, Math.PI*2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function checkExit() {
  if (!exitVisible) return;
  const ex = LEVELS[currentLevel].exit;
  if (Math.sqrt((ex.x - player.x)**2 + (ex.y - player.y)**2 ) < 1.0 ){
    gameState = 'win';
    playSound('win');
  }
}