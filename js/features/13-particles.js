/* ========================================================
   PARTICLES
======================================================== */


/*
 * Canvas
 */
const canvas =
    document.getElementById(
        "particleCanvas"
    );


const ctx =
    canvas.getContext("2d");


/*
 * 粒子列表
 */
let particles = [];


/*
 * 鼠标位置
 */
let mouseX =
    window.innerWidth / 2;


let mouseY =
    window.innerHeight / 2;


/* ========================================================
   CANVAS RESIZE
======================================================== */

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


/* ========================================================
   PARTICLE CLASS
======================================================== */

class Particle {

    constructor() {

        /*
         * 初始位置
         */
        this.x =
            Math.random() *
            window.innerWidth;


        this.y =
            Math.random() *
            window.innerHeight;


        /*
         * 粒子大小
         */
        this.size =
            Math.random() *
            1.5 +
            0.3;


        /*
         * 移动速度
         */
        this.speedX =
            (Math.random() - 0.5) *
            0.15;


        this.speedY =
            (Math.random() - 0.5) *
            0.15;


        /*
         * 透明度
         */
        this.alpha =
            Math.random() *
            0.25;

    }


    /* ====================================================
       UPDATE
    ==================================================== */

    update() {

        /*
         * 基础移动
         */
        this.x +=
            this.speedX;


        this.y +=
            this.speedY;


        /*
         * X 越界
         */
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


        /*
         * Y 越界
         */
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


        /*
         * 鼠标交互
         */
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


        /*
         * 鼠标附近产生排斥
         */
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


    /* ====================================================
       DRAW
    ==================================================== */

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


/* ========================================================
   CREATE PARTICLES
======================================================== */

function createParticles() {

    particles = [];


    /*
     * 根据屏幕面积动态控制数量
     */
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


/*
 * 初始创建
 */
createParticles();


/*
 * 窗口大小变化时重新创建
 */
window.addEventListener(
    "resize",
    createParticles
);


/* ========================================================
   MOUSE
======================================================== */

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


/* ========================================================
   PARTICLE ANIMATION
======================================================== */

function animateParticles() {

    /*
     * 清空画布
     */
    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    /*
     * 更新并绘制
     */
    particles.forEach(
        particle => {

            particle.update();

            particle.draw();

        }
    );


    /*
     * 下一帧
     */
    requestAnimationFrame(
        animateParticles
    );

}


animateParticles();


/* ========================================================
   FINAL INITIAL STATE
======================================================== */


/*
 * 首次渲染歌曲列表
 */
renderTracks();


/*
 * 重置进度
 */
resetProgressVisual();


/*
 * 重置唱片
 */
applyRecordRotation();