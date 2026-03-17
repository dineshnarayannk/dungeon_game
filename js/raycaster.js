const W = Math.min(window.innerWidth, 960);
const H = Math.min(window.innerHeight - 60, 540);
const HALF = H / 2 ;
const FOV = Math.PI / 3;
const RAYS = 160;
const STEP = FOV / RAYS ;
const MAX_DEPTH = 16;

// Cast a single ray at a given angle
// Returns: distance to wall hit + wall type ( for shading)
function castRay(angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let dist = 0;
    let hit = false;
    let wallType = 0;

    // Step along the ray until a wall is hit
    for (let d = 0 ; d < MAX_DEPTH; d += 0.05) {
        let rx = player.x + cos * d ;
        let ry = player.y + sin * d;
        if (isWall(rx,ry)) {
            dist = d;
            hit = true;
            // Alternate wall shading based on grid position
            wallType = (Math.floor(rx) + Math.floor(ry)) % 2;
            break;
        }
    }
    return { dist: hit ? dist : MAX_DEPTH, wallType };
}

// Draw the full 3D scene using all rays
function drawScene(ctx){
    // Draw sky (top half) and floor (bottom half)
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#111118';
    ctx.fillRect(0, HALF, W, HALF);

    const sliceW = W / RAYS; 

    for(let i = 0 ; i < RAYS; i++){
        let angle = player.angle - FOV / 2 + i * STEP;
        let { dist, wallType } = castRay(angle);

        let corr = dist * Math.cos(angle - player.angle);

        let wallH = Math.min(H, H / corr);

        let bright = Math.max(0, 1 - corr / MAX_DEPTH);
        let base = wallType === 0 ? [90,80,160] : [70,60,130];
        let r = Math.floor(base[0] * bright);
        let g = Math.floor(base[1] * bright);
        let b = Math.floor(base[2] * bright);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i * sliceW , HALF - wallH / 2 , sliceW + 1, wallH);
    }
}