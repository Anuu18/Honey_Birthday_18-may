// --- CONFIGURATION ---
const CONFIG = {
    itemCount: 20,
    starCount: 150,
    zGap: 800,
    loopSize: 0,
    camSpeed: 2.5,
    colors: ['#ff003c', '#00f3ff', '#ccff00', '#ffffff']
};

CONFIG.loopSize = CONFIG.itemCount * CONFIG.zGap;

// 🎉 CHANGED TEXTS (Birthday Theme)
const TEXTS = [
    "HAPPY BIRTHDAY HONEY ❤️",
    "MY LOVE 💕",
    "FOREVER YOURS 💖",
    "YOU ARE MINE 💫",
    "BEST DAY EVER 🎂",
    "LOVE YOU SO MUCH HONEY💘",
    "MY EVERYTHING 💓",
    "18 MAY 2026 🎉",
    "YOU & ME ALWAYS 💞",
    "LOVE OF MY LIFE ❤️"
];

// --- STATE ---
const state = {
    scroll: 0,
    velocity: 0,
    targetSpeed: 0,
    mouseX: 0,
    mouseY: 0
};

const world = document.getElementById('world');
const viewport = document.getElementById('viewport');
const items = [];

// --- INIT ---
function init() {
    for (let i = 0; i < CONFIG.itemCount; i++) {
        const el = document.createElement('div');
        el.className = 'item';

        const isHeading = i % 4 === 0;

        if (isHeading) {
            const txt = document.createElement('div');
            txt.className = 'big-text';
            txt.innerText = TEXTS[i % TEXTS.length];
            el.appendChild(txt);

            items.push({
                el,
                type: 'text',
                x: 0,
                y: 0,
                rot: 0,
                baseZ: -i * CONFIG.zGap
            });

        } else {
            const card = document.createElement('div');
            card.className = 'card';

            const randId = Math.floor(Math.random() * 9999);

            // 🎉 CHANGED CARD TEXT
            card.innerHTML = `
                <div class="card-header">
                    <span>LOVE-${randId}</span>
                </div>
                <h2>${TEXTS[i % TEXTS.length]}</h2>
            `;

            el.appendChild(card);

            const angle = (i / CONFIG.itemCount) * Math.PI * 6;
            const x = Math.cos(angle) * (window.innerWidth * 0.3);
            const y = Math.sin(angle) * (window.innerHeight * 0.3);

            items.push({
                el,
                type: 'card',
                x,
                y,
                rot: (Math.random() - 0.5) * 30,
                baseZ: -i * CONFIG.zGap
            });
        }

        world.appendChild(el);
    }

    // Stars
    for (let i = 0; i < CONFIG.starCount; i++) {
        const el = document.createElement('div');
        el.className = 'star';

        world.appendChild(el);

        items.push({
            el,
            type: 'star',
            x: (Math.random() - 0.5) * 3000,
            y: (Math.random() - 0.5) * 3000,
            baseZ: -Math.random() * CONFIG.loopSize
        });
    }

    // Mouse
    window.addEventListener('mousemove', (e) => {
        state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
}

init();

// --- LENIS (safe init) ---
let lenis = null;

if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
        smooth: true,
        lerp: 0.08
    });

    lenis.on('scroll', ({ scroll, velocity }) => {
        state.scroll = scroll;
        state.targetSpeed = velocity;
    });
}

// --- RAF LOOP ---
let lastTime = performance.now();

function raf(time) {

    if (lenis) lenis.raf(time);

    const delta = time - lastTime;
    lastTime = time;

    state.velocity += (state.targetSpeed - state.velocity) * 0.1;

    const tiltX = state.mouseY * 5 - state.velocity * 0.5;
    const tiltY = state.mouseX * 5;

    world.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

    const fov = 1000 - Math.min(Math.abs(state.velocity) * 10, 600);
    viewport.style.perspective = `${fov}px`;

    const cameraZ = state.scroll * CONFIG.camSpeed;

    items.forEach(item => {

        let relZ = item.baseZ + cameraZ;
        let mod = CONFIG.loopSize;

        let z = ((relZ % mod) + mod) % mod;

        if (z > 500) z -= mod;

        let alpha = 1;
        if (z < -3000) alpha = 0;
        else if (z < -2000) alpha = (z + 3000) / 1000;

        if (z > 100 && item.type !== 'star') {
            alpha = 1 - ((z - 100) / 400);
        }

        alpha = Math.max(0, Math.min(1, alpha));

        item.el.style.opacity = alpha;

        if (alpha > 0) {
            let transform = `translate3d(${item.x}px, ${item.y}px, ${z}px)`;

            if (item.type === 'star') {
                const stretch = 1 + Math.abs(state.velocity) * 0.05;
                transform += ` scale3d(1,1,${stretch})`;

            } else if (item.type === 'text') {
                if (Math.abs(state.velocity) > 1) {
                    const offset = state.velocity * 2;
                    item.el.style.textShadow = `${offset}px 0 red, ${-offset}px 0 cyan`;
                } else {
                    item.el.style.textShadow = 'none';
                }

            } else {
                const float = Math.sin(time * 0.001 + item.x) * 10;
                transform += ` rotateY(${float}deg)`;
            }

            item.el.style.transform = transform;
        }
    });

    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

