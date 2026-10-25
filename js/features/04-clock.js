/*
 * SONORA — Clock Feature
 * Responsibility: clock rendering and timing only.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const clock = dom.get("clock");
    const slots = clock
        ? Array.from(clock.querySelectorAll(".clock-digit-slot"))
        : [];

    let values = Array(6).fill("0");
    let timer = null;

    function getValues() {
        const now = new Date();
        const time = [
            String(now.getHours()).padStart(2, "0"),
            String(now.getMinutes()).padStart(2, "0"),
            String(now.getSeconds()).padStart(2, "0")
        ].join("");

        return [...time];
    }

    function setDigit(slot, value) {
        if (!slot) return;

        const current = slot.querySelector(".current");
        const next = slot.querySelector(".next");
        if (!current || !next) return;

        current.textContent = value;
        next.textContent = value;
        current.classList.remove("is-exiting");
        next.classList.remove("is-entering");
    }

    function rollDigit(slot, value) {
        if (!slot) return;

        const current = slot.querySelector(".current");
        const next = slot.querySelector(".next");
        if (!current || !next) return;

        current.classList.remove("is-exiting");
        next.classList.remove("is-entering");
        next.textContent = value;

        void slot.offsetWidth;

        current.classList.add("is-exiting");
        next.classList.add("is-entering");

        window.setTimeout(() => {
            current.textContent = value;
            current.classList.remove("is-exiting");
            next.classList.remove("is-entering");
            next.textContent = value;
        }, 170);
    }

    function update() {
        if (!slots.length) return;

        const nextValues = getValues();

        slots.forEach((slot, index) => {
            if (values[index] === "0" &&
                slot.querySelector(".current")?.textContent === "0" &&
                slot.querySelector(".next")?.textContent === "0") {
                setDigit(slot, nextValues[index]);
            } else if (values[index] !== nextValues[index]) {
                rollDigit(slot, nextValues[index]);
            }
        });

        values = nextValues;
    }

    function initialize() {
        if (!slots.length) return;
        values = getValues();
        slots.forEach((slot, index) => setDigit(slot, values[index]));
    }

    function schedule() {
        clearTimeout(timer);

        const now = new Date();
        const delay = Math.max(50, 1000 - now.getMilliseconds());

        timer = window.setTimeout(() => {
            update();
            schedule();
        }, delay);
    }

    function start() {
        initialize();
        schedule();
    }

    start();

    Sonora.features.clock = Object.freeze({ start, update });
})();
