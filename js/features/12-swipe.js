/*
 * SONORA — Swipe Feature
 * Responsibility: horizontal touch navigation.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const events = Sonora.events;

    const player = dom.get("playerSystem");
    const record = dom.get("record");

    const settings = {
        threshold: 70
    };

    function start(event) {
        const touch = event.touches?.[0];
        if (!touch) return;

        state.swipe.startX = touch.clientX;
        state.swipe.startY = touch.clientY;
        state.swipe.fromRecord =
            Boolean(event.target.closest?.("#record"));
    }

    function end(event) {
        const touch = event.changedTouches?.[0];
        if (!touch) return;

        if (state.swipe.fromRecord) {
            state.swipe.fromRecord = false;
            return;
        }

        const dx = touch.clientX - state.swipe.startX;
        const dy = touch.clientY - state.swipe.startY;

        if (Math.abs(dx) <= settings.threshold ||
            Math.abs(dx) <= Math.abs(dy)) {
            return;
        }

        events.emit(
            dx < 0 ? "playback:next" : "playback:previous"
        );
    }

    player?.addEventListener("touchstart", start, { passive: true });
    player?.addEventListener("touchend", end, { passive: true });
})();
