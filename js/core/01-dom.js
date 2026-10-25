/*
 * SONORA — DOM Service
 * Responsibility: resolve and expose DOM references only.
 * No feature logic. No cross-module calls.
 */
(() => {
    "use strict";

    const selectors = {
        audio: "#audio",
        record: "#record",
        playerSystem: "#playerSystem",
        currentTitle: "#currentTitle",
        currentArtist: "#currentArtist",
        progressOrbit: "#progressOrbit",
        progressBallContainer: "#progressBallContainer",
        trackList: "#trackList",
        trackCount: "#trackCount",
        emptyState: "#emptyState",
        fileInput: "#fileInput",
        importArea: "#importArea",
        addButton: "#addButton",
        searchButton: "#searchButton",
        searchBox: "#searchBox",
        searchInput: "#searchInput",
        prevZone: ".prev-zone",
        nextZone: ".next-zone",
        toast: "#toast",
        clock: "#clock",
        particleCanvas: "#particleCanvas",
        trackInfo: "#trackInfo",
        volumeControl: "#volumeControl",
        volumeTrack: ".volume-track",
        volumeFill: "#volumeFill",
        volumeThumb: "#volumeThumb",
        volumeValue: "#volumeValue"
    };

    const elements = {};

    for (const [name, selector] of Object.entries(selectors)) {
        elements[name] =
            selector.startsWith("#")
                ? document.getElementById(selector.slice(1))
                : document.querySelector(selector);
    }

    function require(name) {
        const element = elements[name];

        if (!element) {
            throw new Error(`[SONORA] Required DOM element not found: ${name}`);
        }

        return element;
    }

    Sonora.dom = Object.freeze({
        get: name => elements[name] || null,
        require,
        all: Object.freeze({ ...elements })
    });

    Sonora.events.emit("dom:ready", { dom: Sonora.dom });
})();
