// Owns the keyboard/mouse state. Knows nothing about the game or the network.

export function createInput(canvas, viewW, viewH) {
    const keys = new Set();
    const mouse = new Set();
    const mousePos = { x: 0, y: 0 };   // screen space: 0..viewW, 0..viewH
    let debugPressed = false;

    window.addEventListener('keydown', (e) => {
        if (e.code === 'F3') {
            e.preventDefault();
            if (!e.repeat) debugPressed = true;
            return;
        }
        keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => keys.delete(e.code));

    window.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        mousePos.x = (e.clientX - r.left) / r.width * viewW;
        mousePos.y = (e.clientY - r.top) / r.height * viewH;
    });

    window.addEventListener('mousedown', (e) => mouse.add(e.button));

    window.addEventListener('mouseup', (e) => mouse.delete(e.button));

    document.documentElement.addEventListener('mouseleave', () => mouse.clear());

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('blur', () => {
        keys.clear();
        mouse.clear();
    });

    return {
        keys,
        mouse,
        mousePos,

        // true once per F3 press; main.js decides what to do with it
        takeDebugToggle() {
            const pressed = debugPressed;
            debugPressed = false;
            return pressed;
        },

        // The message the server wants. `cam` converts screen space -> world space.
        read(cam, me) {
            const dx = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
            const dy = (keys.has('KeyS') ? 1 : 0) - (keys.has('KeyW') ? 1 : 0);
            const aim = me
                ? Math.atan2(mousePos.y + cam.y - me.y, mousePos.x + cam.x - me.x)
                : 0;
            return { dx, dy, aim, atk: mouse.has(0) };
        }
    };
}