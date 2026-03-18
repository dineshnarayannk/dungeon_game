const canvas = document.getElementById('gamecanvas');
const ctx    = canvas.getContext('2d');

// Set canvas to full window size
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight - 90;

const W    = canvas.width;
const H    = canvas.height;
const HALF = H / 2;

const FOV       = Math.PI / 3;
const RAYS      = 160;
const STEP      = FOV / RAYS;
const MAX_DEPTH = 16;

function castRay(angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);
  let dist = 0, hit = false, wt = 0;

  for (let d = 0; d < MAX_DEPTH; d += 0.05) {
    let rx = player.x + cos * d;
    let ry = player.y + sin * d;
    if (isWall(rx, ry)) {
      dist = d;
      hit  = true;
      wt   = (Math.floor(rx) + Math.floor(ry)) % 2;
      break;
    }
  }
  return { dist: hit ? dist : MAX_DEPTH, wt };
}

function drawScene() {
  const lv = LEVELS[currentLevel];

  ctx.fillStyle = lv.skyColor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = lv.floorColor;
  ctx.fillRect(0, HALF, W, HALF);

  const sliceW = W / RAYS;

  for (let i = 0; i < RAYS; i++) {
    let angle  = player.angle - FOV / 2 + i * STEP;
    let { dist, wt } = castRay(angle);
    let corr   = dist * Math.cos(angle - player.angle);
    let wallH  = Math.min(H, H / corr);
    let bright = Math.max(0, 1 - corr / MAX_DEPTH);
    let base   = wt === 0 ? lv.color : lv.color2;
    let r = Math.floor(base[0] * bright);
    let g = Math.floor(base[1] * bright);
    let b = Math.floor(base[2] * bright);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(i * sliceW, HALF - wallH / 2, sliceW + 1, wallH);
  }
}