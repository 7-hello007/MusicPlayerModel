/* ========================================================
   MOBILE SWIPE
======================================================== */


/*
 * Touch Start
 */
playerSystem.addEventListener(
    "touchstart",
    event => {

        if (!event.touches.length) {

            return;

        }


        /*
         * 保存起点
         */
        swipeStartX =
            event.touches[0].clientX;


        swipeStartY =
            event.touches[0].clientY;


        /*
         * 判断是不是从唱片区域开始
         */
        swipeFromRecord =
            event.target.closest(
                "#record"
            ) !== null;

    },
    {
        passive: true
    }
);


/* ========================================================
   TOUCH END
======================================================== */

playerSystem.addEventListener(
    "touchend",
    event => {

        if (!event.changedTouches.length) {

            return;

        }


        /*
         * 如果是在唱片区域，
         * Seek 系统负责处理。
         */
        if (swipeFromRecord) {

            swipeFromRecord = false;

            return;

        }


        /*
         * 终点
         */
        const endX =
            event.changedTouches[0].clientX;


        const endY =
            event.changedTouches[0].clientY;


        /*
         * 位移
         */
        const dx =
            endX -
            swipeStartX;


        const dy =
            endY -
            swipeStartY;


        /*
         * 判断是不是水平滑动
         */
        if (
            Math.abs(dx) > 70
            &&
            Math.abs(dx) >
                Math.abs(dy)
        ) {

            /*
             * 左滑
             * → 下一首
             */
            if (dx < 0) {

                nextTrack();

            }

            /*
             * 右滑
             * → 上一首
             */
            else {

                previousTrack();

            }

        }

    },
    {
        passive: true
    }
);