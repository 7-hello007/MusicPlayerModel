/*
 * SONORA — Pure Utilities
 * Responsibility: reusable stateless helpers.
 */
(() => {
    "use strict";

    const coverGradients = [
        "linear-gradient(135deg,#8d62ff,#ff70c2)",
        "linear-gradient(135deg,#42dfff,#725eff)",
        "linear-gradient(135deg,#ff9b61,#ff5b9f)",
        "linear-gradient(135deg,#56e0bd,#7e6aff)",
        "linear-gradient(135deg,#ffcf70,#ff6d9f)",
        "linear-gradient(135deg,#6d75ff,#ba68ff)",
        "linear-gradient(135deg,#63e5ff,#ff74ba)",
        "linear-gradient(135deg,#a5ff8f,#5b91ff)"
    ];

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "00:00";

        const total = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(total / 60);
        const secs = total % 60;

        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    let toastTimer = null;

    function showToast(message) {
        const toast = Sonora.dom.get("toast");
        if (!toast) return;

        toast.textContent = String(message);
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 1800);
    }

    function getFileNameWithoutExtension(name) {
        return String(name || "").replace(/\.[^/.]+$/, "");
    }

    function guessArtist(fileName) {
        const clean = getFileNameWithoutExtension(fileName);

        if (/^\d/.test(clean)) {
            const index = clean.indexOf(" - ");
            return index !== -1
                ? clean.substring(index + 3).trim()
                : "Local Artist";
        }

        const parts = clean.split(" - ");
        return parts.length >= 2
            ? parts[0].trim()
            : "Local Artist";
    }

    function guessTitle(fileName) {
        const clean = getFileNameWithoutExtension(fileName);

        if (/^\d/.test(clean)) {
            const index = clean.indexOf(" - ");
            return index !== -1
                ? clean.substring(0, index).trim()
                : clean;
        }

        const parts = clean.split(" - ");

        return parts.length >= 2
            ? parts.slice(1).join(" - ").trim()
            : clean;
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = String(text ?? "");
        return div.innerHTML;
    }

    function clamp(value, min = 0, max = 1) {
        return Math.max(min, Math.min(max, value));
    }

    Sonora.utils = Object.freeze({
        coverGradients: Object.freeze(coverGradients),
        formatTime,
        showToast,
        getFileNameWithoutExtension,
        guessArtist,
        guessTitle,
        escapeHtml,
        clamp
    });
})();
