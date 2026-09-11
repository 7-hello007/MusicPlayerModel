/* ========================================================
   KEYBOARD
======================================================== */

(() => {

    /*
     * 长按判定时间
     *
     * 超过这个时间没有松开，
     * 就认为是长按。
     */
    const LONG_PRESS_DELAY = 320;


    /*
     * 长按左右键时，
     * 每秒调整多少秒进度。
     *
     * 10 表示：
     * 长按 1 秒 ≈ 快进 / 快退 10 秒
     */
    const SEEK_SPEED = 10;


    /*
     * 上下键每次调整音量
     *
     * 0.05 = 5%
     */
    const VOLUME_STEP = 0.05;
    const volumeKeysHeld = new Set();


    /*
     * 当前左右键长按状态
     */
    let seekHold = null;


    /* ====================================================
       IS TYPING TARGET
    ==================================================== */

    function isTypingTarget(target) {

        if (!target) {
            return false;
        }

        const tag =
            target.tagName;

        return (
            tag === "INPUT"
            ||
            tag === "TEXTAREA"
            ||
            target.isContentEditable
        );

    }


    /* ====================================================
       GET PROGRESS
    ==================================================== */

    function getKeyboardProgress() {

        if (
            !Number.isFinite(audio.duration)
            ||
            audio.duration <= 0
        ) {

            return 0;

        }

        return Math.min(
            1,
            Math.max(
                0,
                audio.currentTime /
                audio.duration
            )
        );

    }


    /* ====================================================
       SYNC SEEK VISUAL
    ==================================================== */

    function syncSeekVisual() {

        /*
         * 刷新圆形进度球
         */
        updateProgressVisual();


        /*
         * 同步唱片角度
         */
        const progress =
            getKeyboardProgress();


        recordRotation =
            progress * 360;


        applyRecordRotation();

    }


    /* ====================================================
       STOP SEEK HOLD
    ==================================================== */

    function stopSeekHold(commitShortPress) {

        if (!seekHold) {
            return;
        }


        const {

            key,

            longPress,

            timer,

            raf

        } = seekHold;


        if (timer) {

            clearTimeout(timer);

        }


        if (raf) {

            cancelAnimationFrame(raf);

        }


        seekHold = null;


        /*
         * 如果没有进入长按，
         * 并且是正常松键，
         * 则执行短按切歌。
         */
        if (
            !longPress
            &&
            commitShortPress
        ) {

            if (key === "ArrowLeft") {

                previousTrack();

            }

            else if (key === "ArrowRight") {

                nextTrack();

            }

        }

    }


    /* ====================================================
       START SEEK LOOP
    ==================================================== */

    function startSeekLoop() {

        if (!seekHold) {
            return;
        }


        seekHold.longPress =
            true;


        seekHold.lastTime =
            performance.now();


        const step = (now) => {

            if (
                !seekHold
                ||
                !seekHold.longPress
            ) {

                return;

            }


            /*
             * 没有有效歌曲长度
             */
            if (
                !Number.isFinite(audio.duration)
                ||
                audio.duration <= 0
            ) {

                seekHold.lastTime =
                    now;


                seekHold.raf =
                    requestAnimationFrame(
                        step
                    );


                return;

            }


            const deltaSeconds =
                (now - seekHold.lastTime) /
                1000;


            seekHold.lastTime =
                now;


            let nextTime =
                audio.currentTime
                +
                seekHold.direction *
                SEEK_SPEED *
                deltaSeconds;


            nextTime =
                Math.max(
                    0,
                    Math.min(
                        audio.duration,
                        nextTime
                    )
                );


            audio.currentTime =
                nextTime;


            syncSeekVisual();


            seekHold.raf =
                requestAnimationFrame(
                    step
                );

        };


        seekHold.raf =
            requestAnimationFrame(
                step
            );

    }


    /* ====================================================
       BEGIN SEEK HOLD
    ==================================================== */

    function beginSeekHold(key, direction) {

        /*
         * 如果已经有按住状态，
         * 先取消，不触发短按。
         */
        if (seekHold) {

            stopSeekHold(false);

        }


        seekHold = {

            key,

            direction,

            longPress: false,

            timer: null,

            raf: null,

            lastTime: 0

        };


        seekHold.timer =
            setTimeout(
                () => {

                    if (
                        seekHold
                        &&
                        seekHold.key === key
                    ) {

                        startSeekLoop();

                    }

                },
                LONG_PRESS_DELAY
            );

    }


    /* ====================================================
       KEYDOWN
    ==================================================== */

    document.addEventListener(
        "keydown",
        event => {

            /*
             * 搜索框、输入框内不拦截
             */
            if (
                isTypingTarget(
                    event.target
                )
            ) {

                return;

            }


            /* ============================================
               SPACE
               播放 / 暂停
            ============================================ */

            if (
                event.code === "Space"
            ) {

                event.preventDefault();


                /*
                 * 防止长按空格连续切换
                 */
                if (event.repeat) {

                    return;

                }


                togglePlay();

                return;

            }


            /* ============================================
               ARROW UP
               音量 +
            ============================================ */

            if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();


                if (window.SonoraVolume) {

                    volumeKeysHeld.add(
                        event.key
                    );


                    window.SonoraVolume.change(
                        VOLUME_STEP
                    );


                    window.SonoraVolume.show();

                }

                return;

            }


            /* ============================================
               ARROW DOWN
               音量 -
            ============================================ */

            if (
                event.key === "ArrowDown"
            ) {

                event.preventDefault();


                if (window.SonoraVolume) {

                    volumeKeysHeld.add(
                        event.key
                    );


                    window.SonoraVolume.change(
                        -VOLUME_STEP
                    );


                    window.SonoraVolume.show();

                }

                return;

            }



            /* ============================================
               ARROW LEFT / RIGHT
               短按：上一首 / 下一首
               长按：当前歌曲快退 / 快进
            ============================================ */

            if (
                event.key === "ArrowLeft"
                ||
                event.key === "ArrowRight"
            ) {

                event.preventDefault();


                /*
                 * 忽略系统自动重复 keydown。
                 *
                 * 长按由我们自己计时器处理。
                 */
                if (event.repeat) {

                    return;

                }


                const direction =
                    event.key === "ArrowLeft"
                        ? -1
                        : 1;


                beginSeekHold(
                    event.key,
                    direction
                );

            }

        }
    );


    /* ====================================================
       KEYUP
    ==================================================== */

        document.addEventListener(
        "keyup",
        event => {

            if (
                isTypingTarget(
                    event.target
                )
            ) {

                return;

            }


            /* ============================================
               ARROW UP / DOWN
               松开后隐藏音量条
            ============================================ */

            if (
                event.key === "ArrowUp"
                ||
                event.key === "ArrowDown"
            ) {

                volumeKeysHeld.delete(
                    event.key
                );


                /*
                 * 两个键都松开后才隐藏。
                 *
                 * 这样即使同时按住上下，
                 * 松开其中一个，音量条也不会闪掉。
                 */
                if (
                    volumeKeysHeld.size === 0
                    &&
                    window.SonoraVolume
                ) {

                    window.SonoraVolume.hide();

                }

                return;

            }


            /* ============================================
               ARROW LEFT / RIGHT
            ============================================ */

            if (
                event.key === "ArrowLeft"
                ||
                event.key === "ArrowRight"
            ) {

                if (
                    seekHold
                    &&
                    seekHold.key === event.key
                ) {

                    stopSeekHold(true);

                }

            }

        }
    );


    /* ====================================================
       WINDOW BLUR
       防止切出窗口后卡住
    ==================================================== */

    window.addEventListener(
        "blur",
        () => {

            if (seekHold) {

                stopSeekHold(false);

            }

            volumeKeysHeld.clear();


            if (window.SonoraVolume) {

                window.SonoraVolume.hide();

            }

        }
    );


    /* ====================================================
       AUDIO ENDED
       歌曲结束时清理长按
    ==================================================== */

    audio.addEventListener(
        "ended",
        () => {

            if (seekHold) {

                stopSeekHold(false);

            }

        }
    );

})();