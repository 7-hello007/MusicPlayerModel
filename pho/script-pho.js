/* ========================================================
   DOM
======================================================== */

const audio =
    document.getElementById("audio");

const record =
    document.getElementById("record");

const playerSystem =
    document.getElementById("playerSystem");

const currentTitle =
    document.getElementById("currentTitle");

const currentArtist =
    document.getElementById("currentArtist");

const progressOrbit =
    document.getElementById("progressOrbit");

const progressBallContainer =
    document.getElementById(
        "progressBallContainer"
    );

const trackList =
    document.getElementById("trackList");

const trackCount =
    document.getElementById("trackCount");

const emptyState =
    document.getElementById("emptyState");

const fileInput =
    document.getElementById("fileInput");

const importArea =
    document.getElementById("importArea");

const addButton =
    document.getElementById("addButton");

const searchButton =
    document.getElementById("searchButton");

const searchBox =
    document.getElementById("searchBox");

const searchInput =
    document.getElementById("searchInput");

const prevZone =
    document.querySelector(".prev-zone");

const nextZone =
    document.querySelector(".next-zone");

const toast =
    document.getElementById("toast");


/* ========================================================
   STATE
======================================================== */

let tracks = [];

let currentIndex = -1;

let isPlaying = false;


/*
 * 是否正在拖动唱片
 */
let isSeeking = false;


/*
 * 是否真的发生了拖动
 */
let didSeek = false;


/*
 * 防止 seek 完成之后 click
 * 再次触发播放 / 暂停。
 */
let suppressNextClick = false;


/*
 * 拖动相关
 */

let seekStartProgress = 0;

let seekAccumulatedAngle = 0;

let lastPointerAngle = 0;


/*
 * 唱片旋转角度
 */
let recordRotation = 0;


/*
 * 唱片动画时间戳
 */
let lastAnimationTime = null;


/*
 * 唱片旋转速度。
 *
 * 12 秒一圈。
 */
const RECORD_ROTATION_SPEED =
    360 / 12;


/*
 * 唱片 requestAnimationFrame
 */
let recordAnimationFrame = null;


/*
 * 进度条 requestAnimationFrame
 *
 * 这是本次修改最重要的部分。
 *
 * audio.timeupdate：
 *     不够频繁
 *
 * requestAnimationFrame：
 *     ~60 FPS
 *
 * 所以进度球不会再一格一格跳。
 */
let progressAnimationFrame = null;


/*
 * Object URLs
 */
let objectUrls = [];


/* ========================================================
   COLORS
======================================================== */

const coverGradients = [

    "linear-gradient(135deg,#8d62ff,#ff70c2)",

    "linear-gradient(135deg,#42dfff,#725eff)",

    "linear-gradient(135deg,#ff9b61,#ff5b9f)",

    "linear-gradient(135deg,#56e0bd,#7e6aff)",

    "linear-gradient(135deg,#ffcf70,#ff6d9f)",

    "linear-gradient(135deg,#6d75ff,#ba68ff)",

    "linear-gradient(135deg,#63e5ff,#ff74ba)",

    "linear-gradient(135deg,#a5ff8f,#5b91ff)"

];


/* ========================================================
   UTILITY
======================================================== */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    seconds =
        Math.max(
            0,
            Math.floor(seconds)
        );

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(secs).padStart(2, "0")
    );
}


function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            1800
        );

}


function getFileNameWithoutExtension(name) {

    return name.replace(
        /\.[^/.]+$/,
        ""
    );

}


function guessArtist(fileName) {

    const clean =
        getFileNameWithoutExtension(
            fileName
        );

    const parts =
        clean.split(" - ");

    if (parts.length >= 2) {

        return parts[0].trim();

    }

    return "Local Artist";

}


function guessTitle(fileName) {

    const clean =
        getFileNameWithoutExtension(
            fileName
        );

    const parts =
        clean.split(" - ");

    if (parts.length >= 2) {

        return parts
            .slice(1)
            .join(" - ")
            .trim();

    }

    return clean;

}


/* ========================================================
   IMPORT
======================================================== */

importArea.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);


addButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    event => {

        const files =
            Array.from(
                event.target.files
            );

        importFiles(files);

        fileInput.value = "";

    }
);


importArea.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        importArea.classList.add(
            "dragging"
        );

    }
);


importArea.addEventListener(
    "dragleave",
    () => {

        importArea.classList.remove(
            "dragging"
        );

    }
);


importArea.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        importArea.classList.remove(
            "dragging"
        );

        const files =
            Array.from(
                event.dataTransfer.files
            );

        importFiles(files);

    }
);


/* ========================================================
   IMPORT FILES
======================================================== */

function importFiles(files) {

    const supportedExtensions = [

        ".mp3",
        ".wav",
        ".flac",
        ".m4a",
        ".aac",
        ".ogg",
        ".oga",
        ".webm"

    ];


    const audioFiles =
        files.filter(
            file => {

                const name =
                    file.name.toLowerCase();

                return supportedExtensions.some(
                    ext =>
                        name.endsWith(ext)
                );

            }
        );


    if (!audioFiles.length) {

        showToast(
            "No supported music files found"
        );

        return;

    }


    /*
     * 清理旧 Object URL
     */

    objectUrls.forEach(
        url =>
            URL.revokeObjectURL(url)
    );

    objectUrls = [];


    /*
     * 新导入的音乐替换当前 Library。
     */

    tracks =
        audioFiles.map(
            (file, index) => {

                const url =
                    URL.createObjectURL(
                        file
                    );

                objectUrls.push(url);

                return {

                    id:
                        Date.now()
                        +
                        "-"
                        +
                        index,

                    file,

                    url,

                    title:
                        guessTitle(
                            file.name
                        ),

                    artist:
                        guessArtist(
                            file.name
                        ),

                    duration: 0,

                    cover:
                        coverGradients[
                            index %
                            coverGradients.length
                        ]

                };

            }
        );


    /*
     * 重置播放器
     */

    currentIndex = -1;

    audio.pause();

    audio.removeAttribute("src");

    audio.load();

    isPlaying = false;

    recordRotation = 0;

    applyRecordRotation();

    stopProgressAnimation();

    resetProgressVisual();


    /*
     * 隐藏 Import 区域
     */

    importArea.style.display =
        "none";


    renderTracks();


    showToast(
        `${tracks.length} songs imported`
    );


    /*
     * 读取歌曲长度
     */

    tracks.forEach(
        track => {

            const tempAudio =
                new Audio();

            tempAudio.preload =
                "metadata";

            tempAudio.src =
                track.url;


            tempAudio.addEventListener(
                "loadedmetadata",
                () => {

                    track.duration =
                        tempAudio.duration;

                    renderTracks();

                },
                {
                    once: true
                }
            );

        }
    );

}


/* ========================================================
   RENDER TRACKS
======================================================== */

function renderTracks() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        tracks.filter(
            track => {

                if (!keyword) {
                    return true;
                }

                return (
                    track.title
                        .toLowerCase()
                        .includes(keyword)
                    ||
                    track.artist
                        .toLowerCase()
                        .includes(keyword)
                );

            }
        );


    trackList.innerHTML = "";


    filtered.forEach(
        track => {

            const realIndex =
                tracks.indexOf(track);


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "track"
                +
                (
                    realIndex === currentIndex
                        ? " active"
                        : ""
                );


            item.dataset.index =
                realIndex;


            item.innerHTML = `

                <div
                    class="cover"
                    style="
                        --cover:${track.cover};
                    "
                ></div>

                <div class="track-info-small">

                    <div class="track-name">
                        ${escapeHtml(track.title)}
                    </div>

                    <div class="track-artist-small">
                        ${escapeHtml(track.artist)}
                    </div>

                </div>

                <div class="equalizer">

                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>

                </div>

                <div class="track-duration">
                    ${formatTime(track.duration)}
                </div>

            `;


            /*
             * 重要修改：
             *
             * 第一次点击：
             *     当前歌曲不是这首
             *     → 播放
             *
             * 再次点击同一首：
             *     → 暂停
             *
             * 再点击：
             *     → 继续播放
             */
            item.addEventListener(
                "click",
                () => {

                    handleTrackClick(
                        realIndex
                    );

                }
            );


            trackList.appendChild(
                item
            );

        }
    );


    trackCount.textContent =
        `${tracks.length} songs`;


    emptyState.classList.toggle(
        "show",
        tracks.length === 0
    );

}


/* ========================================================
   TRACK CLICK
======================================================== */

function handleTrackClick(index) {

    if (
        index < 0
        ||
        index >= tracks.length
    ) {

        return;

    }


    /*
     * 点击当前正在播放的歌曲
     * → 暂停
     */
    if (
        index === currentIndex
        &&
        !audio.paused
    ) {

        audio.pause();

        return;

    }


    /*
     * 点击当前已经暂停的歌曲
     * → 继续播放
     */
    if (
        index === currentIndex
        &&
        audio.paused
    ) {

        audio.play()
            .catch(
                () => {

                    showToast(
                        "Unable to play this file"
                    );

                }
            );

        return;

    }


    /*
     * 点击其他歌曲
     * → 切歌并播放
     */
    playTrack(index);

}


/* ========================================================
   ESCAPE HTML
======================================================== */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


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


    currentIndex =
        index;


    /*
     * 新歌曲从头开始。
     */
    recordRotation = 0;

    applyRecordRotation();


    audio.src =
        track.url;


    currentTitle.textContent =
        track.title;

    currentArtist.textContent =
        track.artist;


    /*
     * 清空旧进度
     */
    resetProgressVisual();


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

    if (!tracks.length) {

        showToast(
            "Import some music first"
        );

        return;

    }


    if (currentIndex === -1) {

        playTrack(0);

        return;

    }


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
         * 如果刚刚完成 seek，
         * 吃掉这个 click。
         */
        if (suppressNextClick) {

            suppressNextClick =
                false;

            return;

        }


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


    if (
        audio.currentTime > 3
    ) {

        audio.currentTime = 0;

        updateProgressVisual();

        return;

    }


    let index =
        currentIndex - 1;


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

audio.addEventListener(
    "play",
    () => {

        isPlaying = true;

        updatePlayingState();

    }
);


audio.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        updatePlayingState();

    }
);


audio.addEventListener(
    "ended",
    () => {

        nextTrack();

    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        /*
         * 不再在这里直接移动进度球。
         *
         * 真正的进度动画由 requestAnimationFrame
         * 负责。
         */

    }
);


/* ========================================================
   RECORD ROTATION
======================================================== */

function applyRecordRotation() {

    record.style.transform =
        `rotate(${recordRotation}deg)`;

}


function animateRecord(timestamp) {

    if (!isPlaying) {

        lastAnimationTime =
            null;

        recordAnimationFrame =
            null;

        return;

    }


    if (lastAnimationTime === null) {

        lastAnimationTime =
            timestamp;

    }


    const delta =
        timestamp -
        lastAnimationTime;


    lastAnimationTime =
        timestamp;


    recordRotation +=
        RECORD_ROTATION_SPEED *
        delta /
        1000;


    if (
        recordRotation >=
        360000
    ) {

        recordRotation =
            recordRotation %
            360;

    }


    applyRecordRotation();


    recordAnimationFrame =
        requestAnimationFrame(
            animateRecord
        );

}


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
     * 暂停在哪里，就停在哪里。
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
         * 暂停瞬间再刷新一次，
         * 保证小球停在准确位置。
         */
        updateProgressVisual();

    }

}


/* ========================================================
   SMOOTH PROGRESS ANIMATION
======================================================== */

/*
 * 核心修改：
 *
 * 原来的：
 *
 * audio "timeupdate"
 *       ↓
 * updateProgress()
 *
 * timeupdate 频率比较低，
 * 所以视觉上会：
 *
 *     ●    ●    ●    ●
 *
 * 而不是连续运动。
 *
 *
 * 现在：
 *
 * requestAnimationFrame
 *       ↓
 * audio.currentTime
 *       ↓
 * progress
 *       ↓
 * progress ball
 *
 * 大约 60 FPS。
 */


/*
 * 根据当前音频时间计算真实进度。
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


/*
 * 更新进度视觉。
 *
 * 不依赖 timeupdate。
 */
function updateProgressVisual() {

    const progress =
        getAudioProgress();


    /*
     * 进度圆环。
     *
     * 0deg = 正上方
     */
    progressOrbit.style.setProperty(
        "--progress",
        progress
    );


    /*
     * 小球：
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


/*
 * 每一帧刷新进度球。
 */
function animateProgress() {

    if (!isPlaying) {

        progressAnimationFrame =
            null;

        return;

    }


    updateProgressVisual();


    progressAnimationFrame =
        requestAnimationFrame(
            animateProgress
        );

}


/*
 * 开始进度动画。
 */
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


/*
 * 停止进度动画。
 */
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


/*
 * 重置进度视觉。
 */
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


/*
 * 保留原函数名称，
 * 防止其他地方调用时报错。
 */
function updateProgress() {

    updateProgressVisual();

}


/* ========================================================
   RECORD SEEK
======================================================== */

let seekPointerStartX = 0;

let seekPointerStartY = 0;

const SEEK_MOVE_THRESHOLD = 5;


record.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();


        isSeeking = true;

        didSeek = false;

        suppressNextClick = false;


        seekPointerStartX =
            event.clientX;

        seekPointerStartY =
            event.clientY;


        record.classList.add(
            "dragging"
        );


        const angle =
            getPointerAngle(event);


        lastPointerAngle =
            angle;


        seekAccumulatedAngle =
            0;


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
         * 判断是否真正开始拖动。
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


            if (
                distance <
                SEEK_MOVE_THRESHOLD
            ) {

                return;

            }


            didSeek = true;

        }


        const currentAngle =
            getPointerAngle(event);


        let delta =
            currentAngle -
            lastPointerAngle;


        /*
         * 处理 0° / 360° 跨越。
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


        seekAccumulatedAngle +=
            delta;


        lastPointerAngle =
            currentAngle;


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
         * 一圈 = 一首歌。
         */
        const progressDelta =
            seekAccumulatedAngle /
            (Math.PI * 2);


        let progress =
            seekStartProgress +
            progressDelta;


        progress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );


        audio.currentTime =
            progress *
            audio.duration;


        /*
         * 拖动唱片时：
         *
         * 唱片角度
         * =
         * 当前歌曲进度
         */
        recordRotation =
            progress * 360;


        applyRecordRotation();


        /*
         * 立即刷新进度球。
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


    if (didSeek) {

        suppressNextClick =
            true;

    }


    isSeeking = false;


    record.classList.remove(
        "dragging"
    );


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


record.addEventListener(
    "pointerup",
    finishSeek
);


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


/* ========================================================
   SEARCH
======================================================== */

searchButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        searchBox.classList.toggle(
            "open"
        );


        if (
            searchBox.classList.contains(
                "open"
            )
        ) {

            setTimeout(
                () => {

                    searchInput.focus();

                },
                50
            );

        }

    }
);


searchInput.addEventListener(
    "input",
    () => {

        renderTracks();

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            !searchBox.contains(
                event.target
            )
            &&
            !searchButton.contains(
                event.target
            )
        ) {

            searchBox.classList.remove(
                "open"
            );

        }

    }
);


/* ========================================================
   KEYBOARD
======================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target === searchInput
        ) {

            return;

        }


        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            togglePlay();

        }


        if (
            event.key === "ArrowLeft"
        ) {

            previousTrack();

        }


        if (
            event.key === "ArrowRight"
        ) {

            nextTrack();

        }

    }
);


/* ========================================================
   MOBILE SWIPE
======================================================== */

let swipeStartX = 0;

let swipeStartY = 0;

let swipeFromRecord = false;


playerSystem.addEventListener(
    "touchstart",
    event => {

        if (!event.touches.length) {

            return;

        }


        swipeStartX =
            event.touches[0].clientX;

        swipeStartY =
            event.touches[0].clientY;


        swipeFromRecord =
            event.target.closest(
                "#record"
            ) !== null;

    },
    {
        passive: true
    }
);


playerSystem.addEventListener(
    "touchend",
    event => {

        if (!event.changedTouches.length) {

            return;

        }


        if (swipeFromRecord) {

            swipeFromRecord = false;

            return;

        }


        const endX =
            event.changedTouches[0].clientX;

        const endY =
            event.changedTouches[0].clientY;


        const dx =
            endX -
            swipeStartX;

        const dy =
            endY -
            swipeStartY;


        if (
            Math.abs(dx) > 70
            &&
            Math.abs(dx) >
                Math.abs(dy)
        ) {

            if (dx < 0) {

                nextTrack();

            } else {

                previousTrack();

            }

        }

    },
    {
        passive: true
    }
);


/* ========================================================
   PARTICLES
======================================================== */

const canvas =
    document.getElementById(
        "particleCanvas"
    );

const ctx =
    canvas.getContext("2d");


let particles = [];


let mouseX =
    window.innerWidth / 2;

let mouseY =
    window.innerHeight / 2;


function resizeCanvas() {

    canvas.width =
        window.innerWidth *
        devicePixelRatio;

    canvas.height =
        window.innerHeight *
        devicePixelRatio;


    canvas.style.width =
        window.innerWidth +
        "px";

    canvas.style.height =
        window.innerHeight +
        "px";


    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


class Particle {

    constructor() {

        this.x =
            Math.random() *
            window.innerWidth;

        this.y =
            Math.random() *
            window.innerHeight;


        this.size =
            Math.random() *
            1.5 +
            0.3;


        this.speedX =
            (Math.random() - 0.5) *
            0.15;


        this.speedY =
            (Math.random() - 0.5) *
            0.15;


        this.alpha =
            Math.random() *
            0.25;

    }


    update() {

        this.x +=
            this.speedX;

        this.y +=
            this.speedY;


        if (
            this.x < -10
            ||
            this.x >
                window.innerWidth + 10
        ) {

            this.x =
                Math.random() *
                window.innerWidth;

        }


        if (
            this.y < -10
            ||
            this.y >
                window.innerHeight + 10
        ) {

            this.y =
                Math.random() *
                window.innerHeight;

        }


        const dx =
            this.x -
            mouseX;

        const dy =
            this.y -
            mouseY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance < 130
            &&
            distance > 0
        ) {

            const force =
                (130 - distance) /
                130;


            this.x +=
                (dx / distance) *
                force *
                0.35;


            this.y +=
                (dy / distance) *
                force *
                0.35;

        }

    }


    draw() {

        ctx.beginPath();


        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,255,255,${this.alpha})`;


        ctx.fill();

    }

}


function createParticles() {

    particles = [];


    const count =
        Math.min(
            130,
            Math.floor(
                window.innerWidth *
                window.innerHeight /
                10000
            )
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        particles.push(
            new Particle()
        );

    }

}


createParticles();


window.addEventListener(
    "resize",
    createParticles
);


window.addEventListener(
    "pointermove",
    event => {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;

    },
    {
        passive: true
    }
);


function animateParticles() {

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    particles.forEach(
        particle => {

            particle.update();

            particle.draw();

        }
    );


    requestAnimationFrame(
        animateParticles
    );

}


animateParticles();


/* ========================================================
   INITIAL STATE
======================================================== */

renderTracks();

resetProgressVisual();

applyRecordRotation();