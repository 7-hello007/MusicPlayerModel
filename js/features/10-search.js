/*
 * SONORA — Search Feature
 * Responsibility: search UI and query state only.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const state = Sonora.state;
    const events = Sonora.events;
    const config = Sonora.config;

    const button = dom.get("searchButton");
    const box = dom.get("searchBox");
    const input = dom.get("searchInput");

    function setOpen(open) {
        box?.classList.toggle("open", Boolean(open));

        if (open) {
            window.setTimeout(() => input?.focus(), 50);
        }
    }

    function updateKeyword() {
        state.search.keyword = input?.value || "";
        events.emit(config.events.SEARCH_CHANGED, {
            keyword: state.search.keyword
        });
    }

    button?.addEventListener("click", event => {
        event.stopPropagation();
        setOpen(!box?.classList.contains("open"));
    });

    input?.addEventListener("input", updateKeyword);

    document.addEventListener("click", event => {
        if (box &&
            !box.contains(event.target) &&
            !button?.contains(event.target)) {
            setOpen(false);
        }
    });

    Sonora.features.search = Object.freeze({
        setOpen,
        updateKeyword
    });
})();
