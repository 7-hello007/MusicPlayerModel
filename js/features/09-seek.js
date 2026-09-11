/* ========================================================
   RECORD SEEK
======================================================== */


/*
 * Pointer Down
 */
record.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();


        /*
         * 开始 Seek
         */
        isSeeking = true;

        didSeek = false;

        suppressNextClick = false;


        /*
         * 保存 Pointer 起点
         */
        seekPointerStartX =
            event.clientX;


        seekPointerStartY =
            event.clientY;


        /*
         * 拖动样式
         */
        record.classList.add(
            "dragging"
        );


        /*
         * 保存起始角度
         */
        const angle =
            getPointerAngle(event);


        lastPointerAngle =
            angle;


        /*
         * 清零累计角度
         */
        seekAccumulatedAngle =
            0;


        /*
         * 保存开始时的播放进度
         */
        seekStartProgress =
            Number.isFinite(
                audio.duration
            )
            &&
            audio.duration > 0

                ?

                audio.currentTime /
                audio.duration

                :

                0;


        /*
         * 尝试捕获 Pointer
         */
        try {

            record.setPointerCapture(
                event.pointerId
            );

        } catch (_) {}

    }
);


/* ========================================================
   POINTER MOVE
======================================================== */

record.addEventListener(
    "pointermove",
    event => {

        if (!isSeeking) {

            return;

        }


        /*
         * 判断是否真的开始拖动
         */
        if (!didSeek) {

            const dx =
                event.clientX -
                seekPointerStartX;


            const dy =
                event.clientY -
                seekPointerStartY;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            /*
             * 未达到最小移动距离
             */
            if (
                distance <
                SEEK_MOVE_THRESHOLD
            ) {

                return;

            }


            didSeek = true;

        }


        /*
         * 当前角度
         */
        const currentAngle =
            getPointerAngle(event);


        let delta =
            currentAngle -
            lastPointerAngle;


        /*
         * 处理 0° / 360° 跨越
         */
        if (
            delta >
            Math.PI
        ) {

            delta -=
                Math.PI * 2;

        }


        if (
            delta <
            -Math.PI
        ) {

            delta +=
                Math.PI * 2;

        }


        /*
         * 累计角度
         */
        seekAccumulatedAngle +=
            delta;


        lastPointerAngle =
            currentAngle;


        /*
         * 没有有效歌曲长度
         */
        if (
            !Number.isFinite(
                audio.duration
            )
            ||
            audio.duration <= 0
        ) {

            return;

        }


        /*
         * 一圈 = 一整首歌
         */
        const progressDelta =
            seekAccumulatedAngle /
            (Math.PI * 2);


        let progress =
            seekStartProgress +
            progressDelta;


        /*
         * 限制到 0 ~ 1
         */
        progress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );


        /*
         * 设置音频进度
         */
        audio.currentTime =
            progress *
            audio.duration;


        /*
         * 拖动唱片角度
         * 与歌曲进度同步
         */
        recordRotation =
            progress * 360;


        applyRecordRotation();


        /*
         * 立即刷新进度球
         */
        updateProgressVisual();

    }
);


/* ========================================================
   FINISH SEEK
======================================================== */

function finishSeek(event) {

    if (!isSeeking) {

        return;

    }


    /*
     * 如果真的发生了拖动，
     * 下一次 click 必须被吃掉。
     */
    if (didSeek) {

        suppressNextClick =
            true;

    }


    /*
     * Seek 结束
     */
    isSeeking = false;


    record.classList.remove(
        "dragging"
    );


    /*
     * 释放 Pointer Capture
     */
    try {

        if (
            record.hasPointerCapture(
                event.pointerId
            )
        ) {

            record.releasePointerCapture(
                event.pointerId
            );

        }

    } catch (_) {}


    didSeek = false;

}


/* ========================================================
   POINTER UP
======================================================== */

record.addEventListener(
    "pointerup",
    finishSeek
);


/* ========================================================
   POINTER CANCEL
======================================================== */

record.addEventListener(
    "pointercancel",
    finishSeek
);


/* ========================================================
   POINTER ANGLE
======================================================== */

function getPointerAngle(event) {

    const rect =
        record.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    return Math.atan2(
        event.clientY -
            centerY,
        event.clientX -
            centerX
    );

}