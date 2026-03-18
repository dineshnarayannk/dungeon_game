let coins      = [];
let keys_items = [];
let collectedKeys = 0;
let score      = 0;
let flashTimer = 0;
let flashMsg   = '';

function initSprites() {
  // Load keys from current level definition
  keys_items = LEVELS[currentLevel].keys.map(k => ({
    x:     k.x,
    y:     k.y,
    color: k.color,
    alive: true,
  }));

  // Coins scattered around the dungeon
  coins = [
    { x:3.5,  y:2.5,  alive:true },
    { x:7.5,  y:1.5,  alive:true },
    { x:2.5,  y:7.5,  alive:true },
    { x:10.5, y:5.5,  alive:true },
    { x:5.5,  y:11.5, alive:true },
    { x:13.5, y:9.5,  alive:true },
    { x:8.5,  y:13.5, alive:true },
    { x:1.5,  y:12.5, alive:true },
  ];

  collectedKeys = 0;
  flashTimer    = 0;
  flashMsg      = '';
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
  return { sx, size, dist };
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
    let { sx, size, dist } = proj;
    if (dist > MAX_DEPTH) return;
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
    }
  });

  // Check exit
  const lv = LEVELS[currentLevel];
  const ex = lv.exit;
  if (
    collectedKeys >= lv.keysNeeded &&
    Math.sqrt((ex.x - player.x) ** 2 + (ex.y - player.y) ** 2) < 0.8
  ) {
    if (currentLevel < LEVELS.length - 1) {
      gameState       = 'levelcomplete';
      levelTransTimer = 180;
      levelTransMsg   = 'LEVEL ' + (currentLevel + 1) + ' COMPLETE!';
    } else {
      gameState = 'win';
    }
  }
}