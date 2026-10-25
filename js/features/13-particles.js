/*
 * SONORA — Particle Background
 * Responsibility: canvas particle simulation only.
 */
(() => {
    "use strict";

    const dom = Sonora.dom;
    const canvas = dom.get("particleCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const settings = {
        maxParticles: 130,
        areaPerParticle: 10000,
        minSize: 0.3,
        sizeRange: 1.5,
        speedRange: 0.15,
        maxAlpha: 0.25,
        interactionRadius: 130,
        interactionForce: 0.35
    };

    let particles = [];
    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    class Particle {
        constructor() {
            this.reset();
            this.size =
                Math.random() * settings.sizeRange +
                settings.minSize;
            this.speedX =
                (Math.random() - 0.5) * settings.speedRange;
            this.speedY =
                (Math.random() - 0.5) * settings.speedRange;
            this.alpha =
                Math.random() * settings.maxAlpha;
        }

        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < -10 || this.x > window.innerWidth + 10) {
                this.x = Math.random() * window.innerWidth;
            }

            if (this.y < -10 || this.y > window.innerHeight + 10) {
                this.y = Math.random() * window.innerHeight;
            }

            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.hypot(dx, dy);

            if (distance < settings.interactionRadius && distance > 0) {
                const force =
                    (settings.interactionRadius - distance) /
                    settings.interactionRadius;

                this.x += (dx / distance) * force * settings.interactionForce;
                this.y += (dy / distance) * force * settings.interactionForce;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
            ctx.fill();
        }
    }

    function createParticles() {
        const count = Math.min(
            settings.maxParticles,
            Math.floor(
                window.innerWidth *
                window.innerHeight /
                settings.areaPerParticle
            )
        );

        particles = Array.from(
            { length: count },
            () => new Particle()
        );
    }

    function animate() {
        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        createParticles();
    });

    window.addEventListener("pointermove", event => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }, { passive: true });

    resizeCanvas();
    createParticles();
    animate();
})();
