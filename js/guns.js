// --- GUNS DEFINITIONS ---------
const GUN_DEFS = [
    {
        id: 'pistol',
        name: 'IRON PISTOL',
        price: 0,
        damage: 1,
        cooldown: 15,
        ammoMax: 30,
        spread: 0,
        desc: 'Standard issue sidearm. Reliable and free.',
        color: '#888888',
        stats: { DMG:'1x', SPEED: 'normal', AMMO: '30', TYPE: 'Single'},
    },
    {
        id: 'shotgun',
        name: 'HELLFIRE SHOTGUN',
        price: 700,
        damage: 1,
        cooldown: 40,
        ammoMax: 15,
        spread: 3,
        desc: 'Fires 3 pellets in a spread. Devastating at close range.',
        color: '#cc6600',
        stats: {DMG:'3x', SPEED:'Slow', AMMO:'15', TYPE:'Spread'},
    },
    {
        id: 'rifle',
        name: 'SHADOW RIFLE',
        price: 1500,
        damage: 2,
        cooldown: 8,
        ammoMax: 20,
        spread: 0,
        desc: 'Fast firing. Deals double damage per shot.',
        color: '#336699',
        stats: { DMG:'2x', SPEED:'Fast', AMMO:'20', TYPE:'Single' },
    },
    {
        id: 'sniper',
        name: 'VOID SNIPER',
        price: 2200,
        damage: 5,
        cooldown: 60,
        ammoMax: 10,
        spread: 0,
        desc: 'One shot, massive damage. Handle with care.',
        color: '#9933cc',
        stats: { DMG:'5x', SPEED:'Very Slow', AMMO:'10', TYPE:'Power' },
    },
    {
        id: 'plasma',
        name: 'PLASMA CANNON',
        price: 3000,
        damage: 3,
        cooldown: 25,
        ammoMax: 18,
        spread: 0,
        desc: 'Energy weapon. High damage with medium fire rate.',
        color: '#00cccc',
        stats: { DMG:'3x', SPEED:'Medium', AMMO:'18', TYPE:'Energy' },
    }, 
    {
        id: 'inferno',
        name: 'INFERNO BLASTER',
        price: 3500,
        damage: 4,
        cooldown: 20,
        ammoMax: 25,
        spread: 2,
        desc: 'The ultimate weapon. High damage spread fire.',
        color: '#ff3300',
        stats: { DMG:'4x', SPEED:'Fast',AMMO:'25',TYPE:'Spread' },
    },
];

// --- GUN STATE ---------
let selectedGunIdx = 0;
let equippedGunId = 'pistol';
let gunCarouselIdx = 0;

// --- -SAVE/LOAD GUN DATA ------------
function loadGunData() {
    try {
        const raw = localStorage.getItem('dungeon3d_guns');
        if (!raw) return { owned: ['pistol'], equipped: 'pistol' };
        return JSON.parse(raw);
    } catch (e) {
        return { owned: ['pistol'], equipped: 'pistol' };
    }
}

function saveGunData(data) {
    localStorage.setItem('dungeon3d_guns', JSON.stringify(data));
}

function getEquippedGun() {
    const data = loadGunData();
    return GUN_DEFS.find(g => g.id === data.equipped) || GUN_DEFS[0];
}

// ---DRAW GUN ON CANVAS -------
function drawGunOnCanvas(canvas, gun) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const c = gun.color;
    const cx = w / 2, cy = h / 2;

    if (gun.id === 'pistol') {
        ctx.fillStyle = '#777';
        ctx.fillRect(cx-4, cy-20, 9 , 30);
        ctx.fillStyle = '#666';
        ctx.fillRect(cx-8, cy+5, 18, 18);
        ctx.fillStyle = '#555';
        ctx.fillRect(cx-4, cy+18, 10, 12);
        ctx.fillStyle = '#888';
        ctx.fillRect(cx-7, cy+7, 5, 8);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(cx - 2, cy-22, 6, 5);
    } else if (gun.id === 'shotgun') {
        ctx.fillStyle = c;
        ctx.fillRect(cx-6, cy-30, 14, 45);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(cx-10, cy+12, 22, 18);
        ctx.fillStyle = '#5a3010';
        ctx.fillRect(cx-8, cy+26, 16, 10);
        ctx.fillStyle = c;
        ctx.fillRect(cx-7, cy-5, 16, 8);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(cx-4, cy-32, 5, 6);
        ctx.fillRect(cx+1, cy-32, 5, 6);
    } else if (gun.id === 'rifle') {
        ctx.fillStyle = c;
        ctx.fillRect(cx-4, cy-35, 10, 55);
        ctx.fillStyle = '#1a3a5a';
        ctx.fillRect(cx-10, cy, 22, 20);
        ctx.fillStyle = '#0a2a4a';
        ctx.fillRect(cx-7, cy+16, 16, 12);
        ctx.fillStyle = '#aaccff';
        ctx.fillRect(cx-3, cy-38, 8, 6);
        ctx.fillStyle = c;
        ctx.fillRect(cx-12, cy+2, 6, 12);
    } else if (gun.id === 'sniper') {
        ctx.fillStyle = c;
        ctx.fillRect(cx-3, cy-38, 8 , 60);
        ctx.fillStyle = '#220033';
        ctx.fillRect(cx-10, cy+5, 22, 18);
        ctx.fillStyle = '#440066';
        ctx.fillRect(cx-3, cy-10, 8, 20);
        ctx.fillStyle = '#cc99ff';
        ctx.beginPath();
        ctx.arc(cx+1, cy-38, 6, 0 ,Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx+1, cy-38, 3, 0,Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9933cc';
        ctx.fillRect(cx-12, cy+7, 5, 8);
    } else if (gun.id === 'plasma') {
        ctx.fillStyle = '#004444';
        ctx.fillRect(cx-10, cy-10, 22, 30);
        ctx.fillStyle = c;
        ctx.fillRect(cx-5, cy-30, 12, 25);
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx+1, cy-30, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#006666';
        ctx.fillRect(cx-8, cy+18, 18, 12);
        ctx.fillStyle = '#00aaaa';
        ctx.fillRect(cx-10, cy, 4, 14);
        ctx.fillRect(cx+8, cy, 4, 14);
    } else if (gun.id === 'inferno') {
        ctx.fillStyle = '#330000';
        ctx.fillRect(cx-12, cy-5, 26,28);
        ctx.fillStyle = c;
        ctx.fillRect(cx-6, cy-28, 14, 28);
        ctx.fillStyle = '#ff6600';
        ctx.shadowColor = '#ff3300';
        ctx.shadowBlur = 14;
        ctx.fillRect(cx-4, cy-30, 5, 7);
        ctx.fillRect(cx+1, cy-30, 5, 7);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(cx-10, cy+5, 4, 14);
        ctx.fillRect(cx+8, cy+5, 4, 14);
        ctx.fillStyle = '#660000';
        ctx.fillRect(cx-9, cy+22, 20, 10);
    }
}

// -------- BUILD CAROUSEL ------------
function buildGunsCarousel() {
    const carousel = document.getElementById('guns-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    const data = loadGunData();

    GUN_DEFS.forEach((gun,i) => {
        const owned = data.owned.includes(gun.id);
        const equip = data.equipped === gun.id;

        const card = document.createElement('div');
        card.className = 'gun-card' + (i === selectedGunIdx ? ' selected' : '') + (equip ? ' equipped' : '');
        card.onclick = () => selectGun(i);

        if (equip) {
            card.innerHTML += '<div class="gun-card-badge">EQUIPPED</div>';
        } else if (!owned) {
            card.innerHTML += `<div class="gun-card-locked-badge">🔒</div>`;
        }

        const cv = document.createElement('canvas');
        cv.className = 'gun-card-canvas';
        cv.width = 100;
        cv.height = 80;
        card.appendChild(cv);

        const nm = document.createElement('div');
        nm.className = 'gun-card-name';
        nm.textContent = gun.name;
        card.appendChild(nm);

        const pr = document.createElement('div');
        pr.className = 'gun-card-price';
        pr.textContent = gun.price === 0 ? 'FREE' : '💰 ' + gun.price;
        card.appendChild(pr);

        carousel.appendChild(card);
        drawGunOnCanvas(cv, gun);
    });

    updateGunsInfo();
    updateGunsCoins();
}

function selectGun(idx) {
    selectedGunIdx = idx;
    buildGunsCarousel();
}

function scrollGuns(dir) {
    selectedGunIdx = (selectedGunIdx + dir + GUN_DEFS.length) % GUN_DEFS.length;
    buildGunsCarousel();

    // Scroll carousel to show selected card
    const carousel = document.getElementById('guns-carousel');
    if (carousel) {
        const cards = carousel.querySelectorAll('.gun-card');
        if (cards[selectedGunIdx]) {
            cards[selectedGunIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
}

function updateGunsInfo() {
    const gun = GUN_DEFS[selectedGunIdx];
    const data = loadGunData();
    const owned = data.owned.includes(gun.id);
    const equip = data.equipped === gun.id;
    const coins = getTotalCoins();

    document.getElementById('guns-info-name').textContent = gun.name;
    document.getElementById('guns-info-desc').textContent = gun.desc;

    // Stats
    const statsEl = document.getElementById('guns-info-stats');
    statsEl.innerHTML = '';
    Object.entries(gun.stats).forEach(([k, v]) => {
        const s = document.createElement('div');
        s.className = 'gun-stat';
        s.innerHTML = `<b>${v}</b>${k}`;
        statsEl.appendChild(s);
    });

    // Buy Button 
    const buyBtn = document.getElementById('guns-buy-btn');
    if (owned) {
        buyBtn.textContent = 'OWNED';
        buyBtn.disabled = true;
    } else if (coins < gun.price) {
        buyBtn.textContent = `💰 ${gun.price} (Need ${gun.price - coins} more)`;
        buyBtn.disabled = true;
    } else {
        buyBtn.textContent = `BUY  💰  ${gun.price}`;
        buyBtn.disabled = false;
    }

    // Equip button
    const equipBtn = document.getElementById('guns-equip-btn');
    if (!owned) {
        equipBtn.textContent = 'NOT OWNED';
        equipBtn.disabled = true;
    } else if (equip) {
        equipBtn.textContent = '✓ EQUIPPED';
        equipBtn.disabled = true;
    } else {
        equipBtn.textContent = 'EQUIP';
        equipBtn.disabled = false;
    }
}

function updateGunsCoins() {
    const el = document.getElementById('guns-coin-count');
    if (el) el.textContent = getTotalCoins();
}

function buyGun() {
    const gun = GUN_DEFS[selectedGunIdx];
    const data = loadGunData();
    const coins = getTotalCoins();

    if (data.owned.includes(gun.id)) return;
    if (coins < gun.price) return;

    // Deduct coins from localStorage
    const progress = loadProgress();
    progress.totalCoins = (progress.totalCoins || 0) - gun.price;
    storeProgress(progress);

    // Add to owned
    data.owned.push(gun.id);
    saveGunData(data);

    buildGunsCarousel();
    updateHomeCoin();
}

function equipGun() {
    const gun = GUN_DEFS[selectedGunIdx];
    const data = loadGunData();
    if (!data.owned.includes(gun.id)) return;
    data.equipped = gun.id;
    saveGunData(data);
    equippedGunId = gun.id;
    buildGunsCarousel();
}