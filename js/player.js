let player = {
  x:         1.5,
  y:         1.5,
  angle:     0,
  hp:        100,
  speed:     0.05,
  turnSpeed: 0.03,
};

const keysDown = {};

document.addEventListener('keydown', e => {
  keysDown[e.key] = true;
  if (e.key === 'r' || e.key === 'R') initGame();
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'start') {
      gameStarted = true;
      initGame();
      // loop();  
    } else if (gameState === 'playing') {
      shoot();
    } else if (gameState === 'paused') {
      startResume();
    }
  }
  if (e.key === 'Escape') {
    togglePause();
    document.exitPointerLock();
  }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))
    e.preventDefault();
});

document.addEventListener('keyup', e => {
  keysDown[e.key] = false;
});

function handleInput() {
  if (gameState !== 'playing') return;

  if (keysDown['ArrowLeft']  || keysDown['a'] || keysDown['A'])
    player.angle -= player.turnSpeed;
  if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D'])
    player.angle += player.turnSpeed;

  if (keysDown['w'] || keysDown['W'] || keysDown['ArrowUp']) {
    let nx = player.x + Math.cos(player.angle) * player.speed;
    let ny = player.y + Math.sin(player.angle) * player.speed;
    if (!isWall(nx, player.y)) player.x = nx;
    if (!isWall(player.x, ny)) player.y = ny;
  }
  if (keysDown['s'] || keysDown['S'] || keysDown['ArrowDown']) {
    let nx = player.x - Math.cos(player.angle) * player.speed;
    let ny = player.y - Math.sin(player.angle) * player.speed;
    if (!isWall(nx, player.y)) player.x = nx;
    if (!isWall(player.x, ny)) player.y = ny;
  }

  if (shootCooldown > 0) shootCooldown--;
}