/*
 * SONORA — Keyboard Feature
 * Responsibility: keyboard interaction and key-hold timing.
 * It sends commands through the event bus instead of calling playback/volume code.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const events = Sonora.events;
    const config = Sonora.config;
    const utils = Sonora.utils;

    const audio = dom.get("audio");

    const settings = {
        longPressDelay: 320,
        seekSpeed: 10,
        volumeStep: 0.05
    };

    function isTypingTarget(target) {
        if (!target) return false;

        return (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        );
    }

    function syncSeekVisual() {
        events.emit(config.events.PROGRESS_CHANGED);

        if (!audio ||
            !Number.isFinite(audio.duration) ||
            audio.duration <= 0) {
            return;
        }

        const progress = utils.clamp(audio.currentTime / audio.duration);

        state.record.rotation = progress * 360;
        events.emit("record:rotation", {
            rotation: state.record.rotation
        });
    }

    function stopSeekHold(commitShortPress) {
        const hold = state.keyboard.seekHold;
        if (!hold) return;

        if (hold.timer) clearTimeout(hold.timer);
        if (hold.raf) cancelAnimationFrame(hold.raf);

        state.keyboard.seekHold = null;

        if (!hold.longPress && commitShortPress) {
            events.emit(
                hold.key === "ArrowLeft"
                    ? "playback:previous"
                    : "playback:next"
            );
        }
    }

    function startSeekLoop() {
        const hold = state.keyboard.seekHold;
        if (!hold) return;

        hold.longPress = true;
        hold.lastTime = performance.now();

        const step = now => {
            const current = state.keyboard.seekHold;

            if (!current || !current.longPress) return;

            if (!audio ||
                !Number.isFinite(audio.duration) ||
                audio.duration <= 0) {
                current.lastTime = now;
                current.raf = requestAnimationFrame(step);
                return;
            }

            const deltaSeconds = (now - current.lastTime) / 1000;
            current.lastTime = now;

            audio.currentTime = utils.clamp(
                audio.currentTime +
                current.direction * settings.seekSpeed * deltaSeconds,
                0,
                audio.duration
            );

            syncSeekVisual();

            current.raf = requestAnimationFrame(step);
        };

        hold.raf = requestAnimationFrame(step);
    }

    function beginSeekHold(key, direction) {
        stopSeekHold(false);

        const hold = {
            key,
            direction,
            longPress: false,
            timer: null,
            raf: null,
            lastTime: 0
        };

        state.keyboard.seekHold = hold;

        hold.timer = setTimeout(() => {
            if (state.keyboard.seekHold?.key === key) {
                startSeekLoop();
            }
        }, settings.longPressDelay);
    }

    function handleKeyDown(event) {
        if (isTypingTarget(event.target)) return;

        if (event.code === "Space") {
            event.preventDefault();
            if (!event.repeat) events.emit("playback:toggle");
            return;
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();

            state.keyboard.volumeKeysHeld.add(event.key);

            events.emit("volume:change", {
                delta: event.key === "ArrowUp"
                    ? settings.volumeStep
                    : -settings.volumeStep
            });

            events.emit("volume:show");
            return;
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            if (event.repeat) return;

            beginSeekHold(
                event.key,
                event.key === "ArrowLeft" ? -1 : 1
            );
        }
    }

    function handleKeyUp(event) {
        if (isTypingTarget(event.target)) return;

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            state.keyboard.volumeKeysHeld.delete(event.key);

            if (!state.keyboard.volumeKeysHeld.size) {
                events.emit("volume:hide");
            }

            return;
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            const hold = state.keyboard.seekHold;

            if (hold?.key === event.key) {
                stopSeekHold(true);
            }
        }
    }

    function handleBlur() {
        stopSeekHold(false);
        state.keyboard.volumeKeysHeld.clear();
        events.emit("volume:hide");
    }

    function handleAudioEnded() {
        stopSeekHold(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    audio?.addEventListener("ended", handleAudioEnded);

    Sonora.features.keyboard = Object.freeze({
        stopSeekHold
    });
})();
