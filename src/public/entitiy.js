
class Entity {
    constructor(x, y, radius, speed, health) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
    }

    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;

        return Math.hypot(dx, dy) < this.radius + other.radius;
    }

    resolveCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;

        const distance = Math.hypot(dx, dy);
        const minDistance = this.radius + other.radius;

        if (distance >= minDistance || distance === 0) return;

        const overlap = minDistance - distance;

        const nx = dx / distance;
        const ny = dy / distance;

        other.x += nx * overlap;
        other.y += ny * overlap;
    }

    resolveMutualCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;

        const distance = Math.hypot(dx, dy);
        const minDistance = this.radius + other.radius;

        if (distance >= minDistance || distance === 0) return;

        const overlap = (minDistance - distance) / 2;

        const nx = dx / distance;
        const ny = dy / distance;

        this.x -= nx * overlap;
        this.y -= ny * overlap;

        other.x += nx * overlap;
        other.y += ny * overlap;
    }

    move(dx, dy, deltaTime) {
        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;
    }
}


class Player extends Entity {
    constructor(x, y, w, h, speed, health) {
        super(x, y, w / 2, speed, health);

        this.w = w;
        this.h = h;

        this.attack = new Attack(
            120, toRad(15), 0.15, 0.4
        );
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

    getClosestY(y) {
        const top = this.y - this.h / 2 + this.w / 2;
        const bottom = this.y + this.h / 2 - this.w / 2;
        return Math.max(top, Math.min(y, bottom));
    }

    collidesWith(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.getClosestY(other.y);

        return Math.hypot(dx, dy) < this.w / 2 + other.radius;
    }

    resolveCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.getClosestY(other.y);

        const distance = Math.hypot(dx, dy);
        const minDistance = this.w / 2 + other.radius;

        if (distance >= minDistance) return;

        // Enemy center is exactly on the capsule's spine: push sideways
        if (distance === 0) {
            other.x += minDistance;
            return;
        }

        const overlap = minDistance - distance;

        other.x += (dx / distance) * overlap;
        other.y += (dy / distance) * overlap;
    }
}

class Enemy extends Entity {
    constructor(x, y, radius, speed, health) {
        super(x, y, radius, speed, health);
    }
}
