const SAVE_KEY = 'dungeon3d_progress';

function loadProgress() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { completedLevels: [], totalCoins: 0};
    try {
        const data = JSON.parse(raw);
        return {
            completedLevels: Array.isArray(data.completedLevels) ?  data.completedLevels : [],
            totalCoins:      typeof data.totalCoins === 'number' ? data.totalCoins  : 0,
        };
    } catch (err) {
        return { completedLevels: [] , totalCoins: 0 };
    }
}

function storeProgress(progress) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function saveProgress(levelIndex) {
    const progress = loadProgress();
    if (!progress.completedLevels.includes(levelIndex)) {
        progress.completedLevels.push(levelIndex);
        progress.completedLevels.sort((a,b) => a - b);
    }
    storeProgress(progress);
}

function getTotalCoins() {
    return loadProgress().totalCoins || 0;
}

function isLevelComplete(levelIndex) {
    return loadProgress().completedLevels.includes(levelIndex);
}

function isLevelUnlocked(levelIndex) {
    if (levelIndex === 0) return true;
    const progress = loadProgress();
    if (levelIndex < LEVELS.length - 1) {
        return progress.completedLevels.includes(levelIndex - 1);
    }
    for (let i = 0; i < LEVELS.length  - 1; i++) {
        if (!progress.completedLevels.includes(i)) return false;
    }
    return true;
}

function saveCoins(amount) {
    const progress = loadProgress();
    if (amount > (progress.totalCoins || 0)) {
        progress.totalCoins = amount ;
    }
    storeProgress(progress);
}

function resetProgress() {
    localStorage.removeItem(SAVE_KEY);
}