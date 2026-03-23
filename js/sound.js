// ---- SOUND SYSTEM -------
const sounds = {
    coin: new Audio('audio/coin.wav'),
    key: new Audio('audio/key.wav'),
    enemyDie: new Audio('audio/enemyDie.mp3'),
    playerDie: new Audio('audio/playerDie.ogg'),
    shoot: new Audio('audio/shoot.wav'),
    win: new Audio('audio/win.mp3'),
};

// Set volumes
sounds.coin.volume      = 0.6;
sounds.key.volume       = 0.8;
sounds.enemyDie.volume  = 0.7;
sounds.playerDie.volume = 0.9;
sounds.shoot.volume     = 0.5;
sounds.win.volume       = 0.8;

function playSound(name) {
    const s = sounds[name];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
}