import { Player, Enemy } from './entities.js';
import { createGrid, resolveEnemyCollisions } from './collision.js';
import {
    WORLD_W, WORLD_H, VIEW_W, VIEW_H, VIEW_MARGIN,
    CELL, ENEMY_RADIUS, ENEMIES_PER_LEVEL
} from '../shared/config.js';

const clamp = (limit, lowest, highest) => Math.max(lowest, Math.min(highest, limit))

export class Game {
    constructor() {
        this.players = new Map();
        this.enemies = [];
        this.level = 0;
        this.tickCount = 0;
        this.grid = createGrid(WORLD_W, WORLD_H, CELL);
    }

    addPlayer() {
        const p = new Player(WORLD_W / 2, WORLD_H / 2, 24, 48, 200, 100);
        p.input = { dx: 0, dy: 0, aim: 0, atk: false };
        this.players.set(p.id, p);
        return p;
    }

    removePlayer(id) { this.players.delete(id); }

    setInput(id, message) {
        const player = this.players.get(id);
        if (!player) return;
        player.input.dx = clamp(Number(message.dx) || 0, -1, 1);
        player.input.dy = clamp(Number(message.dy) || 0, -1, 1);
        player.input.aim = Number.isFinite(message.aim) ? message.aim : 0;
        player.input.atk = !!message.atk;
    }

    tick(dt) {
        this.tickCount++;
        if (this.players.size === 0) return;     // pause when empty

        /* Waves */
        if (this.enemies.length === 0) this.spawnWave();

        /* Players */
        for (const p of this.players.values()) {
            const { dx, dy, aim, atk } = p.input;
            p.movePlayer(dx, dy, dt);
            p.x = clamp(p.x, p.radius, WORLD_W - p.radius);
            p.y = clamp(p.y, p.h / 2, WORLD_H - p.h / 2);
            p.update(dt);
            if (atk) p.attackTarget(aim);
            // TODO: attack hit detection against enemies (combat.js)
        }

        /* Enemies steer toward nearest player */
        // for (const e of this.enemies) e.steerToward(this.nearestPlayer(e), dt);

        /* Collisions */
        for (const p of this.players.values()) {
            for (const e of this.enemies) p.resolveCollision(e);
        }
        resolveEnemyCollisions(this.grid, this.enemies);

        for (const e of this.enemies) {
            e.x = clamp(e.x, e.radius, WORLD_W - e.radius);
            e.y = clamp(e.y, e.radius, WORLD_H - e.radius);
        }
    }

    nearestPlayer(entity) {
        let best = null, bestD = Infinity;
        for (const player of this.players.values()) {
            const dx = player.x - entity.x, dy = player.y - entity.y;
            const d = dx * dx + dy * dy;
            if (d < bestD) { bestD = d; best = player; }
        }
        return best;
    }

    spawnWave() {
        this.level++;
        const count = ENEMIES_PER_LEVEL + this.level * 3;
        for (let i = 0; i < count; i++) {
            // spawn on a random edge so enemies don't land on players
            const edge = Math.floor(Math.random() * 4);
            const x = edge < 2 ? Math.random() * WORLD_W : (edge === 2 ? 0 : WORLD_W);
            const y = edge >= 2 ? Math.random() * WORLD_H : (edge === 0 ? 0 : WORLD_H);
            this.enemies.push(new Enemy(x, y, ENEMY_RADIUS, 150, 10));
        }
    }

    /* Per-player snapshot: only what that player can see */
    snapshotFor(id) {
        const me = this.players.get(id);
        if (!me) return null;

        const minX = me.x - VIEW_W / 2 - VIEW_MARGIN, maxX = me.x + VIEW_W / 2 + VIEW_MARGIN;
        const minY = me.y - VIEW_H / 2 - VIEW_MARGIN, maxY = me.y + VIEW_H / 2 + VIEW_MARGIN;

        const enemies = [];                       // flat [id, x, y, id, x, y, ...]
        for (const enemy of this.enemies) {           // later: query the grid instead
            if (enemy.x < minX || enemy.x > maxX || enemy.y < minY || enemy.y > maxY) continue;
            enemies.push(enemy.id, Math.round(enemy.x), Math.round(enemy.y));
        }

        const players = [];
        for (const player of this.players.values()) {
            players.push({
                id: player.id, x: Math.round(player.x), y: Math.round(player.y),
                a: player.attack.active ? +player.input.aim.toFixed(2) : null
            });
        }

        return { t: 'snap', tick: this.tickCount, level: this.level, players, enemies };
    }
}