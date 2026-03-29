// DAY - NIGHT & WEATHER SYSTEM ------------

// Time trackers 
let dayTimer = 0;
let weatherTimer = 0;

// Current phase names
let dayPhase = 'day';
let weatherPhase = 'clear';

// Rain drops array
let rainDrops = [];

// Lightning state
let lightningTimer = 0;
let lightningAlpha = 0;

// Torch flicker
let torchFlicker = 1.0;

// -- INIT RAIN DROPS ---------
function initRain(count) {
    if (!W || !H) return ; 
    rainDrops = [];
    for (let i = 0 ; i < count ; i++){
        rainDrops.push({
            x:  Math.random() * W,
            y:  Math.random() * H,
            speed: 6 + Math.random() * 6,
            len: 10 + Math.random() * 20,
            alpha: 0.3 + Math.random() *0.4,
        }) ;
    }
}

// UPDATE WEATHER CYCLE--------------
function updateWeather() {
    if (typeof gameState !== 'playing') return ;
    if (gameState !== 'playing') return;
    if (!W || !H) return;


    // Day/Night cycle - 4 minutes total (14400 frames)
    dayTimer = (dayTimer + 1) % 14400 ;
    let dayProgress = dayTimer / 14400 ;
    if      (dayProgress < 0.25) dayPhase = 'day';
    else if (dayProgress < 0.50) dayPhase = 'sunset';
    else if (dayProgress < 0.75) dayPhase = 'night';
    else                         dayPhase = 'dawn';

    // Weather Cycle - 3 minutes total
    weatherTimer = (weatherTimer + 1) % 10800 ;
    let weatherProgress = weatherTimer / 10800;

    let prevWeather = weatherPhase;
    if      (weatherProgress < 0.25) weatherPhase = 'clear';
    else if (weatherProgress < 0.50) weatherPhase = 'rain';
    else if (weatherProgress < 0.75) weatherPhase = 'storm';
    else                             weatherPhase = 'fog';

    // Reinit rain when switching to rain/storm
    if (prevWeather !== weatherPhase) {
        if (weatherPhase === 'rain') initRain(80) ;
        if (weatherPhase === 'storm') initRain(180);
        if (weatherPhase === 'clear' || weatherPhase === 'fog') rainDrops = [];
    }

    // Torch flicker - gentle pulse
    torchFlicker = 0.08 + 0.12 * Math.sin(Date.now() * 0.003 + Math.sin(Date.now() * 0.007 ));

    // Lightning - random during storm
    if (weatherPhase === 'storm') {
        if (lightningTimer > 0){
            lightningTimer--;
            lightningAlpha = lightningTimer / 8;
        } else if (Math.random() < 0.003) {
            lightningTimer = 8;
            lightningAlpha = 1;
            if (typeof playSound === 'function') {
                // no thunder sound file needed 
            }
        }
    } else {
        lightningTimer = 0;
        lightningAlpha = 0;
    }
}

// GET SKY COLOURS FOR CURRENT DAY PHASE
function getDayColors() {
    switch (dayPhase) {
        case 'day': return { sky: '#1a1a3e', floor: '#0d0d1a'};
        case 'sunset': return { sky: '#2a1a0a', floor: '#1a0d05'};
        case 'night': return { sky: '#020208', floor: '#010105'};
        case 'dawn': return { sky: '#1a0a2a', floor: '#0d051a'};
        default : return { sky: '#0a0a14', floor: '#111118'};
    }
}

// GET WALL BRIGHTNESS MULTIPLIER
function getDayBrightness() {
    switch (dayPhase) {
        case 'day' : return 1.0;
        case 'sunset': return 0.75;
        case 'night': return 0.4;
        case 'dawn': return 0.6
        default: return 1.0;
    }
}

// GET WALL TINT COLOUR -------
function getDayTint() {
    switch (dayPhase) {
        case 'day': return null;
        case 'sunset': return 'rgba(120,60,0,0.12)';
        case 'night': return 'rgba(0,0,30,0.25)';
        case 'down': return 'rgba(60,0,80,0.15)';
        default: return null;
    }
}

// ---DRAW WEATHER EFFECTS -----------
function drawWeather() {
    if (typeof gameState === 'undefined') return;
    if (gameState !== 'playing' && gameState !== 'paused' && gameState !== 'countdown') return;
    if (!W || !H || !ctx) return;
    
    // Boss arena - always night , no weather
    if (currentLevel === LEVELS.length - 1) return;

    // ---RAIN ----------------------
    if (weatherPhase === 'rain' || weatherPhase === 'storm'){
        rainDrops.forEach(drop => {
            drop.y += drop.speed;
            drop.x += weatherPhase === 'storm' ? 1.5 : 0.5;
            if (drop.y > H) { drop.y = -drop.len; drop.x = Math.random() * W; }
            if (drop.x > W) { drop.x = 0; }
            ctx.strokeStyle = `rgba(180,200,255,${drop.alpha})` ;
            ctx.lineWidth = weatherPhase === 'storm' ? 1.5 : 1 ;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + (weatherPhase === 'storm' ? 3 : 1), drop.y + drop.len);
            ctx.stroke();
        });
    }

    // -- LIGHTNING FLASH ----------
    if (weatherPhase === 'storm' && lightningAlpha > 0) {
        ctx.fillStyle = `rgba(200,220,255,${lightningAlpha * 0.35})` ;
        ctx.fillRect(0,0,W,H);
    }

    // -- FOG -------------
    if (weatherPhase === 'fog') {
        let fogIntensity = 0.18 + 0.08 * Math.sin(Date.now() * 0.0005);
        let fog = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*1.0);
        fog.addColorStop(0, 'rgba(200,210,220,0)') ;
        fog.addColorStop(0.5, `rgba(200,210,220,${fogIntensity * 0.3})`) ;
        fog.addColorStop(1, `rgba(200,210,220,${fogIntensity})`) ;
        ctx.fillStyle = fog;
        ctx.fillRect(0,0,W,H);

        // Dense fog patches
        let t = Date.now() * 0.0003;
        for (let i = 0; i < 3; i++){
            let fx = W/2 + Math.sin(t + i*2.1) * W * 0.3;
            let fy = H/2 + Math.cos(t + i * 1.7) * H * 0.2;
            let fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, W * 0.25);
            fg.addColorStop(0, `rgba(200,210,220,${fogIntensity * 0.5})`) ;
            fg.addColorStop(1, 'rgba(200,210,220,0)') ;
            ctx.fillStyle = fg;
            ctx.fillRect(0,0,W,H);
        }
    }

    // --- STORM DARK OVERLAY -----------
    if (weatherPhase === 'storm') {
        ctx.fillStyle = 'rgba(0,0,10,0.15)';
        ctx.fillRect(0,0,W,H);
    }
}

// --DRAW WEATHER INDICATOR 
function drawWeatherHUD() {
    if (gameState !== 'playing') return;
    if (currentLevel === LEVELS.length - 1) return;
    let dayIcon = dayPhase === 'day' ? '☀' :
                  dayPhase === 'sunset' ? '🌅' :
                  dayPhase === 'night' ? '🌙' : '🌄';
    
    let weatherIcon = weatherPhase === 'clear' ? '' :
                      weatherPhase === 'rain' ? '🌧' :
                      weatherPhase === 'storm' ? '⛈' : '🌫' ;
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)' ;
    ctx.beginPath();
    ctx.roundRect(8, H - 145 , 110 , 28 , 6);
    ctx.fill();

    ctx.font = '13px monospace';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';

    let dayLabel = dayPhase.charAt(0).toUpperCase() + dayPhase.slice(1);
    let wLabel = weatherPhase === 'clear' ? 'Clear' :
                 weatherPhase === 'rain' ? 'Rain' :
                 weatherPhase === 'storm' ? 'Storm' : 'Fog';
                
    ctx.fillText(dayIcon + ' ' + dayLabel + ' ' + weatherIcon + ' ' + wLabel,14, H - 126);
}