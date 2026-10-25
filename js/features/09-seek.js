/*
 * SONORA — Seek Feature
 * Responsibility: pointer-based vinyl seeking.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const events = Sonora.events;
    const config = Sonora.config;
    const utils = Sonora.utils;

    const record = dom.get("record");
    const audio = dom.get("audio");

    function getPointerAngle(event) {
        if (!record) return 0;

        const rect = record.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        return Math.atan2(
            event.clientY - centerY,
            event.clientX - centerX
        );
    }

    function begin(event) {
        if (!record || !audio) return;

        event.stopPropagation();

        state.seek.active = true;
        state.seek.didSeek = false;
        state.seek.suppressNextClick = false;

        state.seek.pointerStartX = event.clientX;
        state.seek.pointerStartY = event.clientY;
        state.seek.lastPointerAngle = getPointerAngle(event);
        state.seek.accumulatedAngle = 0;

        state.seek.startProgress =
            Number.isFinite(audio.duration) && audio.duration > 0
                ? audio.currentTime / audio.duration
                : 0;

        record.classList.add("dragging");

        try {
            record.setPointerCapture(event.pointerId);
        } catch (_) {}
    }

    function move(event) {
        if (!state.seek.active || !audio) return;

        if (!state.seek.didSeek) {
            const dx = event.clientX - state.seek.pointerStartX;
            const dy = event.clientY - state.seek.pointerStartY;
            const distance = Math.hypot(dx, dy);

            if (distance < config.player.seekMoveThreshold) return;

            state.seek.didSeek = true;
        }

        const currentAngle = getPointerAngle(event);
        let delta = currentAngle - state.seek.lastPointerAngle;

        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        state.seek.accumulatedAngle += delta;
        state.seek.lastPointerAngle = currentAngle;

        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

        const progress =
            utils.clamp(
                state.seek.startProgress +
                state.seek.accumulatedAngle / (Math.PI * 2)
            );

        audio.currentTime = progress * audio.duration;

        state.record.rotation = progress * 360;

        events.emit("record:rotation", {
            rotation: state.record.rotation
        });

        events.emit(config.events.PROGRESS_CHANGED, { progress });
    }

    function finish(event) {
        if (!state.seek.active || !record) return;

        if (state.seek.didSeek) {
            state.seek.suppressNextClick = true;
        }

        state.seek.active = false;
        record.classList.remove("dragging");

        try {
            if (record.hasPointerCapture(event.pointerId)) {
                record.releasePointerCapture(event.pointerId);
            }
        } catch (_) {}

        state.seek.didSeek = false;
    }

    record?.addEventListener("pointerdown", begin);
    record?.addEventListener("pointermove", move);
    record?.addEventListener("pointerup", finish);
    record?.addEventListener("pointercancel", finish);

    Sonora.services.seek = Object.freeze({
        getPointerAngle
    });
})();
