let player = {
  x: 1.5,
  y: 1.5,
  angle: 0,
  hp: 100,
  speed: 0.03,
  turnSpeed: 0.015,
};

const keysDown = {};

document.addEventListener('keydown', e=> {
  keysDown[e.key] = true;
  if (e.key === 'r' || e.key === 'R') initGame();
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'start') {
      startGameFromHome();
    } else if (gameState === 'playing') {
      shoot();
    } else if (gameState === 'paused') {
      startResume();
    }
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    togglePause();
  }
  if (['ArrowUp', 'ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))
    e.preventDefault();
});

document.addEventListener('keyup', e => {
  keysDown[e.key] = false;
});

function handleInput() {
  if (gameState !== 'playing') return;

  // Sprint - hold shift for fast movement 
  let isSprinting = keysDown['Shift'];
  let moveSpeed = isSprinting ? player.speed * 2.2 : player.speed;

  if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A'])
    player.angle -= player.turnSpeed;
  if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D'])
    player.angle += player.turnSpeed;

  if (keysDown['w'] || keysDown['W'] || keysDown['ArrowUp']) {
    let nx = player.x + Math.cos(player.angle) * moveSpeed;
    let ny = player.y + Math.sin(player.angle) * moveSpeed;
    if (!isWall(nx, player.y)) player.x = nx;
    if (!isWall(player.x, ny)) player.y = ny;
  }
  if (keysDown['s'] || keysDown['S'] || keysDown['ArrowDown']) {
    let nx = player.x - Math.cos(player.angle) * moveSpeed;
    let ny = player.y - Math.sin(player.angle) * moveSpeed;
    if (!isWall(nx, player.y)) player.x = nx;
    if (!isWall(player.x, ny)) player.y = ny;
  }

  if (shootCooldown > 0) shootCooldown--;
}