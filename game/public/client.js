const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keys = new Set();
const GAME_W = 1280, GAME_H = 720;

// fixed-resolution units, so these never need recalculating
const circleX = 80, circleY = 90, circleRad = 22;
const txtFnt = "22px monospace";

let lastTime = 0;
let frames = 0, fps = 0, fpsTimer = 0;
let debug = true;

window.addEventListener("keydown", (e) => {
    if (e.code === "F3") {
        e.preventDefault();
        if (!e.repeat) debug = !debug;
        return;
    }
    keys.add(e.code);
});

window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => keys.clear());

function resizeCanvas() {
    const scale = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
    canvas.width = GAME_W;
    canvas.height = GAME_H;
    canvas.style.width = GAME_W * scale + "px";
    canvas.style.height = GAME_H * scale + "px";
}

function update(dt) { }

function drawDebug() {
    ctx.font = txtFnt;
    ctx.fillStyle = "#0f0";
    const lineH = 26;
    const lines = [
        "FPS: " + fps,
        "Keys: " + ([...keys].join(", ") || "-"),
        "Canvas: " + canvas.width + "x" + canvas.height,
    ];
    lines.forEach((text, i) => ctx.fillText(text, 10, lineH * (i + 1)));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(circleX + 100, circleY + 100, circleRad, 0, Math.PI * 2);
    ctx.fill();

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