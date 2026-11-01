// Everything canvas. Reads a frame description, never changes game state.

import {
    ENEMY_RADIUS, PLAYER_W, PLAYER_H, ATTACK_RANGE, ATTACK_ARC
} from '/shared/config.js';
import { drawDebugWorld, drawDebugHud } from './debug.js';

export function createRenderer(canvas, viewW, viewH) {
    const ctx = canvas.getContext('2d');
    let viewScale = 1;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const fit = Math.min(window.innerWidth / viewW, window.innerHeight / viewH);

        const cssW = Math.floor(viewW * fit);
        const cssH = Math.floor(viewH * fit);
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';

        // backing buffer matches what is actually shown on screen
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        viewScale = canvas.width / viewW;
    }
    window.addEventListener('resize', resize);
    resize();

    /* Shapes */
    function drawPill(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, Math.min(w, h) / 2);
        ctx.fill();
    }

    function drawAttack(p) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, ATTACK_RANGE, p.a - ATTACK_ARC / 2, p.a + ATTACK_ARC / 2);
        ctx.closePath();
        ctx.fill();
    }

    // Snapshot enemies are a flat array: [id, x, y, id, x, y, ...]
    function drawEnemies(list) {
        ctx.fillStyle = '#FF073A';
        ctx.beginPath();
        for (let i = 0; i < list.length; i += 3) {
            const x = list[i + 1], y = list[i + 2];
            ctx.moveTo(x + ENEMY_RADIUS, y);
            ctx.arc(x, y, ENEMY_RADIUS, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    /*
     * frame = { snap, cam, myId, world, debug }
     * debug is null when the overlay is off, otherwise the info object for debug.js
     */
    function draw(frame) {
        const { snap, cam, myId, world, debug } = frame;

        ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);
        ctx.clearRect(0, 0, viewW, viewH);

        if (snap) {
            /* World space */
            ctx.save();
            ctx.translate(-cam.x, -cam.y);

            // map border, so you can see the edge now that there is a camera
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, world.w, world.h);

            drawEnemies(snap.enemies);

            for (const p of snap.players) {
                drawPill(
                    p.x - PLAYER_W / 2, p.y - PLAYER_H / 2,
                    PLAYER_W, PLAYER_H,
                    p.id === myId ? '#0f0' : '#4da6ff'
                );
                if (p.a !== null) drawAttack(p);
            }

            if (debug) drawDebugWorld(ctx, debug);

            ctx.restore();
        }

        /* Screen space */
        if (debug) drawDebugHud(ctx, debug);
    }

    return { draw };
}