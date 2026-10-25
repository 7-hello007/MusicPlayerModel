/*
 * SONORA — Module Bootstrap
 * -------------------------
 * The loader owns only module discovery and application bootstrap.
 * Feature modules never import/call each other directly.
 *
 * Runtime dependency rule:
 *     Module -> Sonora namespace -> shared service
 *
 * The manifest is configuration, not feature logic. Browser/file://
 * environments cannot enumerate a directory at runtime, so module
 * paths must be declared in one place.
 */
(() => {
    "use strict";

    const root = window.Sonora = window.Sonora || {};

    root.version = "2.0.0";

    root.config = {
        moduleRoot: "js/",
        modules: [
            "core/01-dom.js",
            "core/02-state.js",
            "core/03-utils.js",
            "features/04-clock.js",
            "features/05-import.js",
            "features/06-tracks.js",
            "features/07-playback.js",
            "features/08-progress.js",
            "features/09-seek.js",
            "features/10-search.js",
            "features/11-keyboard.js",
            "features/12-swipe.js",
            "features/13-particles.js",
            "features/14-volume.js"
        ],
        events: {
            READY: "app:ready",
            TRACKS_CHANGED: "tracks:changed",
            TRACK_SELECTED: "track:selected",
            PLAYBACK_CHANGED: "playback:changed",
            PROGRESS_CHANGED: "progress:changed",
            SEARCH_CHANGED: "search:changed"
        }
    };

    root.events = (() => {
        const listeners = new Map();

        function on(name, handler) {
            if (typeof handler !== "function") return () => {};

            if (!listeners.has(name)) {
                listeners.set(name, new Set());
            }

            listeners.get(name).add(handler);

            return () => off(name, handler);
        }

        function off(name, handler) {
            listeners.get(name)?.delete(handler);
        }

        function emit(name, detail = {}) {
            listeners.get(name)?.forEach(handler => {
                try {
                    handler(detail);
                } catch (error) {
                    console.error(`[SONORA] Event "${name}" failed`, error);
                }
            });
        }

        return Object.freeze({ on, off, emit });
    })();

    root.utils = root.utils || {};
    root.services = root.services || {};
    root.features = root.features || {};

    function loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src = `${root.config.moduleRoot}${path}`;
            script.async = false;
            script.dataset.sonoraModule = path;

            script.onload = resolve;
            script.onerror = () => reject(
                new Error(`[SONORA] Failed to load module: ${path}`)
            );

            document.head.appendChild(script);
        });
    }

    async function bootstrap() {
        console.log("[SONORA] Loading modules...");

        for (const modulePath of root.config.modules) {
            await loadScript(modulePath);
            console.log(`[SONORA] Loaded: ${modulePath}`);
        }

        root.events.emit(root.config.events.READY);

        console.log(`[SONORA] System Online — v${root.version}`);
    }

    root.bootstrap = bootstrap;
    bootstrap().catch(error => {
        console.error("[SONORA] Bootstrap failed", error);
    });
})();
