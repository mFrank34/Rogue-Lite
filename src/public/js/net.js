// Socket connection + the latest snapshot from the server.
// `io` is a global from <script src="/socket.io/socket.io.js">.
import { TICK_RATE, SNAPSHOT_EVERY } from '/shared/config.js';

// draw this far behind the server: two snapshot intervals (about 133 ms at 15 Hz)
const INTERP_DELAY = 2 * 1000 / (TICK_RATE / SNAPSHOT_EVERY);

export function createNet() {
    const socket = io({ transports: ['websocket'] });

    const buffer = [];       // recent snapshots, oldest first
    let offset = null;       // estimated (client clock - server clock)

    const net = {
        myId: null,
        world: { w: 0, h: 0 },
        connected: false,
        sendInput(input) { socket.volatile.emit('input', input); }
    };

    socket.on('connect', () => { net.connected = true; });
    socket.on('disconnect', () => { net.connected = false; buffer.length = 0; offset = null; });
    socket.on('init', ({ id, world }) => { net.myId = id; net.world = world; });

    socket.on('snap', (snap) => {
        // timestamp by the server's tick, not by arrival time, so network jitter doesn't wobble things
        snap.t = snap.tick * 1000 / TICK_RATE;

        const sample = performance.now() - snap.t;
        offset = offset === null ? sample : offset + (sample - offset) * 0.05;

        // enemy id -> position in the flat array, built once per snapshot
        snap.index = new Map();
        for (let i = 0; i < snap.enemies.length; i += 3) snap.index.set(snap.enemies[i], i);

        buffer.push(snap);
        if (buffer.length > 20) buffer.shift();
    });

    const view = { tick: 0, level: 0, players: [], enemies: [] };

    // Call once per frame. Returns the interpolated world (same shape as a snapshot).
    net.getView = () => {
        if (buffer.length === 0 || offset === null) return null;

        const renderT = performance.now() - offset - INTERP_DELAY;

        let i = 1;
        while (i < buffer.length && buffer[i].t < renderT) i++;

        // not enough data on one side: just show the nearest snapshot
        if (buffer.length === 1 || renderT <= buffer[0].t) return buffer[0];
        if (i >= buffer.length) return buffer[buffer.length - 1];

        const a = buffer[i - 1], b = buffer[i];
        const k = Math.min(1, Math.max(0, (renderT - a.t) / (b.t - a.t)));

        view.tick = b.tick;
        view.level = b.level;

        view.players = b.players.map((pb) => {
            const pa = a.players.find((p) => p.id === pb.id);
            if (!pa) return pb;
            return { id: pb.id, x: pa.x + (pb.x - pa.x) * k, y: pa.y + (pb.y - pa.y) * k, a: pb.a };
        });

        const out = view.enemies;
        out.length = 0;
        const list = b.enemies;
        for (let n = 0; n < list.length; n += 3) {
            const id = list[n], bx = list[n + 1], by = list[n + 2];
            const j = a.index.get(id);
            if (j === undefined) {
                out.push(id, bx, by);          // just came into view
            } else {
                const ax = a.enemies[j + 1], ay = a.enemies[j + 2];
                out.push(id, ax + (bx - ax) * k, ay + (by - ay) * k);
            }
        }
        return view;
    };

    return net;
}