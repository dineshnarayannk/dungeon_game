// Define all Collectible items in the World
let coins = [];
let keys = [];
let collectedKeys = 0;
let score = 0;
let flashTimer = 0;
let flashMsg = '';

function initSprites() {
    // Coins scattered around the dungeon
    coins = [
        {x:3.5,y:2.5,alive:true}, {x:7.5,y:1.5,alive:true},
        {x:2.5,y:7.5,alive:true}, {x:10.5,y:5.5,alive:true},
        {x:5.5,y:11.5,alive:true}, {x:13.5,y:9.5,alive:true},
        {x:8.5,y:13.5,alive:true}, {x:1.5,y:12.5,alive:true},
    ];

    keys = [
        {x:14.5,y:2.5,alive:true,color:'#FFD700'},
        {x:1.5,y:13.5,alive:true,color:'#00BFFF'},
        {x:13.5,y:13.5,alive:true,color:'#FF69B4'}
    ];
    collectedKeys = 0;
    score = 0;
}

function worldToScreen(wx,wy) {
    let dx = wx - player.x;
    let dy = wy - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let angleToSprite = Math.atan2(dy,dx);
    let relAngle = angleToSprite - player.angle;
    while (relAngle > Math.PI) relAngle -= Math.PI * 2;
    while (relAngle < -Math.PI) relAngle += Math.PI * 2;
    if (Math.abs(relAngle) > FOV * 0.75) return null ;
    let sx = W / 2 + relAngle * (W/FOV);
    let size = Math.min(200,H/dist);
    return {sx , size , dist};
} 

// Draw all coins and keys in the scene 
function drawSprites(ctx) {
    let all = [];
    coins.forEach(c => { if (c.alive) all.push({ ...c, type:'coin'}); }) ;
    keys.forEach(k => {if (k.alive) all.push({...k, type:'key'});});
    all.sort((a,b) => {
        let da = (a.x-player.x)**2 + (a.y-player.y)**2;
        let db = (b.x-player.x)**2 + (b.y-player.y)**2;
        return db - da ;
    });
    all.forEach(s => {
        let proj = worldToScreen(s.x,s.y);
        if (!proj) return;
        let { sx,size,dist} = proj;
        if (dist > MAX_DEPTH) return ;
        let bright = Math.max(0.2,1 - dist / MAX_DEPTH);
        ctx.globalAlpha = bright;
        if (s.type === 'coin') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(sx,HALF,size*0.25, 0, Math.PI * 2);
            ctx.fill();
        }else if ( s.type === 'key') {
            ctx.fillStyle = s.color;
            ctx.fillRect(sx - size*0.06, HALF - size*0.3, size*0.12, size*0.5);
            ctx.beginPath();
            ctx.arc(sx, HALF - size*0.3, size*0.15, 0 , Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    });
}

//Check if player walked into a coin or key
function collectedItems() {
    coins.forEach(c => {
        if (!c.alive) return ;
        let d = Math.sqrt((c.x-player.x)**2 + (c.y-player.y)**2);
        if (d < 0.6) { c.alive=false; score+=10; flashMsg ='+10 COIN!'; flashTimer=40;}
    });
    keys.forEach(k => {
        if (!k.alive) return ;
        let d = Math.sqrt((k.x-player.x)**2 + (k.y-player.y)**2);
        if (d < 0.6 ) {
            k.alive=false;
            collectedKeys++;
            score+=10; 
            flashMsg='KEY ' + collectedKeys + '/3 COLLECTED!';
            flashTimer=50; 
        }
    });
    // Check for exit - bottom-right corner (14,14), only if all keys collected
    if (collectedKeys >= 3){
        if(Math.abs(player.x - 14.5) < 0.7 && Math.abs(player.y - 14.5) < 0.7) {
            gameState = 'win';
            document.getElementById('msg').textContent = 'You escaped! Score: ' + score ;
        }
    }
}