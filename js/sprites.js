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
      let cs = Math.max(0.3 , size * 0.010);
      ctx.save();
      ctx.translate(sx, HALF);
      ctx.scale(cs, cs);

      // Coin shadow
      ctx.beginPath();
      ctx.ellipse(4, 4, 28, 28, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();

      // Coin outer edge - darker gold rim
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fillStyle  = '#B8860B';
      ctx.fill();

      // Coin main face - bright gold
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      let coinGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, 24);
      coinGrad.addColorStop(0, '#FFE566');
      coinGrad.addColorStop(0.4, '#FFD700');
      coinGrad.addColorStop(1, '#B8860B');
      ctx.fillStyle = coinGrad;
      ctx.fill();

      // Dollar Sign - top curve (S top)
      ctx.beginPath();
      ctx.arc(3, -8, 8, Math.PI * 1.1 , Math.PI * 0.1, true);
      ctx.strokeStyle = '#8B6914';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Dollar sign - bottom curve ( S bottom)
      ctx.beginPath();
      ctx.arc(-3, 8, 8, Math.PI * 0.1, Math.PI * 1.1, false);
      ctx.strokeStyle = '#8B6914';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Shine highlights top left
      ctx.beginPath();
      ctx.ellipse(-10, -12, 7, 4, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,220,0.55)';
      ctx.fill();

      // Small stars around coin edges
      let starAngles = [0, 60, 120, 180, 240, 300] ;
      starAngles.forEach(ang => {
        let rad = ang * Math.PI / 180;
        let sx2 = Math.cos(rad) * 19;
        let sy2 = Math.sin(rad) * 19;
        ctx.beginPath();
        ctx.arc(sx2, sy2, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#8B6914';
        ctx.fill();
      });

      ctx.restore();
    } else if (s.type === 'key') {
      let ks = Math.max(0.4, size * 0.012);
      let kx = sx;
      let ky = HALF;

      ctx.save();
      ctx.translate(kx,ky);
      ctx.scale(ks,ks);

      // Key Shaft
      ctx.fillStyle = s.color;
      ctx.fillRect(-4, -30, 8, 55);

      // Shaft hightlight
      ctx.fillStyle = 'rgba(255,255,200,0.4)';
      ctx.fillRect(-2, -28, 3, 50);

      // Key teeth at bottom
      ctx.fillStyle = s.color ;
      ctx.fillRect(4, 14, 8, 6);
      ctx.fillRect(4, 24, 6, 5);

      // Key ring top - outer circle
      ctx.beginPath();
      ctx.arc(0, -32, 18, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();

      // Key ring inner hole
      ctx.beginPath();
      ctx.arc(0, -32, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();

      // Ring detail - cross inside
      ctx.fillStyle = s.color;
      ctx.fillRect(-2, -40, 4, 16);
      ctx.fillRect(-8, -34, 16, 4);

      // Wing right
      ctx.beginPath();
      ctx.ellipse(22, -32, 10, 6, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();

      // Gold shine on ring
      ctx.beginPath();
      ctx.arc(-5, -38, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,200,0.5)';
      ctx.fill();

      // Collar band at top of shaft
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(-5, -16, 10, 5);
      ctx.fillRect(-5, -10, 10, 3);

      ctx.restore();
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

  // Show exit gate only after all keys and kills met
  if (currentLevel !== LEVELS.length - 1 && collectedKeys >= lv.keysNeeded && kills >= lv.killsNeeded && !exitVisible) {
    exitVisible = true;
    killFeed.unshift({msg: 'EXIT GATE UNLOCKED!', timer: 90 });
  }

  // Check if player reached exit 
  if (exitVisible && Math.sqrt((ex.x - player.x)**2 + (ex.y - player.y)**2) < 0.8) {
    if (currentLevel < LEVELS.length - 1) {
      gameState = 'levelcoplete';
      // Show the level complete screen
      setTimeout(() => showLevelComplete(currentLevel), 100);
    }
  }
}
