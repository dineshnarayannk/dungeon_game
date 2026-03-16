let enemies = [];

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
        ctx.globalAlpha = bright;
        // Body
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(sx - size*0.2, HALF - size*0.4,size*0.4,size*0.6);
        // Head
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(sx, HALF - size*0.45, size*0.22, 0 , Math.PI*2);
        ctx.fill();
        // Horns
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(sx - size*0.08, HALF - size*0.5, size*0.06, size*0.12);
        ctx.fillRect(sx + size*0.02, HALF - size*0.5, size*0.06, size*0.12);
        ctx.globalAlpha = 1;
    });
}

// Move enemies toward player when in range , deal damage on contact
function updateEnemies() {
    enemies.forEach(e => {
        if (!e.alive) return;
        let dx = player.x - e.x ;
        let dy = player.y - e.y ;
        let dist = Math.sqrt(dx*dx + dy*dy);

        // Chase player if within 6 titles
        if (dist < 6){
            let nx = e.x + (dx/dist) * e.speed;
            let ny = e.y + (dy/dist) * e.speed;
            if (!isWall(nx,e.y)) e.x = nx ;
            if (!isWall(e.x, ny)) e.y = ny;
        }

        // Deal damage when touching the player
        if (dist < 0.5 ) {
            player.hp = Math.max(0, player.hp - 0.5);
        }

        // Check for Player death
        if (player.hp <= 0) gameState = 'dead';
    });
}