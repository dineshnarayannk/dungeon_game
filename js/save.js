const SAVE_KEY = 'dungeon3d_progress';

function loadProgress() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
        return {
            completedLevels: []
        };
    }

    try {
        const data = JSON.parse(raw);
        return {
            completedLevels: Array.isArray(data.completedLevels) 
              ? data.completedLevels 
              : []
        };
    } catch (err) {
        return {
            completedLevels: []
        };
    }
}

function storeProgress(progress) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function saveProgress(levelIndex) {
    const progress = loadProgress();

    if (!progress.completedLevels.includes(levelIndex)) {
        progress.completedLevels.push(levelIndex);
        progress.completedLevels.sort((a,b) => a - b );
        storeProgress(progress);
    }
}

function isLevelComplete(levelIndex) {
    const progress = loadProgress();
    return progress.completedLevels.includes(levelIndex);
}

function isLevelUnlocked(levelIndex) {
    if (levelIndex===0) return true;

    const progress = loadProgress();

    // Normal levels unlock one by one
    if(levelIndex < LEVELS.length - 1){
        return progress.completedLevels.includes(levelIndex - 1); 
    }

    // Final boss unlocks only when all previous levels are complete
    for (let i = 0; i < LEVELS.length - 1; i++){
        if (!progress.completedLevels.includes(i)) {
            return false;
        }
    }

    return true;
}

function resetProgress() {
    localStorage.removeItem(SAVE_KEY);
}