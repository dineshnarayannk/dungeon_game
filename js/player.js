// Player State Object
let player = {
    x: 1.5,
    y: 1.5,
    angle: 0,
    hp: 100,
    speed: 0.05, 
    turnSpeed: 0.04
};

// Track which keys are currently held down
const keysDown = {} ;

document.addEventListener('keydown', e => {
    keysDown[e.key] = true;
    // Prevent arrow keys from scrolling the page 
    if (['ArrowUp', 'ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))
        e.preventDefault() ;
    // R key restarts the game
    if (e.key === 'r' || e.key === 'R') initGame() ;
});

document.addEventListener('keyup', e => {
    keysDown[e.key] = false;
});

// Called every frame to move the player based on held keys
function handleInput() {
    if (gameState !== 'playing') return ;

    // Rotate left / right 
    if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A'])
        player.angle -= player.turnSpeed;
    if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D'])
        player.angle += player.turnSpeed;

    // Move forward - check X and Y separately for wall sliding
    if (keysDown['ArrowUp'] || keysDown['w'] || keysDown['W']) {
        let nx = player.x + Math.cos(player.angle) * player.speed;
        let ny = player.y + Math.sin(player.angle) * player.speed;
        if (!isWall(nx, player.y)) player.x = nx ;
        if (!isWall(player.x, ny)) player.y = ny;
    }

    // Move backward
    if (keysDown['ArrowDown'] || keysDown['s'] || keysDown['S']) {
        let nx = player.x - Math.cos(player.angle) * player.speed;
        let ny = player.y - Math.sin(player.angle) * player.speed;
        if(!isWall(nx,player.y)) player.x = nx ;
        if(!isWall(player.x,ny)) player.y = ny;
    }
}