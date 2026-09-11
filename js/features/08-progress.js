/* ========================================================
   SMOOTH PROGRESS ANIMATION
======================================================== */


/*
 * 获取当前真实进度
 */
function getAudioProgress() {

    if (
        !Number.isFinite(
            audio.duration
        )
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


/* ========================================================
   UPDATE PROGRESS VISUAL
======================================================== */

function updateProgressVisual() {

    const progress =
        getAudioProgress();


    /*
     * 圆形进度环
     *
     * 0deg = 正上方
     */
    progressOrbit.style.setProperty(
        "--progress",
        progress
    );


    /*
     * 进度球角度
     *
     * 0deg = 正上方
     *
     * 360deg = 一整圈
     */
    const angle =
        progress * 360;


    progressBallContainer.style.setProperty(
        "--progress-angle",
        `${angle}deg`
    );


    progressBallContainer.style.transform =
        `rotate(${angle}deg)`;

}


/* ========================================================
   ANIMATE PROGRESS
======================================================== */

function animateProgress() {

    /*
     * 停止
     */
    if (!isPlaying) {

        progressAnimationFrame =
            null;

        return;

    }


    /*
     * 每一帧读取 audio.currentTime
     */
    updateProgressVisual();


    /*
     * 下一帧
     */
    progressAnimationFrame =
        requestAnimationFrame(
            animateProgress
        );

}


/* ========================================================
   START
======================================================== */

function startProgressAnimation() {

    if (
        progressAnimationFrame !== null
    ) {

        return;

    }


    progressAnimationFrame =
        requestAnimationFrame(
            animateProgress
        );

}


/* ========================================================
   STOP
======================================================== */

function stopProgressAnimation() {

    if (
        progressAnimationFrame !== null
    ) {

        cancelAnimationFrame(
            progressAnimationFrame
        );

    }


    progressAnimationFrame =
        null;

}


/* ========================================================
   RESET
======================================================== */

function resetProgressVisual() {

    progressOrbit.style.setProperty(
        "--progress",
        "0"
    );


    progressBallContainer.style.setProperty(
        "--progress-angle",
        "0deg"
    );


    progressBallContainer.style.transform =
        "rotate(0deg)";

}


/* ========================================================
   COMPATIBILITY
======================================================== */


/*
 * 保留原来的函数名称。
 *
 * 如果其他代码调用：
 *
 * updateProgress()
 *
 * 仍然不会报错。
 */
function updateProgress() {

    updateProgressVisual();

}