
class Entity {
    constructor(x, y, speed, health) {
        this.x = x;
        this.y = y;

        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
    }

    move(dx, dy, deltaTime) {
        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;
    }
}

class Attack {
    constructor(range, arc, duration, cooldown) {
        this.range = range;
        this.arc = arc;
        this.duration = duration;
        this.cooldownTime = cooldown;

        this.active = false;
        this.angle = 0;
        this.timer = 0;
        this.cooldown = 0;
    }
    start(angle) {
        if (this.cooldown > 0) return;

        this.active = true;
        this.angle = angle;
        this.timer = this.duration;
        this.cooldown = this.cooldownTime;
    }

    update(deltaTime) {
        if (this.timer > 0) {
            this.timer -= dt;

            if (this.timer <= 0) {
                this.active = false;
                this.timer = 0;
            }
        }

        if (this.cooldown > 0) {
            this.cooldown -= dt;
            this.cooldown = Math.max(0, this.cooldown);
        }
    }
}

class Player extends Entity {
    constructor(x, y, w, h, speed, health) {
        super(x, y, speed, health);
        this.w = w;
        this.h = h;

        this.attack = new Attack(
            120, toRad(15), 0.15, 0.4
        )
    }

    update(dt) {
        this.attack.update(dt);
    }

    attackTarget(angle) {
        this.attack.start(angle);
    }
}

class Enemy extends Enemy {
    constructor(x, y, radius, speed, health) {
        super(x, y, speed, health);
        this.radius = radius;
    }
}
