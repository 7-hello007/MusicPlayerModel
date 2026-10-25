/*
 * SONORA — Track List Feature
 * Responsibility: filtering and rendering the library UI.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const events = Sonora.events;
    const config = Sonora.config;
    const utils = Sonora.utils;

    function getFilteredTracks() {
        const keyword = state.search.keyword.trim().toLowerCase();

        if (!keyword) {
            return state.tracks.map((track, index) => ({ track, index }));
        }

        return state.tracks
            .map((track, index) => ({ track, index }))
            .filter(({ track }) =>
                track.title.toLowerCase().includes(keyword) ||
                track.artist.toLowerCase().includes(keyword)
            );
    }

    function createTrackElement(track, index) {
        const item = document.createElement("div");

        item.className =
            `track${index === state.currentIndex ? " active" : ""}`;

        item.dataset.index = String(index);

        item.innerHTML = `
            <div class="cover" style="--cover:${track.cover};"></div>
            <div class="track-info-small">
                <div class="track-name">${utils.escapeHtml(track.title)}</div>
                <div class="track-artist-small">${utils.escapeHtml(track.artist)}</div>
            </div>
            <div class="equalizer">
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
            </div>
            <div class="track-duration">${utils.formatTime(track.duration)}</div>
        `;

        item.addEventListener("click", () => {
            events.emit("track:request", { index });
        });

        return item;
    }

    function render() {
        const list = dom.get("trackList");
        const count = dom.get("trackCount");
        const empty = dom.get("emptyState");

        if (!list) return;

        list.replaceChildren();

        getFilteredTracks().forEach(({ track, index }) => {
            list.appendChild(createTrackElement(track, index));
        });

        if (count) count.textContent = `${state.tracks.length} songs`;
        empty?.classList.toggle("show", state.tracks.length === 0);
    }

    events.on(config.events.TRACKS_CHANGED, render);
    events.on(config.events.PLAYBACK_CHANGED, render);
    events.on(config.events.SEARCH_CHANGED, ({ keyword = "" }) => {
        state.search.keyword = keyword;
        render();
    });

    events.on("app:ready", render);

    Sonora.features.tracks = Object.freeze({ render });
})();
