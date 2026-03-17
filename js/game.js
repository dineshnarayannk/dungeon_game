const canvas = document.getElementById('gamecanvas');
const ctx = canvas.getContext('2d');
canvas.width = Math.min(window.innerWidth, 960);
canvas.height = Math.min(window.innerHeight - 60, 540);
let gameState = 'playing';
let kills = 0;
let ammo = 30;
let muzzleFlash = 0;
let shootCooldown = 0;
let waveTimer = 90;
let particles = [];
let killFeed = [];
let spawnInterval = null ;

// Initialise / restart everything
function initGame() {
    player.x = 1.5; player.y = 1.5;
    player.angle = 0; player.hp = 100 ;
    gameState = 'playing';
    kills = 0; ammo = 30; muzzleFlash = 0;
    shootCooldown = 0; waveTimer = 90; wave=1;
    particles=[]; killFeed=[]; enemies=[];
    initSprites();
    initEnemies();
    spawnWave(1);
    startContinuousSpawn();
    document.getElementById('msg').textContent = 'Collect 3 keys the reach the exit!' ;
}

// Spawn 1 extra enemy every 2 seconds
function startContinuousSpawn() {
    if (spawnInterval) clearInterval(spawnInterval);

    spawnInterval = setInterval (() => {
        if (gameState !== 'playing') return;

        // Find a random open tile far from player
        let ex, ey, attempts = 0;
        do {
        ex = 1 + Math.floor(Math.random() * 14);
        ey = 1 + Math.floor(Math.random() * 14);
        attempts++;
        } while (
            (isWall(ex + 0.5, ey + 0.5) ||
            isWall(ex + 0.3, ey + 0.3) ||
            isWall(ex + 0.7, ey + 0.3) ||
            isWall(ex + 0.3, ey + 0.7) ||
            isWall(ex + 0.7, ey + 0.7) ||
            Math.sqrt((ex - player.x)**2 + (ey - player.y)**2) < 4)
            && attempts < 50
        );

        enemies.push({
        x:          ex + 0.5,
        y:          ey + 0.5,
        hp:         2 + Math.floor(wave / 2),
        maxHp:      2 + Math.floor(wave / 2),
        speed:      0.007 + wave * 0.001,
        alive:      true,
        flashTimer: 0,
        });
    }, 5000); // every 5 seconds
}

function shoot() {
    if (ammo<= 0 || shootCooldown>0 || gameState !== 'playing') return;
    ammo--; shootCooldown=15; muzzleFlash=5;
    let sin=Math.sin(player.angle), cos=Math.cos(player.angle);
    for(let d = 0.5 ; d < MAX_DEPTH; d+= 0.1){
        let bx = player.x+cos*d, by=player.y+sin*d;
        if (isWall(bx,by)) break;
        for (let e of enemies) {
            if(!e.alive) continue;
            let dx=e.x-bx, dy=e.y-by;
            if (Math.sqrt(dx*dx+dy*dy) < 0.4) {
                e.hp--; e.flashTimer=8;
                for (let p=0;p<6;p++){
                    particles.push({x:e.x,y:e.y,
                        vx:(Math.random()-0.5)*0.05,
                        vy:(Math.random()-0.5)*0.5,
                        life:20, maxLife:20, color:'#cc0000'});
                }
                if (e.hp<=0){
                    e.alive=false; kills++; score+=100;
                    killFeed.unshift({msg:'+100 ENEMY DOWN',timer:60});
                    if (killFeed.length>4) killFeed.pop();
                    if(Math.random()<0.4){
                        ammo=Math.min(30,ammo+5);
                        killFeed.unshift({msg:'+5 AMMO DROP',timer:60});
                    }
                    if (enemies.every(en=>!en.alive)){
                        wave++; waveTimer=90;
                        setTimeout(() => spawnWave(wave), 1500);
                    }
                }
                return ;
            }
        }
    }
}

function drawParticles() {
    particles = particles.filter(p => {
        p.x+=p.vx; p.y+=p.vy; p.life--;
        if (p.life<=0) return false;
        let proj = worldToScreen(p.x,p.y);
        if(!proj) return p.life>0;
        ctx.globalAlpha = p.life/p.maxLife*0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(proj.sx,HALF,Math.max(2,proj.size*0.08),0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha=1;
        return true;
    });
}

function drawGun() {
    let bob=Math.sin(Date.now()*0.008)*3;
    let gx=W/2+40, gy=H-60+bob;
    if (muzzleFlash>0){
        ctx.fillStyle=`rgba(255,200,0,${muzzleFlash/5*0.8})`;
        ctx.beginPath(); ctx.arc(gx-12,gy-30,18,0,Math.PI*2); ctx.fill();
        muzzleFlash--;
    }
    ctx.fillStyle='#555';ctx.fillRect(gx-8,gy-35,16,40);
    ctx.fillStyle='#444';ctx.fillRect(gx-14,gy,28,30);
    ctx.fillStyle='#333';ctx.fillRect(gx-6,gy+20,14,20);
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
    // Enemy dot
    enemies.forEach(e => {
        if (!e.alive) return;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(ox+e.x*ms, oy+e.y*ms, 2, 0, Math.PI*2);
        ctx.fill();
    });
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
    ctx.fillStyle = `rgba(200,0,0,${damageFlashTimer / 18 * 0.25})`;
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

  // 3. Red vignette border — edges only, center stays clear
  if (player.hp < 75) {
    let ei = (75 - player.hp) / 75 * 0.45;
    let g  = ctx.createRadialGradient(W/2, H/2, H*0.45, W/2, H/2, H*0.95);
    g.addColorStop(0, 'rgba(180,0,0,0)');
    g.addColorStop(1, `rgba(180,0,0,${ei})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // KEYS row — top of the stack
  ctx.fillStyle = '#777';
  ctx.font = '9px monospace';
  ctx.fillText('KEYS', 10, H - 68);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < collectedKeys ? '#FFD700' : '#333';
    ctx.fillRect(10 + i * 20, H - 63, 12, 10);
    ctx.beginPath();
    ctx.arc(10 + i * 20 + 6, H - 64, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // AMMO row — middle
  ctx.fillStyle = '#888';
  ctx.font = '10px monospace';
  ctx.fillText('AMMO: ' + ammo, 10, H - 46);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(10, H - 42, 80, 5);
  ctx.fillStyle = ammo > 10 ? '#e8b84b' : '#e74c3c';
  ctx.fillRect(10, H - 42, (ammo / 30) * 80, 5);

  // HP row — bottom
  ctx.fillStyle = '#888';
  ctx.font = '10px monospace';
  ctx.fillText('HP', 10, H - 28);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(10, H - 24, 120, 8);
  let hpPct = player.hp / 100;
  ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(10, H - 24, hpPct * 120, 8);

  // Crosshair
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2, HALF-12); ctx.lineTo(W/2, HALF+12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2-12, HALF); ctx.lineTo(W/2+12, HALF); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, HALF, 6, 0, Math.PI*2); ctx.stroke();

  // Kill feed — top right
  killFeed = killFeed.filter(k => k.timer > 0);
  killFeed.forEach((k, i) => {
    ctx.fillStyle = `rgba(255,150,100,${k.timer / 60})`;
    ctx.font      = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(k.msg, W - 10, 20 + i * 18);
    k.timer--;
  });
  ctx.textAlign = 'left';

  // Wave banner — center screen
  if (waveTimer > 0) {
    ctx.fillStyle = `rgba(255,200,0,${Math.min(1, waveTimer / 30)})`;
    ctx.font      = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE ' + wave, W / 2, 80);
    ctx.textAlign = 'left';
    waveTimer--;
  }

  // Flash message — coin / key pickup
  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flashTimer / 40 * 0.9})`;
    ctx.font      = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(flashMsg, W / 2, HALF - 30);
    flashTimer--;
    ctx.textAlign = 'left';
  }

  // Win screen
  if (gameState === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU ESCAPED!', W/2, H/2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText('Score: ' + score + '   Kills: ' + kills, W/2, H/2);
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Press R to play again', W/2, H/2 + 40);
    ctx.textAlign = 'left';
  }

  // Death screen
  if (gameState === 'dead') {
    ctx.fillStyle = 'rgba(80,0,0,0.8)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED', W/2, H/2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText('Score: ' + score + '   Kills: ' + kills, W/2, H/2);
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('Press R to restart', W/2, H/2 + 40);
    ctx.textAlign = 'left';
  }
}

// Update HTML HUD Elements
function updateHUD() {
    document.getElementById('hp-val').textContent = Math.max(0, Math.floor(player.hp));
    document.getElementById('coin-val').textContent = score;
    document.getElementById('key-val').textContent = collectedKeys + '/3';
    document.getElementById('pos-val').textContent = Math.floor(player.x) + ',' + Math.floor(player.y);
    document.getElementById('score-val').textContent = score;
    document.getElementById('kill-val').textContent = kills;
    document.getElementById('ammo-val').textContent = ammo;
    document.getElementById('wave-val').textContent = wave;
}

// Main game Loop -runs 60 times per second 
function loop() {
    handleInput();
    if (shootCooldown > 0) shootCooldown--;
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
    if (e.code === 'Space' && gameStarted){
        e.preventDefault();
        shoot();
    }
    if (e.key === 'r' || e.key === 'R'){
        initGame();
    }
});

// Show the start screen immediately
drawStartScreen();