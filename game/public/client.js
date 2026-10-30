const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keys = new Set();
const mouse = new Set();
const GAME_W = 1920, GAME_H = 1080;

// fixed-resolution units, so these never need recalculating
const txtFnt = "22px monospace";

let lastTime = 0;
let frames = 0, fps = 0, fpsTimer = 0;
let viewScale = 1;
let mousePos = { x: 0, y: 0 };
let debug = true;

const ATTACK_DURATION = 0.15;
const ATTACK_COOLDOWN = 0.4;

/* Player Information */
const player = {
    x: GAME_W / 2,
    y: GAME_H / 2,
    w: 24,
    h: 48,
    speed: 200,
};

const attack = {
    range: 80,
    arc: toRad(15),
    active: false,
    angle: 0,
    timer: 0,
    cooldown: 0,
};

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / rect.width * GAME_W,
        y: (e.clientY - rect.top) / rect.height * GAME_H
    };
}

/* Keyboard input */
window.addEventListener("keydown", (e) => {
    if (e.code === "F3") {
        e.preventDefault();
        if (!e.repeat) debug = !debug;
        return;
    }
    keys.add(e.code);
});

window.addEventListener("keyup", (e) => keys.delete(e.code));
/* Keyboard input - END */

/* Mouse Input - START */
window.addEventListener("mousemove", (e) => {
    mousePos = getMousePos(e);
});

window.addEventListener("mousedown", (e) => {
    mouse.add(e.button);
});

window.addEventListener("mouseup", (e) => {
    mouse.delete(e.button);
});

document.documentElement.addEventListener("mouseleave", () => {
    mouse.clear();
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());
/* Mouse Input - END */

window.addEventListener("blur", () => {
    keys.clear();
    mouse.clear();
});


function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const fit = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);

    const cssW = Math.floor(GAME_W * fit);
    const cssH = Math.floor(GAME_H * fit);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    // backing buffer matches what's actually shown on screen
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    viewScale = canvas.width / GAME_W;
}

function drawDebug() {
    ctx.font = txtFnt;
    ctx.fillStyle = "#0f0";
    const lineH = 26;
    const lines = [
        "FPS: " + fps,
        "Keys: " + ([...keys].join(", ") || "-"),
        "Mouse: X=" + mousePos.x.toFixed(2) + ", Y=" + mousePos.y.toFixed(2) +
        " Buttons: " + ([...mouse].join(", ") || "-"),
        "Canvas: " + canvas.width + "x" + canvas.height + " (game " + GAME_W + "x" + GAME_H + ")",
        "Player Coors: X=" + player.x.toFixed(2) + ", Y=" + player.y.toFixed(2)
    ];
    lines.forEach((text, i) => ctx.fillText(text, 10, lineH * (i + 1)));
}

/* Canvas Shapes */
function drawPill(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(w, h) / 2);
    ctx.fill();
}

function drawAttack() {
    if (!attack.active) return;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.arc(
        player.x, player.y, attack.range,
        attack.angle - attack.arc / 2,
        attack.angle + attack.arc / 2
    );
    ctx.closePath();
    ctx.fill();
};

/* END of Shape */

function getAimAngle() {
    return Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
};

function toRad(deg) {
    return deg * Math.PI / 180;
}

function startAttack() {
    attack.angle = getAimAngle();
    attack.active = true;
    attack.timer = ATTACK_DURATION;
    attack.cooldown = ATTACK_COOLDOWN;
}

function update(dt) {
    attack.cooldown = Math.max(0, attack.cooldown - dt);
    if (attack.active) {
        attack.timer -= dt;
        if (attack.timer <= 0) {
            attack.active = false;
        }
    }

    let dx = 0, dy = 0;
    if (keys.has("KeyW")) dy -= 1;
    if (keys.has("KeyS")) dy += 1;
    if (keys.has("KeyA")) dx -= 1;
    if (keys.has("KeyD")) dx += 1;

    if (dx || dy) {
        const len = Math.hypot(dx, dy);
        player.x += (dx / len) * player.speed * dt;
        player.y += (dy / len) * player.speed * dt;
    }

    if (mouse.has(0) && attack.cooldown === 0) {
        startAttack();
    }
}

function draw() {
    ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    drawPill(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h, "#0f0");
    drawAttack();
    if (debug) drawDebug();
}

function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    frames++;
    fpsTimer += dt;
    if (fpsTimer >= 1) {
        fps = frames;
        frames = 0;
        fpsTimer = 0;
    }

    update(dt);
    draw();
    requestAnimationFrame(loop);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(loop);