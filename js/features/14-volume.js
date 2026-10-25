/*
 * SONORA — Volume Feature
 * Responsibility: player volume, persistence and volume UI.
 * Keyboard and other modules communicate through events.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const events = Sonora.events;
    const utils = Sonora.utils;
    const config = Sonora.config;

    const audio = dom.get("audio");
    const control = dom.get("volumeControl");
    const track = dom.get("volumeTrack");
    const fill = dom.get("volumeFill");
    const thumb = dom.get("volumeThumb");
    const value = dom.get("volumeValue");

    if (!audio || !control || !track || !fill || !thumb || !value) {
        console.warn("[SONORA] Volume UI is unavailable.");
        return;
    }

    const settings = {
        storageKey: "sonora-volume",
        min: 0,
        max: 1,
        step: 0.05,
        initial: config.player.initialVolume
    };

    let volume = readStoredVolume();
    let dragging = false;

    function readStoredVolume() {
        const stored = Number(localStorage.getItem(settings.storageKey));

        return Number.isFinite(stored) &&
            stored >= settings.min &&
            stored <= settings.max
            ? stored
            : settings.initial;
    }

    function persist() {
        localStorage.setItem(
            settings.storageKey,
            String(volume)
        );
    }

    function updateUI() {
        const percentage = Math.round(volume * 100);

        fill.style.width = `${percentage}%`;
        thumb.style.left = `${percentage}%`;
        value.textContent = `${percentage}%`;

        control.setAttribute("aria-valuenow", String(percentage));
    }

    function apply(nextVolume) {
        if (!Number.isFinite(nextVolume)) return;

        volume = utils.clamp(
            nextVolume,
            settings.min,
            settings.max
        );

        audio.volume = volume;
        persist();
        updateUI();
    }

    function setFromPointer(clientX) {
        const rect = track.getBoundingClientRect();

        if (rect.width <= 0) return;

        const ratio =
            (clientX - rect.left) / rect.width;

        apply(ratio);
    }

    function show() {
        control.classList.add("keyboard-active");
    }

    function hide() {
        control.classList.remove("keyboard-active");
    }

    track.addEventListener("mousedown", event => {
        dragging = true;
        event.preventDefault();
        setFromPointer(event.clientX);
    });

    window.addEventListener("mousemove", event => {
        if (dragging) setFromPointer(event.clientX);
    });

    window.addEventListener("mouseup", () => {
        dragging = false;
    });

    track.addEventListener("click", event => {
        setFromPointer(event.clientX);
    });

    control.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            apply(volume - settings.step);
            event.preventDefault();
        } else if (event.key === "ArrowRight") {
            apply(volume + settings.step);
            event.preventDefault();
        } else if (event.key === "Home") {
            apply(settings.min);
            event.preventDefault();
        } else if (event.key === "End") {
            apply(settings.max);
            event.preventDefault();
        }
    });

    control.setAttribute("role", "slider");
    control.setAttribute("aria-valuemin", "0");
    control.setAttribute("aria-valuemax", "100");
    control.setAttribute("tabindex", "0");

    events.on("volume:change", ({ delta }) => apply(volume + delta));
    events.on("volume:show", show);
    events.on("volume:hide", hide);

    apply(volume);

    Sonora.services.volume = Object.freeze({
        get: () => volume,
        set: apply,
        change: delta => apply(volume + delta),
        show,
        hide
    });
})();
