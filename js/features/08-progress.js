/*
 * SONORA — Progress Feature
 * Responsibility: circular progress visualization only.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const events = Sonora.events;
    const utils = Sonora.utils;

    const audio = dom.get("audio");
    const orbit = dom.get("progressOrbit");
    const ball = dom.get("progressBallContainer");

    function getProgress() {
        if (!audio ||
            !Number.isFinite(audio.duration) ||
            audio.duration <= 0) {
            return 0;
        }

        return utils.clamp(audio.currentTime / audio.duration);
    }

    function update() {
        const progress = getProgress();
        const angle = progress * 360;

        orbit?.style.setProperty("--progress", String(progress));
        ball?.style.setProperty("--progress-angle", `${angle}deg`);

        if (ball) ball.style.transform = `rotate(${angle}deg)`;

        events.emit("progress:changed", { progress, angle });
    }

    function animate() {
        if (!state.isPlaying) {
            state.progress.animationFrame = null;
            return;
        }

        update();
        state.progress.animationFrame = requestAnimationFrame(animate);
    }

    function start() {
        if (state.progress.animationFrame !== null) return;
        state.progress.animationFrame = requestAnimationFrame(animate);
    }

    function stop() {
        if (state.progress.animationFrame !== null) {
            cancelAnimationFrame(state.progress.animationFrame);
        }

        state.progress.animationFrame = null;
        update();
    }

    function reset() {
        orbit?.style.setProperty("--progress", "0");
        ball?.style.setProperty("--progress-angle", "0deg");

        if (ball) ball.style.transform = "rotate(0deg)";
    }

    events.on("progress:start", start);
    events.on("progress:stop", stop);
    events.on("progress:reset", reset);
    events.on("progress:update", update);
    Sonora.services.progress = Object.freeze({
        getProgress,
        update,
        start,
        stop,
        reset
    });
})();
