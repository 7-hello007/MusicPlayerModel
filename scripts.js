// scripts.js — 硬编码加载所有功能模块
const JS_FILES = [
    'core/01-dom.js',
    'core/02-state.js',
    'core/03-utils.js',
    'features/04-clock.js',
    'features/05-import.js',
    'features/06-tracks.js',
    'features/07-playback.js',
    'features/08-progress.js',
    'features/09-seek.js',
    'features/10-search.js',
    'features/11-keyboard.js',
    'features/12-swipe.js',
    'features/13-particles.js',
    'features/14-volume.js'
];

function loadScript(file) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/' + file;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load ' + file));
        document.head.appendChild(script);
    });
}

async function loadAllScripts() {
    console.log('Loading Sonora modules...');
    for (const file of JS_FILES) {
        try {
            await loadScript(file);
            console.log('Loaded:', file);
        } catch (e) {
            console.error(e);
            break;
        }
    }
    console.log('All scripts loaded.');
}

loadAllScripts();