import { Server } from "socket.io";
import { WORLD_W, WORLD_H } from '../shared/config.js';


export function attachNetwork(httpServer, game) {
    const io = new Server(httpServer, {
        transports: ['websocket'],     // skip long-polling, simpler on Railway (no sticky sessions)
        maxHttpBufferSize: 1e3,        // inputs are tiny; reject anything big
        perMessageDeflate: false       // compression costs CPU every snapshot, enable only if bandwidth is the problem
    });

    const sockets = new Map();         // playerId -> socket

    io.on('connection', (socket) => {
        const player = game.addPlayer();
        sockets.set(player.id, socket);

        socket.emit('init', { id: player.id, world: { w: WORLD_W, h: WORLD_H } });

        socket.on('input', (msg) => {
            if (msg && typeof msg === 'object') game.setInput(player.id, msg);
        });

        socket.on('disconnect', () => {
            sockets.delete(player.id);
            game.removePlayer(player.id);
        });
    });

    return {
        broadcast() {
            for (const [id, socket] of sockets) {
                const snap = game.snapshotFor(id);
                if (snap) socket.volatile.emit('snap', snap);
            }
        }
    };
}