let coins      = [];
let keys_items = [];
let collectedKeys = 0;
let score      = 0;
let flashTimer = 0;
let flashMsg   = '';

function initSprites() {

  // Collect all valid open floor tiles
  let openTiles = [];
  for (let row = 1; row < ROWS - 1; row++) {
    for (let col = 1; col < COLS - 1; col++) {
      if (MAP[row][col] === 0) {
        openTiles.push({ x: col + 0.5, y: row + 0.5 });
      }
    }
  }

  // Track used positions to avoid overlap
  let usedPositions = [];

  // Pick a random valid tile
  function pickRandom(minDistFromStart, minDistFromOthers) {
    let attempts = 0;
    while (attempts < 200) {
      attempts++;
      let idx  = Math.floor(Math.random() * openTiles.length);
      let tile = openTiles[idx];
      if (!tile) continue;

      // Far enough from player start
      let distFromStart = Math.sqrt(
        (tile.x - player.x) ** 2 + (tile.y - player.y) ** 2
      );
      if (distFromStart < minDistFromStart) continue;

      // Far enough from exit
      const ex = LEVELS[currentLevel].exit;
      let distFromExit = Math.sqrt(
        (tile.x - ex.x) ** 2 + (tile.y - ex.y) ** 2
      );
      if (distFromExit < 2) continue;

      // Far enough from already placed items
      let tooClose = false;
      for (let pos of usedPositions) {
        if (Math.sqrt((tile.x - pos.x) ** 2 + (tile.y - pos.y) ** 2) < minDistFromOthers) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      usedPositions.push({ x: tile.x, y: tile.y });
      return { x: tile.x, y: tile.y };
    }

    // Fallback — return any open tile
    let fallback = openTiles[Math.floor(Math.random() * openTiles.length)];
    if (fallback) usedPositions.push({ x: fallback.x, y: fallback.y });
    return fallback || { x: 2.5, y: 2.5 };
  }

  // Key colours
  const keyColors = ['#FFD700', '#00BFFF', '#FF69B4', '#FF4500', '#00FF88'];

  // Place keys randomly
  const lv = LEVELS[currentLevel];
  keys_items = [];
  for (let i = 0; i < lv.keysNeeded; i++) {
    let pos = pickRandom(4, 3);
    keys_items.push({
      x:     pos.x,
      y:     pos.y,
      color: keyColors[i % keyColors.length],
      alive: true,
    });
  }

  // Place coins randomly
  const coinCounts = [6, 6, 7, 7, 8, 0];
  let coinCount    = coinCounts[currentLevel] || 0;
  coins = [];
  for (let i = 0; i < coinCount; i++) {
    let pos = pickRandom(2, 2);
    coins.push({
      x:     pos.x,
      y:     pos.y,
      alive: true,
    });
  }

  collectedKeys = 0;
  flashTimer    = 0;
  flashMsg      = '';
  exitVisible   = false;
}


function worldToScreen(wx, wy) {
  let dx   = wx - player.x;
  let dy   = wy - player.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  let angleToSprite = Math.atan2(dy, dx);
  let relAngle = angleToSprite - player.angle;
  while (relAngle >  Math.PI) relAngle -= Math.PI * 2;
  while (relAngle < -Math.PI) relAngle += Math.PI * 2;
  if (Math.abs(relAngle) > FOV * 0.75) return null;
  let sx   = W / 2 + relAngle * (W / FOV);
  let size = Math.min(200, Math.max(30, H / dist));
  let column = Math.floor((sx/W) * RAYS) ;
  return { sx, size, dist, column };
}

function drawSprites() {
  let all = [];
  coins.forEach(c      => { if (c.alive) all.push({ ...c, type:'coin' }); });
  keys_items.forEach(k => { if (k.alive) all.push({ ...k, type:'key'  }); });

  // Sort far to near
  all.sort((a, b) => {
    let da = (a.x - player.x) ** 2 + (a.y - player.y) ** 2;
    let db = (b.x - player.x) ** 2 + (b.y - player.y) ** 2;
    return db - da;
  });

  all.forEach(s => {  
    let proj = worldToScreen(s.x, s.y);
    if (!proj) return;
    let { sx, size, dist, column } = proj;
    if (dist > MAX_DEPTH) return;

    // Check zBuffer - only draw if sprite is in front of wall
    if (column >= 0 && column < RAYS && dist >= zBuffer[column]) return ;

    let bright = Math.max(0.3, 1 - dist / MAX_DEPTH);
    ctx.globalAlpha = bright;

    if (s.type === 'coin') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sx, HALF, Math.max(12, size * 0.28), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE55C';
      ctx.beginPath();
      ctx.arc(sx - size * 0.06, HALF - size * 0.06, Math.max(5, size * 0.1), 0, Math.PI * 2);
      ctx.fill();
    } else if (s.type === 'key') {
      ctx.fillStyle = s.color;
      ctx.fillRect(
        sx - Math.max(4, size * 0.06),
        HALF - size * 0.3,
        Math.max(8, size * 0.12),
        Math.max(20, size * 0.5)
      );
      ctx.beginPath();
      ctx.arc(sx, HALF - size * 0.3, Math.max(8, size * 0.15), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
}

function collectItems() {
  coins.forEach(c => {
    if (!c.alive) return;
    let d = Math.sqrt((c.x - player.x) ** 2 + (c.y - player.y) ** 2);
    if (d < 0.6) {
      c.alive  = false;
      score   += 10;
      flashMsg = '+10 COIN!';
      flashTimer = 40;
      playSound('coin');
    }
  });

  keys_items.forEach(k => {
    if (!k.alive) return;
    let d = Math.sqrt((k.x - player.x) ** 2 + (k.y - player.y) ** 2);
    if (d < 0.6) {
      k.alive = false;
      collectedKeys++;
      score  += 200;
      flashMsg   = 'KEY ' + collectedKeys + '/' + LEVELS[currentLevel].keysNeeded + ' COLLECTED!';
      flashTimer = 50;
      playSound('key');
    }
  });

  // Check exit
  const lv = LEVELS[currentLevel];
  const ex = lv.exit;

  // Show exit gate only after all keys collected
  if (currentLevel !== LEVELS.length - 1 && collectedKeys >= lv.keysNeeded && kills >= lv.killsNeeded && !exitVisible) {
    exitVisible = true ;
    killFeed.unshift({msg: 'EXIT GATE UNLOCKED!', timer: 90});
  }

  // Check if player reached exit
  if (exitVisible && Math.sqrt((ex.x - player.x)**2 + (ex.y - player.y)**2) < 0.8) {
    if (currentLevel < LEVELS.length - 2){
      gameState = 'levelcomplete';
      levelTransTimer = 180;
      levelTransMsg = 'LEVEL ' + (currentLevel + 1) + ' COMPLETE!';
    } else if (currentLevel === LEVELS.length - 2){
      gameState = 'levelcomplete';
      levelTransTimer = 180;
      levelTransMsg = 'LEVEL 5 COMPLETE! FINAL BOSS AWAITS...';
    }
  }
}
