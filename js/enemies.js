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
    let { sx, size, dist } = proj;
    if (dist > MAX_DEPTH) return;

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

    if (player.hp <= 0) gameState = 'dead';

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