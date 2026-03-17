let enemies = [];
let wave = 1;

function initEnemies() {
    enemies = [
        {x:5.5, y:5.5, angle:0, hp:3, speed:0.008, alive:true },
        {x:10.5, y:10.5, angle:1, hp:3, speed:0.010, alive:true },
        {x:3.5, y:11.5, angle:2, hp:3, speed:0.009, alive:true },
    ];
}

function drawEnemies(ctx){
    enemies.forEach(e => {
        if (!e.alive) return ;
        let proj = worldToScreen(e.x, e.y);
        if (!proj) return;
        let { sx, size, dist } = proj;
        if (dist > MAX_DEPTH) return;
        let bright = Math.max(0.2,1 - dist / MAX_DEPTH);
        let hpAlpha = Math.max(0.3, e.hp / e.maxHp); //     fade with HP
        ctx.globalAlpha = bright;
        // Flash white when hit
        let flashing = e.flashTimer > 0;
        // Body
        ctx.fillStyle = flashing ? '#ff9999' : '#c0392b';
        ctx.fillRect(sx - size*0.22, HALF - size*0.45,size*0.44,size*0.65);
        // Head
        ctx.fillStyle = flashing ? '#ffcccc' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(sx, HALF - size*0.5, size*0.24, 0 , Math.PI*2);
        ctx.fill();
        // Horns
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(sx - size*0.09, HALF - size*0.56, size*0.07, size*0.14);
        ctx.fillRect(sx + size*0.02, HALF - size*0.56, size*0.07, size*0.14);
        // HP Bar - always draw above enemy head 
        ctx.globalAlpha = bright * hpAlpha;
        let bw = Math.max(20, size*0.55);
        let bh = 5;
        let bx = sx - bw / 2;
        let by = HALF - size * 0.82;
        ctx.fillStyle = '#000000';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#333333';
        ctx.fillRect(bx,by,bw,bh);
        // ctx.fillStyle = e.hp / e.maxHp > 0.66 ? '#2ecc71' 
        //               : e.hp / e.maxHp > 0.33 ? '#f39c12'
        //               : '#e74c3c'
        // ctx.fillRect(bx,by,bw * (e.hp / e.maxHp), bh);
        let hpRatio = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(bx,by,bw * hpRatio, bh);

        ctx.globalAlpha = 1;
        
        // Countdown flash Timer
        if (e.flashTimer > 0) e.flashTimer--;
    });
}

function spawnWave(w) {
    let count = 3 + (w - 1)* 2;
    for(let i = 0 ; i < count ; i++){
        let ex, ey, attempts = 0;
        do {
            ex = 1 + Math.floor(Math.random() * 14);
            ey = 1 + Math.floor(Math.random() * 14);
            attempts++;
        }while (
            (isWall(ex + 0.5, ey + 0.5) ||
            isWall(ex + 0.3, ey + 0.3) ||
            isWall(ex + 0.7, ey + 0.3) ||
            isWall(ex + 0.3, ey + 0.7) ||
            isWall(ex + 0.7, ey + 0.7) ||
            Math.sqrt((ex - player.x)**2 + (ey - player.y)**2) < 4)
            && attempts < 50
        );
        enemies.push({
            x: ex+0.5, y: ey+0.5,
            hp: 2 + Math.floor(w/2),
            maxHp: 2 + Math.floor(w/2),
            speed: 0.007 + w*0.001,
            alive: true,
            flashTimer: 0,
        });
    }
}

// Move enemies toward player when in range , deal damage on contact
function updateEnemies() {
    enemies.forEach(e => {
        if (!e.alive) return;
        let dx = player.x - e.x ;
        let dy = player.y - e.y ;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 8) {
            let nx = e.x + (dx / dist) * e.speed;
            let ny = e.y + (dy / dist) * e.speed;
            const R = 0.35; // enemy collision radius

            // Check all 4 corners for X movement
            let canMoveX = !isWall(nx + R, e.y) &&
                            !isWall(nx - R, e.y) &&
                            !isWall(nx + R, e.y + R) &&
                            !isWall(nx - R, e.y + R) &&
                            !isWall(nx + R, e.y - R) &&
                            !isWall(nx - R, e.y - R);

            // Check all 4 corners for Y movement
            let canMoveY = !isWall(e.x, ny + R) &&
                            !isWall(e.x, ny - R) &&
                            !isWall(e.x + R, ny + R) &&
                            !isWall(e.x - R, ny + R) &&
                            !isWall(e.x + R, ny - R) &&
                            !isWall(e.x - R, ny - R);

            if (canMoveX) e.x = nx;
            if (canMoveY) e.y = ny;
        }

        // Deal damage when touching the player
        if (dist < 0.5 ) {
            player.hp = Math.max(0, player.hp - 0.4 );
            triggerDamageFlash();
        }

        // Check for Player death
        if (player.hp <= 0) gameState = 'dead';

        // If enemy somehow ended up inside a wall, push it out
        const R = 0.35;
        if (isWall(e.x, e.y) ||
            isWall(e.x + R, e.y) ||
            isWall(e.x - R, e.y) ||
            isWall(e.x, e.y + R) ||
            isWall(e.x, e.y - R)) {

            // Try nudging in 8 directions to escape
            const nudges = [
                [0.1, 0], [-0.1, 0], [0, 0.1], [0, -0.1],
                [0.1, 0.1], [-0.1, 0.1], [0.1, -0.1], [-0.1, -0.1]
            ];
            for (let [nx, ny] of nudges) {
                let tx = e.x + nx, ty = e.y + ny;
                if (!isWall(tx, ty) &&
                    !isWall(tx + R, ty) &&
                    !isWall(tx - R, ty) &&
                    !isWall(tx, ty + R) &&
                    !isWall(tx, ty - R)) {
                e.x = tx;
                e.y = ty;
                break;
                }
            }
        }
    });
}