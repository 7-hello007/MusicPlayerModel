/* ========================================================
   PLAY TRACK
======================================================== */

function playTrack(index) {

    if (
        index < 0
        ||
        index >= tracks.length
    ) {

        return;

    }


    const track =
        tracks[index];


    /*
     * 设置当前歌曲
     */
    currentIndex =
        index;


    /*
     * 新歌曲从头开始
     */
    recordRotation = 0;


    applyRecordRotation();


    /*
     * 设置音频
     */
    audio.src =
        track.url;


    /*
     * 更新标题
     */
    currentTitle.textContent =
        track.title;


    currentArtist.textContent =
        track.artist;


    /*
     * 清空旧进度
     */
    resetProgressVisual();


    /*
     * 播放
     */
    audio.play()
        .then(
            () => {

                isPlaying = true;

                updatePlayingState();

                renderTracks();

            }
        )
        .catch(
            () => {

                showToast(
                    "Unable to play this file"
                );

            }
        );

}


/* ========================================================
   PLAY / PAUSE
======================================================== */

function togglePlay() {

    /*
     * 没有歌曲
     */
    if (!tracks.length) {

        showToast(
            "Import some music first"
        );

        return;

    }


    /*
     * 没有当前歌曲
     */
    if (currentIndex === -1) {

        playTrack(0);

        return;

    }


    /*
     * 暂停状态 → 播放
     */
    if (audio.paused) {

        audio.play()
            .catch(
                () => {

                    showToast(
                        "Unable to play this file"
                    );

                }
            );

    } else {

        /*
         * 播放状态 → 暂停
         */
        audio.pause();

    }

}


/* ========================================================
   PLAYER CLICK
======================================================== */

playerSystem.addEventListener(
    "click",
    event => {

        /*
         * seek 完成后吃掉 click
         */
        if (suppressNextClick) {

            suppressNextClick =
                false;

            return;

        }


        /*
         * 正在拖动时不触发播放
         */
        if (isSeeking) {

            return;

        }


        togglePlay();

    }
);


/* ========================================================
   PREVIOUS
======================================================== */

prevZone.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        previousTrack();

    }
);


function previousTrack() {

    if (!tracks.length) {

        return;

    }


    /*
     * 当前歌曲已经播放超过 3 秒
     * → 从头播放
     */
    if (
        audio.currentTime > 3
    ) {

        audio.currentTime = 0;


        updateProgressVisual();


        return;

    }


    let index =
        currentIndex - 1;


    /*
     * 循环到最后一首
     */
    if (index < 0) {

        index =
            tracks.length - 1;

    }


    playTrack(index);

}


/* ========================================================
   NEXT
======================================================== */

nextZone.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        nextTrack();

    }
);


function nextTrack() {

    if (!tracks.length) {

        return;

    }


    let index =
        currentIndex + 1;


    /*
     * 循环到第一首
     */
    if (
        index >= tracks.length
    ) {

        index = 0;

    }


    playTrack(index);

}


/* ========================================================
   AUDIO EVENTS
======================================================== */


/*
 * 开始播放
 */
audio.addEventListener(
    "play",
    () => {

        isPlaying = true;

        updatePlayingState();

    }
);


/*
 * 暂停
 */
audio.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        updatePlayingState();

    }
);


/*
 * 播放结束
 */
audio.addEventListener(
    "ended",
    () => {

        nextTrack();

    }
);


/*
 * timeupdate 不再直接控制视觉进度。
 *
 * 进度球由 progress.js 的
 * requestAnimationFrame 控制。
 */
audio.addEventListener(
    "timeupdate",
    () => {

        /*
         * intentionally empty
         */

    }
);


/* ========================================================
   RECORD ROTATION
======================================================== */


/*
 * 设置唱片角度
 */
function applyRecordRotation() {

    record.style.transform =
        `rotate(${recordRotation}deg)`;

}


/*
 * 唱片旋转动画
 */
function animateRecord(timestamp) {

    /*
     * 不播放时停止
     */
    if (!isPlaying) {

        lastAnimationTime =
            null;


        recordAnimationFrame =
            null;


        return;

    }


    /*
     * 第一帧
     */
    if (
        lastAnimationTime === null
    ) {

        lastAnimationTime =
            timestamp;

    }


    const delta =
        timestamp -
        lastAnimationTime;


    lastAnimationTime =
        timestamp;


    /*
     * 增加角度
     */
    recordRotation +=
        RECORD_ROTATION_SPEED *
        delta /
        1000;


    /*
     * 避免数字无限增大
     */
    if (
        recordRotation >=
        360000
    ) {

        recordRotation =
            recordRotation %
            360;

    }


    applyRecordRotation();


    /*
     * 下一帧
     */
    recordAnimationFrame =
        requestAnimationFrame(
            animateRecord
        );

}


/*
 * 开始唱片动画
 */
function startRecordAnimation() {

    if (
        recordAnimationFrame !== null
    ) {

        return;

    }


    lastAnimationTime =
        null;


    recordAnimationFrame =
        requestAnimationFrame(
            animateRecord
        );

}


/*
 * 停止唱片动画
 */
function stopRecordAnimation() {

    if (
        recordAnimationFrame !== null
    ) {

        cancelAnimationFrame(
            recordAnimationFrame
        );

    }


    recordAnimationFrame =
        null;


    lastAnimationTime =
        null;


    /*
     * 不修改 recordRotation。
     *
     * 暂停在哪里，
     * 唱片就停在哪里。
     */
    applyRecordRotation();

}


/* ========================================================
   PLAYING VISUAL STATE
======================================================== */

function updatePlayingState() {

    playerSystem.classList.toggle(
        "playing",
        isPlaying
    );


    if (isPlaying) {

        startRecordAnimation();

        startProgressAnimation();

    } else {

        stopRecordAnimation();

        stopProgressAnimation();


        /*
         * 暂停瞬间再刷新一次
         */
        updateProgressVisual();

    }

}