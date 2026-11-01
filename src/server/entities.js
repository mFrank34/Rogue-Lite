import { Attack } from './combat.js';
import { toRad } from '../shared/math.js';

let nextId = 1;

class Entity {
    constructor(x, y, radius, speed, health) {
        this.id = nextId++;     // unique per entity
        this.idx = 0;           // used by the collision grid
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
    }

    coreY(y) { return this.y; }

    collidesWith(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.coreY(other.y);
        const r = this.radius + other.radius;
        return dx * dx + dy * dy < r * r;
    }

    resolveCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.coreY(other.y);
        const r = this.radius + other.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 >= r * r) return;

        const d = Math.sqrt(d2);
        if (d === 0) { other.x += r; return; }   // on the spine: push sideways

        const push = (r - d) / d;
        other.x += dx * push;
        other.y += dy * push;
    }

    move(dx, dy, deltaTime) {
        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;
    }
}


export class Player extends Entity {
    constructor(x, y, w, h, speed, health) {
        super(x, y, w / 2, speed, health);

        this.w = w;
        this.h = h;

        this.attack = new Attack(
            120, toRad(15), 0.15, 0.4
        );
    }

    coreY(y) {
        const top = this.y - this.h / 2 + this.radius;
        const bottom = this.y + this.h / 2 - this.radius;
        return Math.max(top, Math.min(y, bottom));
    }

    update(dt) {
        this.attack.update(dt);
    }

    movePlayer(dx, dy, deltaTime) {
        const len = Math.hypot(dx, dy);

        if (len > 0) {
            dx /= len;
            dy /= len;
        }

        this.move(dx, dy, deltaTime);
    }

    attackTarget(angle) {
        this.attack.start(angle);
    }
}

export class Enemy extends Entity {
    constructor(x, y, radius, speed, health) {
        super(x, y, radius, speed, health);
    }

    steerToward(target, dt) {
        const dx = target.x - this.x, dy = target.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0) this.move(dx / d, dy / d, dt);
    }
}
