const canvas = document.getElementById('gamecanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 60;
let gameState = 'playing';

// Initialise / restart everything
function initGame() {
    player.x = 1.5; player.y = 1.5;
    player.angle = 0; player.hp = 100 ;
    gameState = 'playing';
    initSprites();
    initEnemies();
    document.getElementById('msg').textContent = 'Collect 3 keys the reach the exit!' ;
}

// Draw the minimap in the top-right corner 
function drawMinimap() {
    const mw = 80, mh = 80;
    const ms = mw / COLS ;
    const ox = W - mw - 8, oy = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(ox,oy,mw,mh);
    for(let y = 0 ; y < ROWS ; y++){
        for(let x = 0; x < COLS; x++){
            if(MAP[y][x] === 1){
                ctx.fillStyle = '#3a3460';
                ctx.fillRect(ox + x*ms, oy + y*ms, ms, ms );
            }
        }
    }
    // Player dot
    ctx.fillStyle = '#7c6fff';
    ctx.beginPath();
    ctx.arc(ox + player.x*ms, oy + player.y*ms, 3, 0, Math.PI*2);
    ctx.fill();
    // Direction line
    ctx.strokeStyle = '#7c6fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox + player.x*ms, oy + player.y*ms);
    ctx.lineTo(
        ox + (player.x + Math.cos(player.angle)*1.5)*ms,
        oy + (player.y + Math.sin(player.angle)*1.5)*ms
    );
    ctx.stroke();
}
// Draw HUD overlay: Health bar, key icons, flash messages
function drawHUD() {

  // 1. Sharp red flash when hit by enemy
  if (damageFlashTimer > 0) {
    ctx.fillStyle = `rgba(200,0,0,${damageFlashTimer / 12 * 0.25})`;
    ctx.fillRect(0, 0, W, H);
    damageFlashTimer--;
  }

  // 2. Pulsing red overlay when HP below 50
  if (player.hp < 50) {
    let intensity = (50 - player.hp) / 50 * 0.18;
    let pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    ctx.fillStyle = `rgba(180,0,0,${intensity * pulse})`;
    ctx.fillRect(0, 0, W, H);
  }

  // 3. Red vignette border — only around edges, center stays clear
  if (player.hp < 75) {
    let edgeIntensity = (75 - player.hp) / 75 * 0.45;
    let gradient = ctx.createRadialGradient(
      W / 2, H / 2, H * 0.45,
      W / 2, H / 2, H * 0.95
    );
    gradient.addColorStop(0, 'rgba(180,0,0,0)');
    gradient.addColorStop(1, `rgba(180,0,0,${edgeIntensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  // Health bar
  let hpPct = player.hp / 100;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(10, H - 20, 100, 8);
  ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(10, H - 20, hpPct * 100, 8);

  // Key icons at bottom left
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < collectedKeys ? '#FFD700' : '#333';
    ctx.fillRect(10 + i * 18, H - 35, 12, 10);
    ctx.beginPath();
    ctx.arc(10 + i * 18 + 6, H - 36, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flash message
  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flashTimer / 40 * 0.9})`;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(flashMsg, W / 2, HALF - 30);
    flashTimer--;
  }

  // Win screen
  if (gameState === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU ESCAPED!', W / 2, H / 2 - 20);
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Score: ' + score + '  |  Press R to play again', W / 2, H / 2 + 20);
  }

  // Death screen
  if (gameState === 'dead') {
    ctx.fillStyle = 'rgba(80,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED', W / 2, H / 2 - 20);
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Press R to restart', W / 2, H / 2 + 20);
  }

  ctx.textAlign = 'left';
}

// Update HTML HUD Elements
function updateHUD() {
    document.getElementById('hp-val').textContent = Math.max(0, Math.floor(player.hp));
    document.getElementById('coin-val').textContent = score;
    document.getElementById('key-val').textContent = collectedKeys + '/3';
    document.getElementById('pos-val').textContent = Math.floor(player.x) + ',' + Math.floor(player.y);
}

// Main game Loop -runs 60 times per second 
function loop() {
    handleInput();
    if (gameState === 'playing') {
        updateEnemies();
        collectedItems();
    }
    drawScene(ctx);
    drawSprites(ctx);
    drawEnemies(ctx);
    drawHUD();
    drawMinimap();
    updateHUD();
    requestAnimationFrame(loop);
}

let damageFlashTimer = 0;

function triggerDamageFlash() {
    damageFlashTimer = 12;
}

let gameStarted = false ;

//Draw the start screen
function drawStartScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = '#7c6fff';
    ctx.font = 'bold 48px monospace' ;
    ctx.textAlign = 'center';
    ctx.fillText('DUNGEON 3D',W/2,H/2 - 80);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '20px monospace';
    ctx.fillText('Collect 3 keys and reach the Exit',W/2,H/2 - 30);
    
    ctx.fillStyle = '#555555';
    ctx.font = '16px monospace';
    ctx.fillText('W A S D or Arrow Keys to move', W / 2 , H/2 + 80);
    ctx.fillText('Avoid the red enemies!',W/2, H/2 + 110);

    ctx.textAlign = 'left';
}
document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !gameStarted ){
        gameStarted = true;
        initGame();
        loop();
    }
});

// Show the start screen immediately
drawStartScreen();