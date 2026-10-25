/*
 * SONORA — Import Feature
 * Responsibility: local audio selection, validation and library creation.
 * Communicates with other features only through the event bus/state service.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const store = Sonora.store;
    const utils = Sonora.utils;
    const events = Sonora.events;
    const config = Sonora.config;

    const supportedExtensions = Object.freeze([
        ".mp3", ".wav", ".flac", ".m4a",
        ".aac", ".ogg", ".oga", ".webm"
    ]);

    const importArea = dom.get("importArea");
    const fileInput = dom.get("fileInput");
    const addButton = dom.get("addButton");
    const audio = dom.get("audio");

    function isSupported(file) {
        const name = String(file?.name || "").toLowerCase();
        return supportedExtensions.some(ext => name.endsWith(ext));
    }

    function tokenize(text) {
        const tokens = [];
        const regex = /(\d+)|(\D+)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            tokens.push(match[1]
                ? { type: "number", value: Number(match[1]), raw: match[1] }
                : { type: "text", value: match[2] });
        }

        return tokens;
    }

    function charWeight(char) {
        const code = char.charCodeAt(0);

        if ((code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122) ||
            char.toUpperCase() !== char.toLowerCase()) {
            return 1;
        }

        return 2;
    }

    function compareText(a, b) {
        const length = Math.min(a.length, b.length);

        for (let i = 0; i < length; i += 1) {
            const charA = a[i];
            const charB = b[i];
            const weightA = charWeight(charA);
            const weightB = charWeight(charB);

            if (weightA !== weightB) return weightA - weightB;
            if (charA === charB) continue;

            const result = charA.localeCompare(charB, "zh-Hans-CN", {
                sensitivity: "base"
            });

            if (result !== 0) return result;
        }

        return a.length - b.length;
    }

    function compareTracks(trackA, trackB) {
        const tokensA = tokenize(String(trackA.title || ""));
        const tokensB = tokenize(String(trackB.title || ""));
        const length = Math.min(tokensA.length, tokensB.length);

        for (let i = 0; i < length; i += 1) {
            const a = tokensA[i];
            const b = tokensB[i];

            if (a.type !== b.type) {
                return a.type === "number" ? -1 : 1;
            }

            if (a.type === "number") {
                if (a.value !== b.value) return a.value - b.value;
                if (a.raw.length !== b.raw.length) return b.raw.length - a.raw.length;
            } else {
                const result = compareText(a.value, b.value);
                if (result !== 0) return result;
            }
        }

        return tokensA.length - tokensB.length;
    }

    function cleanupObjectUrls() {
        state.library.objectUrls.forEach(url => URL.revokeObjectURL(url));
        store.replaceObjectUrls([]);
    }

    function resetPlayerSource() {
        if (!audio) return;

        audio.pause();
        audio.removeAttribute("src");
        audio.load();

        store.setPlaying(false);
        store.resetRecord();
        store.resetProgress();
    }

    function createTrack(file, index) {
        const url = URL.createObjectURL(file);

        return {
            id: `${Date.now()}-${index}`,
            file,
            url,
            title: utils.guessTitle(file.name),
            artist: utils.guessArtist(file.name),
            duration: 0,
            cover: utils.coverGradients[index % utils.coverGradients.length]
        };
    }

    function loadMetadata(track) {
        const tempAudio = new Audio();
        tempAudio.preload = "metadata";
        tempAudio.src = track.url;

        tempAudio.addEventListener("loadedmetadata", () => {
            track.duration = tempAudio.duration;
            events.emit(config.events.TRACKS_CHANGED, { reason: "metadata" });
        }, { once: true });

        tempAudio.addEventListener("error", () => {
            events.emit(config.events.TRACKS_CHANGED, { reason: "metadata-error" });
        }, { once: true });
    }

    function importFiles(files) {
        const audioFiles = Array.from(files || []).filter(isSupported);

        if (!audioFiles.length) {
            utils.showToast("No supported music files found");
            return;
        }

        cleanupObjectUrls();

        const nextTracks = audioFiles
            .map(createTrack)
            .sort(compareTracks);

        store.replaceTracks(nextTracks);
        resetPlayerSource();

        if (importArea) importArea.style.display = "none";

        events.emit(config.events.TRACKS_CHANGED, {
            reason: "import",
            count: nextTracks.length
        });

        utils.showToast(`${nextTracks.length} songs imported`);

        nextTracks.forEach(loadMetadata);
    }

    addButton?.addEventListener("click", event => {
        event.stopPropagation();
        fileInput?.click();
    });

    importArea?.addEventListener("click", () => fileInput?.click());

    fileInput?.addEventListener("change", event => {
        importFiles(event.target.files);
        event.target.value = "";
    });

    importArea?.addEventListener("dragover", event => {
        event.preventDefault();
        importArea.classList.add("dragging");
    });

    importArea?.addEventListener("dragleave", () => {
        importArea.classList.remove("dragging");
    });

    importArea?.addEventListener("drop", event => {
        event.preventDefault();
        importArea.classList.remove("dragging");
        importFiles(event.dataTransfer?.files);
    });

    Sonora.services.library = Object.freeze({
        importFiles,
        cleanupObjectUrls
    });
})();
