/* ========================================================
   STATE
======================================================== */


/*
 * 音乐列表
 */
let tracks = [];


/*
 * 当前歌曲索引
 */
let currentIndex = -1;


/*
 * 是否正在播放
 */
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


/* ========================================================
   SEEK STATE
======================================================== */


/*
 * 拖动开始时的歌曲进度
 */
let seekStartProgress = 0;


/*
 * 拖动累计旋转角度
 */
let seekAccumulatedAngle = 0;


/*
 * 上一次 Pointer 的角度
 */
let lastPointerAngle = 0;


/*
 * Pointer 起始坐标
 */
let seekPointerStartX = 0;

let seekPointerStartY = 0;


/*
 * 最小拖动距离
 */
const SEEK_MOVE_THRESHOLD = 5;


/* ========================================================
   RECORD ROTATION
======================================================== */


/*
 * 唱片旋转角度
 */
let recordRotation = 0;


/*
 * 上一次动画时间戳
 */
let lastAnimationTime = null;


/*
 * 唱片旋转速度
 *
 * 12 秒一圈。
 */
const RECORD_ROTATION_SPEED =
    360 / 12;


/*
 * 唱片 requestAnimationFrame
 */
let recordAnimationFrame = null;


/* ========================================================
   PROGRESS ANIMATION
======================================================== */


/*
 * 进度条 requestAnimationFrame
 */
let progressAnimationFrame = null;


/* ========================================================
   OBJECT URL
======================================================== */


/*
 * 当前 Object URLs
 */
let objectUrls = [];


/* ========================================================
   MOBILE SWIPE
======================================================== */


/*
 * Swipe 起点
 */
let swipeStartX = 0;

let swipeStartY = 0;


/*
 * 是否从唱片区域开始滑动
 */
let swipeFromRecord = false;


/* ========================================================
   SEARCH / UI
======================================================== */


/*
 * 其他模块可能会直接读取这些状态，
 * 所以统一保留在全局状态文件中。
 */