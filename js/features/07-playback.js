/*
 * SONORA — Playback Feature
 * Responsibility: audio playback, track navigation and record rotation.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const store = Sonora.store;
    const events = Sonora.events;
    const config = Sonora.config;
    const utils = Sonora.utils;

    const audio = dom.get("audio");
    const record = dom.get("record");
    const player = dom.get("playerSystem");
    const title = dom.get("currentTitle");
    const artist = dom.get("currentArtist");

    function emitPlaybackChanged() {
        events.emit(config.events.PLAYBACK_CHANGED, {
            playing: state.isPlaying,
            index: state.currentIndex
        });
    }

    function applyRecordRotation() {
        if (record) {
            record.style.transform = `rotate(${state.record.rotation}deg)`;
        }
    }

    function stopAnimations() {
        if (state.record.animationFrame !== null) {
            cancelAnimationFrame(state.record.animationFrame);
        }

        state.record.animationFrame = null;
        state.record.lastAnimationTime = null;
    }

    function animateRecord(timestamp) {
        if (!state.isPlaying) {
            stopAnimations();
            return;
        }

        if (state.record.lastAnimationTime === null) {
            state.record.lastAnimationTime = timestamp;
        }

        const delta = timestamp - state.record.lastAnimationTime;
        state.record.lastAnimationTime = timestamp;

        state.record.rotation =
            (state.record.rotation +
                config.player.recordRotationSpeed * delta / 1000) % 360;

        applyRecordRotation();

        state.record.animationFrame =
            requestAnimationFrame(animateRecord);
    }

    function startRecordAnimation() {
        if (state.record.animationFrame !== null) return;

        state.record.lastAnimationTime = null;
        state.record.animationFrame = requestAnimationFrame(animateRecord);
    }

    function syncVisualState() {
        player?.classList.toggle("playing", state.isPlaying);

        if (state.isPlaying) {
            startRecordAnimation();
            events.emit("progress:start");
        } else {
            stopAnimations();
            events.emit("progress:stop");
        }

        emitPlaybackChanged();
    }

    function playTrack(index) {
        if (!audio || index < 0 || index >= state.tracks.length) return;

        const track = state.tracks[index];

        store.setCurrentIndex(index);
        state.record.rotation = 0;
        applyRecordRotation();

        audio.src = track.url;

        if (title) title.textContent = track.title;
        if (artist) artist.textContent = track.artist;

        events.emit("progress:reset");

        audio.play().catch(() => {
            utils.showToast("Unable to play this file");
        });
    }

    function togglePlay() {
        if (!state.tracks.length) {
            utils.showToast("Import some music first");
            return;
        }

        if (state.currentIndex === -1) {
            playTrack(0);
            return;
        }

        if (audio.paused) {
            audio.play().catch(() => {
                utils.showToast("Unable to play this file");
            });
        } else {
            audio.pause();
        }
    }

    function previousTrack() {
        if (!state.tracks.length) return;

        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            events.emit("progress:update");
            return;
        }

        const index =
            state.currentIndex <= 0
                ? state.tracks.length - 1
                : state.currentIndex - 1;

        playTrack(index);
    }

    function nextTrack() {
        if (!state.tracks.length) return;

        const index =
            state.currentIndex + 1 >= state.tracks.length
                ? 0
                : state.currentIndex + 1;

        playTrack(index);
    }

    function handlePlayerClick(event) {
        if (state.seek.suppressNextClick) {
            state.seek.suppressNextClick = false;
            return;
        }

        if (state.seek.active) return;
        togglePlay();
    }

    player?.addEventListener("click", handlePlayerClick);

    dom.get("prevZone")?.addEventListener("click", event => {
        event.stopPropagation();
        previousTrack();
    });

    dom.get("nextZone")?.addEventListener("click", event => {
        event.stopPropagation();
        nextTrack();
    });

    audio?.addEventListener("play", () => {
        store.setPlaying(true);
        syncVisualState();
    });

    audio?.addEventListener("pause", () => {
        store.setPlaying(false);
        syncVisualState();
    });

    audio?.addEventListener("ended", nextTrack);

    events.on("track:request", ({ index }) => {
        if (index === state.currentIndex) {
            togglePlay();
        } else {
            playTrack(index);
        }
    });

    events.on("playback:toggle", togglePlay);
    events.on("playback:next", nextTrack);
    events.on("playback:previous", previousTrack);
    events.on("record:rotation", applyRecordRotation);

    Sonora.services.playback = Object.freeze({
        playTrack,
        togglePlay,
        previousTrack,
        nextTrack,
        applyRecordRotation
    });
})();
