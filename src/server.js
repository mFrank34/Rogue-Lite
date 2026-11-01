import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Game } from './server/game.js';
import { attachNetwork } from './server/network.js';
import { TICK_RATE, SNAPSHOT_EVERY } from './shared/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use('/shared', express.static(path.join(__dirname, 'shared')));

const server = http.createServer(app);
const game = new Game();
const net = attachNetwork(server, game);

/* Fixed timestep loop */
const STEP = 1000 / TICK_RATE;
let last = performance.now();
let acc = 0;
let tickMsTotal = 0, tickMsCount;

setInterval(() => {
  const now = performance.now();
  acc += Math.min(now - last, 250);
  last = now;

  while (acc >= STEP) {
    const t0 = performance.now();
    game.tick(STEP / 1000);
    if (game.tickCount % SNAPSHOT_EVERY === 0) net.broadcast();
    tickMsTotal += performance.now() - t0;
    tickMsCount++;
    acc -= STEP;
  }
  if (tickMsCount >= TICK_RATE * 5) {
    console.log(`tick avg ${(tickMsTotal / tickMsCount).toFixed(2)} ms / ${STEP.toFixed(1)} ms budget, enemies ${game.enemies.length}, players ${game.players.size}`);
    tickMsTotal = tickMsCount = 0;
  }
}, 5);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('listening on', PORT));