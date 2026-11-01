
export function createGrid(worldW, worldH, cell) {
    const cols = Math.ceil(worldW / cell);
    const rows = Math.ceil(worldH / cell);
    return {
        cell, cols, rows,
        cells: Array.from({ length: cols * rows }, () => [])
    };
}

function cellOf(grid, v, max) {
    return Math.min(max - 1, Math.max(0, Math.floor(v / grid.cell)));
}

function rebuildGrid(grid, list) {
    for (const c of grid.cells) c.length = 0;
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        e.idx = i;
        grid.cells[cellOf(grid, e.y, grid.rows) * grid.cols + cellOf(grid, e.x, grid.cols)].push(e);
    }
}

function separate(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const minDist = a.radius + b.radius;
    const d2 = dx * dx + dy * dy;
    if (d2 >= minDist * minDist) return;

    let d = Math.sqrt(d2), nx, ny;
    if (d < 0.0001) {
        const ang = Math.random() * Math.PI * 2;
        nx = Math.cos(ang); ny = Math.sin(ang); d = 0;
    } else {
        nx = dx / d; ny = dy / d;
    }

    const push = (minDist - d) / 2;
    a.x -= nx * push; a.y -= ny * push;
    b.x += nx * push; b.y += ny * push;
}

export function resolveEnemyCollisions(grid, list) {
    rebuildGrid(grid, list);
    const { cols, rows, cells } = grid;

    for (let i = 0; i < list.length; i++) {
        const a = list[i];
        const cx = cellOf(grid, a.x, cols), cy = cellOf(grid, a.y, rows);

        for (let ny = Math.max(0, cy - 1); ny <= Math.min(rows - 1, cy + 1); ny++) {
            for (let nx = Math.max(0, cx - 1); nx <= Math.min(cols - 1, cx + 1); nx++) {
                for (const b of cells[ny * cols + nx]) {
                    if (a.idx < b.idx) separate(a, b);
                }
            }
        }
    }
}