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


/* Player Information */
const player = new Player(
    GAME_W / 2,
    GAME_H / 2,
    24,
    48,
    200,
    100
);

const enemies = new Set();
const LEVEL_PER_ENEMIES = 5

const world = {
    level: 0,
    spawned_enemy: 0,
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
        "Player Coors: X=" + player.x.toFixed(2) + ", Y=" + player.y.toFixed(2),
        "World Level: " + world.level + " | Target Enemies: " + world.spawned_enemy,
        "Current Enemies in World: " + enemies.size
    ];
    lines.forEach((text, i) => ctx.fillText(text, 10, lineH * (i + 1)));

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;

    // Player hitbox
    ctx.beginPath();
    ctx.roundRect(
        player.x - player.w / 2,
        player.y - player.h / 2,
        player.w,
        player.h,
        player.w / 2
    );
    ctx.stroke();
    ctx.stroke();

    // Enemy hitboxes
    for (const enemy of enemies) {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

/* Canvas Shapes */
function drawPill(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(w, h) / 2);
    ctx.fill();
}

function drawAttack() {
    const attack = player.attack;

    if (!attack.active) return;

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);

    ctx.arc(
        player.x,
        player.y,
        attack.range,
        attack.angle - attack.arc / 2,
        attack.angle + attack.arc / 2
    );

    ctx.closePath();
    ctx.fill();
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

/* END of Shape */

function getAimAngle() {
    return Math.atan2(
        mousePos.y - player.y,
        mousePos.x - player.x
    );
};

function toRad(deg) {
    return deg * Math.PI / 180;
}

function spawn(level) {
    return LEVEL_PER_ENEMIES + (level * 3);
}

/* Temp function */
function spawnEnemy(x, y) {
    enemies.add(new Enemy(x, y, 16, 150, 10));
}


function update(dt) {
    /* World update logic */
    if (enemies.size === 0) {
        world.level++;

        const enemyCount = spawn(world.level);
        world.spawned_enemy = enemyCount;

        for (let i = 0; i < enemyCount; i++) {
            spawnEnemy(
                Math.random() * GAME_W,
                Math.random() * GAME_H
            );
        }
    }
    /* Player movement */
    let dx = 0, dy = 0;

    if (keys.has("KeyW")) dy -= 1;
    if (keys.has("KeyS")) dy += 1;
    if (keys.has("KeyA")) dx -= 1;
    if (keys.has("KeyD")) dx += 1;

    player.movePlayer(dx, dy, dt);

    /* Player attack */
    player.update(dt);

    if (mouse.has(0)) {
        player.attackTarget(getAimAngle());
    }

    /* Player-to-enemy collisions */
    for (const enemy of enemies) {
        if (player.collidesWith(enemy)) {
            player.resolveCollision(enemy);
        }
    }

    /* Enemy-to-enemy collisions */
    const enemyArray = [...enemies];

    for (let i = 0; i < enemyArray.length; i++) {
        for (let j = i + 1; j < enemyArray.length; j++) {
            const enemyA = enemyArray[i];
            const enemyB = enemyArray[j];

            if (enemyA.collidesWith(enemyB)) {
                enemyA.resolveMutualCollision(enemyB);
            }
        }
    }
}

function draw() {
    ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    // Draw player
    drawPill(
        player.x - player.w / 2,
        player.y - player.h / 2,
        player.w,
        player.h,
        "#0f0"
    );

    // Draw attack
    drawAttack();

    // Draw enemies
    for (const enemy of enemies) {
        drawCircle(
            enemy.x,
            enemy.y,
            enemy.radius,
            "#FF073A"
        );
    }

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