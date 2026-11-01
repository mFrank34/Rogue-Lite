// Debug overlay. Pure drawing: reads what it is given, never changes game state.

import { ENEMY_RADIUS, PLAYER_W, PLAYER_H } from '/shared/config.js';

const FONT = '22px monospace';
const LINE_H = 26;

export function createFpsCounter() {
    let frames = 0, timer = 0;
    const counter = { fps: 0 };

    counter.tick = (dt) => {
        frames++;
        timer += dt;
        if (timer >= 1) {
            counter.fps = frames;
            frames = 0;
            timer = 0;
        }
    };
    return counter;
}

// Hitboxes: call while the camera transform is applied (world space).
export function drawDebugWorld(ctx, info) {
    const { snap } = info;
    if (!snap) return;

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;

    // Player hitboxes
    ctx.beginPath();
    for (const p of snap.players) {
        ctx.roundRect(p.x - PLAYER_W / 2, p.y - PLAYER_H / 2, PLAYER_W, PLAYER_H, PLAYER_W / 2);
    }
    ctx.stroke();

    // Enemy hitboxes: one path, one stroke
    const list = snap.enemies;
    ctx.beginPath();
    for (let i = 0; i < list.length; i += 3) {
        const x = list[i + 1], y = list[i + 2];
        ctx.moveTo(x + ENEMY_RADIUS, y);
        ctx.arc(x, y, ENEMY_RADIUS, 0, Math.PI * 2);
    }
    ctx.stroke();
}

// Text: call in screen space (no camera transform).
export function drawDebugHud(ctx, info) {
    const { fps, keys, mouse, mousePos, canvas, viewW, viewH, me, snap, connected } = info;

    const lines = [
        'FPS: ' + fps,
        'Connected: ' + connected,
        'Keys: ' + ([...keys].join(', ') || '-'),
        'Mouse: X=' + mousePos.x.toFixed(2) + ', Y=' + mousePos.y.toFixed(2) +
        ' Buttons: ' + ([...mouse].join(', ') || '-'),
        'Canvas: ' + canvas.width + 'x' + canvas.height + ' (view ' + viewW + 'x' + viewH + ')',
        'Player Coords: ' + (me ? 'X=' + me.x + ', Y=' + me.y : '-'),
        'Level: ' + (snap ? snap.level : '-') + ' | Tick: ' + (snap ? snap.tick : '-'),
        'Enemies in view: ' + (snap ? snap.enemies.length / 3 : '-') +
        ' | Players: ' + (snap ? snap.players.length : '-')
    ];

    ctx.font = FONT;
    ctx.fillStyle = '#0f0';
    lines.forEach((text, i) => ctx.fillText(text, 10, LINE_H * (i + 1)));
}