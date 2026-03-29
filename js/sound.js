// ── SOUND SYSTEM ──────────────────────────────────────────────
const sounds = {};

function loadSound(name, src) {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src     = src;
  sounds[name]  = audio;
}

// Load all sounds
loadSound('coin',      'audio/coin.wav');
loadSound('key',       'audio/key.wav');
loadSound('enemyDie',  'audio/enemyDie.mp3');
loadSound('playerDie', 'audio/playerDie.ogg');
loadSound('shoot',     'audio/shoot.wav');
loadSound('win',       'audio/win.mp3');

// Set volumes
function initSounds() {
  if (sounds.coin)      sounds.coin.volume      = 0.6;
  if (sounds.key)       sounds.key.volume       = 0.8;
  if (sounds.enemyDie)  sounds.enemyDie.volume  = 0.7;
  if (sounds.playerDie) sounds.playerDie.volume = 0.9;
  if (sounds.shoot)     sounds.shoot.volume     = 0.4;
  if (sounds.win)       sounds.win.volume       = 0.8;
}

initSounds();

function playSound(name) {
  try {
    const s = sounds[name];
    if (!s) return;
    const clone = s.cloneNode();
    clone.volume = s.volume;
    clone.play().catch(() => {});
  } catch (e) {}
}