
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

    update(dt) {
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