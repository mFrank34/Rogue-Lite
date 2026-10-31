
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

    move(dx, dy, deltaTime) {
        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;
    }
}


class Player extends Entity {
    constructor(x, y, w, h, speed, health) {
        super(x, y, Math.min(w, h) / 2, speed, health);
        this.w = w;
        this.h = h;

        this.attack = new Attack(
            120, toRad(15), 0.15, 0.4
        )
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

class Enemy extends Entity {
    constructor(x, y, radius, speed, health) {
        super(x, y, radius, speed, health);
    }
}
