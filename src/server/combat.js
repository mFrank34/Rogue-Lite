
export class Attack {
    constructor(range, arc, duration, cooldown) {
        this.range = range;
        this.arc = arc;
        this.duration = duration;
        this.cooldownTime = cooldown;

        this.active = false;
        this.angle = 0;
        this.timer = 0;
        this.cooldown = 0;

        this.hitEntities = new Set()
    }

    start(angle) {
        if (this.cooldown > 0) return;

        this.active = true;
        this.angle = angle;
        this.timer = this.duration;
        this.cooldown = this.cooldownTime;
        this.hitEntities.clear();
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

    tryHit(attackerX, attackerY, enemy) {
        if (!this.active) return false;
        if (this.hitEntities.has(enemy.id)) return false; // Already hit this swing

        // 1. Distance check
        const dx = enemy.x - attackerX;
        const dy = enemy.y - attackerY;
        const distSq = dx * dx + dy * dy;
        const maxRange = this.range + enemy.radius;
        if (distSq > maxRange * maxRange) return false;

        // 2. Arc check
        const angleToEnemy = Math.atan2(dy, dx);
        let angleDiff = angleToEnemy - this.angle;
        // Wrap angle between -PI and PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) <= this.arc / 2) {
            // Successfully passed! Register in the private Set.
            this.hitEntities.add(enemy.id);
            return true;
        }

        return false;
    }
}