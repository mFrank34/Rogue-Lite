// Bootstrap + render loop. No drawing, no socket code, no listeners live here.

import { VIEW_W, VIEW_H } from '/shared/config.js';
import { createInput } from './input.js';
import { createNet } from './net.js';
import { createRenderer } from './render.js';
import { createFpsCounter } from './debug.js';

const canvas = document.getElementById('game');

const input = createInput(canvas, VIEW_W, VIEW_H);
const net = createNet();
const renderer = createRenderer(canvas, VIEW_W, VIEW_H);
const fpsCounter = createFpsCounter();

const cam = { x: 0, y: 0 };
let debug = true;

const findMe = () => net.snap?.players.find((p) => p.id === net.myId);

/* Send input to the server at a fixed rate, independent of frame rate */
setInterval(() => {
    if (!net.connected) return;
    net.sendInput(input.read(cam, findMe()));
}, 1000 / 30);

/* Render loop */
let lastTime = 0;

function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    fpsCounter.tick(dt);

    if (input.takeDebugToggle()) debug = !debug;

    const me = findMe();
    if (me) {
        cam.x = me.x - VIEW_W / 2;
        cam.y = me.y - VIEW_H / 2;
    }

    renderer.draw({
        snap: net.snap,
        cam,
        myId: net.myId,
        world: net.world,
        debug: debug
            ? {
                fps: fpsCounter.fps,
                keys: input.keys,
                mouse: input.mouse,
                mousePos: input.mousePos,
                canvas, viewW: VIEW_W, viewH: VIEW_H,
                me, snap: net.snap, connected: net.connected
            }
            : null
    });

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);