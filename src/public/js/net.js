// Socket connection + the latest snapshot from the server.
// `io` is a global from <script src="/socket.io/socket.io.js">.

export function createNet() {
    const socket = io({ transports: ['websocket'] });

    const net = {
        myId: null,
        world: { w: 0, h: 0 },
        snap: null,          // latest snapshot (interpolation buffer goes here later)
        connected: false,

        sendInput(input) {
            socket.volatile.emit('input', input);
        }
    };

    socket.on('connect', () => { net.connected = true; });
    socket.on('disconnect', () => { net.connected = false; });

    socket.on('init', ({ id, world }) => {
        net.myId = id;
        net.world = world;
    });

    socket.on('snap', (snap) => {
        net.snap = snap;
    });

    return net;
}