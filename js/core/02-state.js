/*
 * SONORA — State Store
 * Responsibility: application state and state transitions.
 * No DOM access. No feature calls.
 */
(() => {
    "use strict";

    const config = {
        seekMoveThreshold: 5,
        recordRotationSpeed: 360 / 12,
        initialVolume: 0.5
    };

    const state = {
        tracks: [],
        currentIndex: -1,
        isPlaying: false,

        seek: {
            active: false,
            didSeek: false,
            suppressNextClick: false,
            startProgress: 0,
            accumulatedAngle: 0,
            lastPointerAngle: 0,
            pointerStartX: 0,
            pointerStartY: 0
        },

        record: {
            rotation: 0,
            lastAnimationTime: null,
            animationFrame: null
        },

        progress: {
            animationFrame: null
        },

        library: {
            objectUrls: []
        },

        swipe: {
            startX: 0,
            startY: 0,
            fromRecord: false
        },

        search: {
            keyword: ""
        },

        keyboard: {
            seekHold: null,
            volumeKeysHeld: new Set()
        }
    };

    function replaceTracks(nextTracks) {
        state.tracks = Array.isArray(nextTracks) ? nextTracks : [];
        state.currentIndex = -1;
    }

    function setCurrentIndex(index) {
        state.currentIndex = index;
    }

    function setPlaying(value) {
        state.isPlaying = Boolean(value);
    }

    function resetSeek() {
        Object.assign(state.seek, {
            active: false,
            didSeek: false,
            suppressNextClick: false,
            startProgress: 0,
            accumulatedAngle: 0,
            lastPointerAngle: 0,
            pointerStartX: 0,
            pointerStartY: 0
        });
    }

    function resetRecord() {
        state.record.rotation = 0;
        state.record.lastAnimationTime = null;
    }

    function resetProgress() {
        state.progress.animationFrame = null;
    }

    function replaceObjectUrls(urls) {
        state.library.objectUrls = Array.isArray(urls) ? urls : [];
    }

    Sonora.config.player = Object.freeze(config);
    Sonora.state = state;

    Sonora.store = Object.freeze({
        replaceTracks,
        setCurrentIndex,
        setPlaying,
        resetSeek,
        resetRecord,
        resetProgress,
        replaceObjectUrls
    });
})();
