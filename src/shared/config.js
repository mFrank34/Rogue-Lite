export const TICK_RATE = 30;          // sim ticks per second
export const SNAPSHOT_EVERY = 2;      // send every 2nd tick = 15 Hz

export const WORLD_W = 1920;          // grow later (e.g. 6000)
export const WORLD_H = 1080;
export const VIEW_W = 1920;           // what the client sees
export const VIEW_H = 1080;
export const VIEW_MARGIN = 200;

export const CELL = 32;               // must stay >= 2 * largest radius

export const ENEMY_RADIUS = 16;
export const ENEMIES_PER_LEVEL = 10; // keep low while testing

// client needs these to draw; server should use them too so they never drift
export const PLAYER_W = 24;
export const PLAYER_H = 48;
export const ATTACK_RANGE = 120;
export const ATTACK_ARC = 15 * Math.PI / 180;