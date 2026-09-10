/* ========================================================
   SONORA — Volume Control
======================================================== */

(() => {

    const audio =
        document.getElementById("audio");

    const trackInfo =
        document.getElementById("trackInfo");

    const volumeControl =
        document.getElementById("volumeControl");

    const volumeTrack =
        document.querySelector(".volume-track");

    const volumeFill =
        document.getElementById("volumeFill");

    const volumeThumb =
        document.getElementById("volumeThumb");

    const volumeValue =
        document.getElementById("volumeValue");


    if (
        !audio ||
        !trackInfo ||
        !volumeControl ||
        !volumeTrack ||
        !volumeFill ||
        !volumeThumb ||
        !volumeValue
    ) {
        console.warn(
            "[SONORA] Volume elements not found."
        );

        return;
    }


    /* ====================================================
       STATE
    ==================================================== */

    const STORAGE_KEY =
        "sonora-volume";

    let volume =
        Number(
            localStorage.getItem(STORAGE_KEY)
        );

    if (
        !Number.isFinite(volume) ||
        volume < 0 ||
        volume > 1
    ) {
        volume = 0.5;
    }


    let dragging = false;


    /* ====================================================
       APPLY VOLUME
    ==================================================== */

    function applyVolume() {

        /*
         * HTMLAudioElement.volume 是播放器自己的音量，
         * 不会修改 Windows / HarmonyOS 系统音量。
         *
         * 100% = 当前系统音量
         * 50%  = 当前系统音量 × 0.5
         * 0%   = 静音
         */

        audio.volume = volume;

        localStorage.setItem(
            STORAGE_KEY,
            String(volume)
        );

        updateUI();

        /* ====================================================
        EXPOSE API FOR KEYBOARD
        ==================================================== */

        window.SonoraVolume = {

            get: () => volume,

            set: (value) => {

                if (!Number.isFinite(value)) {
                    return;
                }

                volume =
                    Math.max(
                        0,
                        Math.min(1, value)
                    );

                applyVolume();

            },

            change: (delta) => {

                if (!Number.isFinite(delta)) {
                    return;
                }

                volume =
                    Math.max(
                        0,
                        Math.min(1, volume + delta)
                    );

                applyVolume();

            },

            /*
            * 键盘操作时显示音量条
            */
            show: () => {

                volumeControl.classList.add(
                    "keyboard-active"
                );

            },

            /*
            * 键盘松开后隐藏音量条
            */
            hide: () => {

                volumeControl.classList.remove(
                    "keyboard-active"
                );

            }

        };
    }


    /* ====================================================
       UPDATE UI
    ==================================================== */

    function updateUI() {

        const percentage =
            Math.round(volume * 100);

        volumeFill.style.width =
            `${percentage}%`;

        volumeThumb.style.left =
            `${percentage}%`;

        volumeValue.textContent =
            `${percentage}%`;

        volumeControl
            .setAttribute(
                "aria-valuenow",
                String(percentage)
            );
    }


    /* ====================================================
       CALCULATE POSITION
    ==================================================== */

    function setVolumeFromPointer(clientX) {

        const rect =
            volumeTrack.getBoundingClientRect();

        if (rect.width <= 0) {
            return;
        }

        let ratio =
            (clientX - rect.left) /
            rect.width;

        ratio =
            Math.max(
                0,
                Math.min(1, ratio)
            );

        volume = ratio;

        applyVolume();
    }


    /* ====================================================
       MOUSE DOWN
    ==================================================== */

    volumeTrack.addEventListener(
        "mousedown",
        (event) => {

            dragging = true;

            event.preventDefault();

            setVolumeFromPointer(
                event.clientX
            );
        }
    );


    /* ====================================================
       MOUSE MOVE
    ==================================================== */

    window.addEventListener(
        "mousemove",
        (event) => {

            if (!dragging) {
                return;
            }

            setVolumeFromPointer(
                event.clientX
            );
        }
    );


    /* ====================================================
       MOUSE UP
    ==================================================== */

    window.addEventListener(
        "mouseup",
        () => {

            dragging = false;

        }
    );


    /* ====================================================
       CLICK TRACK
    ==================================================== */

    volumeTrack.addEventListener(
        "click",
        (event) => {

            setVolumeFromPointer(
                event.clientX
            );

        }
    );


    /* ====================================================
       KEYBOARD ACCESSIBILITY
    ==================================================== */

    volumeControl.addEventListener(
        "keydown",
        (event) => {

            const step = 0.05;

            if (event.key === "ArrowLeft") {

                volume =
                    Math.max(
                        0,
                        volume - step
                    );

                applyVolume();

                event.preventDefault();
            }

            else if (event.key === "ArrowRight") {

                volume =
                    Math.min(
                        1,
                        volume + step
                    );

                applyVolume();

                event.preventDefault();
            }

            else if (event.key === "Home") {

                volume = 0;

                applyVolume();

                event.preventDefault();
            }

            else if (event.key === "End") {

                volume = 1;

                applyVolume();

                event.preventDefault();
            }
        }
    );


    /* ====================================================
       INITIALIZE
    ==================================================== */

    volumeControl.setAttribute(
        "role",
        "slider"
    );

    volumeControl.setAttribute(
        "aria-valuemin",
        "0"
    );

    volumeControl.setAttribute(
        "aria-valuemax",
        "100"
    );

    volumeControl.setAttribute(
        "tabindex",
        "0"
    );

    applyVolume();

})();