/* ============================================================
   dungeon.js — Lost Soul
   Patterns used:
     - Observer  : EventEmitter (on/emit)
     - Singleton : DungeonGenerator (one instance only)
     - Builder   : DungeonBuilder (step by step dungeon construction)
   ============================================================ */


/* ============================================================
   OBSERVER PATTERN
   EventEmitter lets different parts of the code communicate
   without directly calling each other.
   - on(event, callback)  : register a listener for an event
   - emit(event, data)    : fire an event, passing data to all listeners
   ============================================================ */
class EventEmitter {
    constructor() {
        /* listeners is an object where each key is an event name
           and the value is an array of callback functions */
        this.listeners = {};
    }

    /* Register a callback to run when the event fires.
       Example: emitter.on('dungeonReady', (dungeon) => { ... }) */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /* Fire an event, calling every registered callback with data.
       Example: emitter.emit('dungeonReady', dungeonObject) */
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(cb => cb(data));
    }
}


/* ============================================================
   BUILDER PATTERN
   DungeonBuilder constructs a dungeon step by step.
   Each method does one job and returns 'this' so steps
   can be chained: builder.buildWalls().carveFloors()...
   ============================================================ */
class DungeonBuilder {
    constructor(size) {
        this.size = size;

        /* The dungeon object we are building.
           grid     = 2D array: 1 = wall, 0 = floor
           entrance = { row, col } player start position
           exit     = { row, col } player goal position */
        this.dungeon = {
            grid: [],
            entrance: null,
            exit: null,
            size: size
        };
    }

    /* Step 1: fill the entire grid with 1s (all walls) */
    buildWalls() {
        for (let row = 0; row < this.size; row++) {
            this.dungeon.grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.dungeon.grid[row][col] = 1;
            }
        }
        return this;
    }

    /* Step 2: randomly carve floor tiles (0) inside the border.
       We skip row 0, row size-1, col 0, col size-1
       so the outer edge always stays as walls */
    carveFloors() {
        for (let row = 1; row < this.size - 1; row++) {
            for (let col = 1; col < this.size - 1; col++) {
                if (Math.random() < 0.5) {
                    this.dungeon.grid[row][col] = 0;
                }
            }
        }
        return this;
    }

    /* Step 3: find all floor tiles, then pick two random ones
       for entrance (S) and exit (E).
       The do/while makes sure they never land on the same tile */
    placeEntranceAndExit() {
        const floorTiles = [];

        for (let row = 1; row < this.size - 1; row++) {
            for (let col = 1; col < this.size - 1; col++) {
                if (this.dungeon.grid[row][col] === 0) {
                    floorTiles.push({ row, col });
                }
            }
        }

        this.dungeon.entrance = floorTiles[Math.floor(Math.random() * floorTiles.length)];

        do {
            this.dungeon.exit = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        } while (
            this.dungeon.exit.row === this.dungeon.entrance.row &&
            this.dungeon.exit.col === this.dungeon.entrance.col
            );

        return this;
    }

    /* Final step: return the completed dungeon object */
    getResult() {
        return this.dungeon;
    }
}


/* ============================================================
   SINGLETON PATTERN
   DungeonGenerator can only ever have ONE instance.
   If you call new DungeonGenerator() a second time,
   you get the same object back instead of a new one.
   This makes sure there is always exactly one generator
   controlling the whole game.
   ============================================================ */
class DungeonGenerator {
    constructor() {
        /* If an instance already exists, return it instead of creating a new one */
        if (DungeonGenerator.instance) {
            return DungeonGenerator.instance;
        }

        /* EventEmitter lets the generator fire events
           that other parts of the code can listen to */
        this.events = new EventEmitter();

        /* Save this instance so future calls return it */
        DungeonGenerator.instance = this;
    }

    /* Generate a dungeon of the given size.
       Keeps regenerating until A* confirms a valid path exists
       between entrance and exit, then fires 'dungeonReady'
       so all listeners (renderer, player) can react */
    generate(size) {
        let dungeon;

        do {
            /* Use the Builder to construct the dungeon step by step */
            dungeon = new DungeonBuilder(size)
                .buildWalls()
                .carveFloors()
                .placeEntranceAndExit()
                .getResult();

        } while (!astar(dungeon.grid, dungeon.entrance, dungeon.exit, size));

        /* Fire the event — anything listening to 'dungeonReady'
           will now receive the dungeon object */
        this.events.emit('dungeonReady', dungeon);
    }
}
/* Static property — holds the single instance */
DungeonGenerator.instance = null;


/* ============================================================
   A* PATHFINDING
   Checks whether a walkable path exists between start and end.
   Returns true if a path exists, false if the dungeon is blocked.
   Used to validate the dungeon before rendering it.

   How it works:
   - Start from entrance, explore neighbouring floor tiles
   - Keep going until we reach the exit or run out of tiles
   - 'closed' tracks tiles we already visited so we don't loop
   ============================================================ */
function astar(grid, start, end, size) {
    const open = [start];
    const closed = new Set();

    /* The four directions we can move: up, down, left, right */
    const dirs = [
        { row: -1, col:  0 },
        { row:  1, col:  0 },
        { row:  0, col: -1 },
        { row:  0, col:  1 },
    ];

    while (open.length > 0) {
        const current = open.shift();

        /* If we reached the exit, a path exists */
        if (current.row === end.row && current.col === end.col) {
            return true;
        }

        const key = `${current.row},${current.col}`;
        closed.add(key);

        for (const dir of dirs) {
            const nr = current.row + dir.row;
            const nc = current.col + dir.col;
            const nKey = `${nr},${nc}`;

            /* Skip if out of bounds */
            if (nr < 0 || nr >= size) continue;
            if (nc < 0 || nc >= size) continue;

            /* Skip if already visited */
            if (closed.has(nKey)) continue;

            /* Skip if it is a wall */
            if (grid[nr][nc] === 1) continue;

            open.push({ row: nr, col: nc });
            closed.add(nKey);
        }
    }

    /* No path found */
    return false;
}


/* ============================================================
   RENDERER
   Reads the dungeon object and builds the CSS grid on screen.
   Called every time the dungeon changes (new floor, regenerate).
   ============================================================ */
function renderDungeon(dungeon) {
    const container = document.getElementById('dungeonGrid');
    container.innerHTML = '';

    /* Set CSS grid columns based on dungeon size */
    container.style.gridTemplateColumns = `repeat(${dungeon.size}, 1fr)`;

    for (let row = 0; row < dungeon.size; row++) {
        for (let col = 0; col < dungeon.size; col++) {
            const cell = document.createElement('div');
            cell.classList.add('dungeon-cell');

            /* Store position on the element so we can find it later */
            cell.dataset.row = row;
            cell.dataset.col = col;

            /* Assign the correct class based on what this cell is */
            if (row === dungeon.entrance.row && col === dungeon.entrance.col) {
                cell.classList.add('cell-entrance');
                cell.textContent = 'S';
            } else if (row === dungeon.exit.row && col === dungeon.exit.col) {
                cell.classList.add('cell-exit');
                cell.textContent = 'E';
            } else if (dungeon.grid[row][col] === 1) {
                cell.classList.add('cell-wall');
            } else {
                cell.classList.add('cell-floor');
            }

            container.appendChild(cell);
        }
    }
}


/* ============================================================
   PLAYER
   Tracks the player position and handles keyboard movement.
   Arrow keys move the player, walls block movement.
   When the player leaves the entrance tile, S is restored.
   ============================================================ */
function initPlayer(dungeon) {
    /* Player starts on the entrance tile */
    let playerPos = { row: dungeon.entrance.row, col: dungeon.entrance.col };

    /* Helper: find a cell element by its row and col data attributes */
    function getCell(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    /* Show the player on the entrance tile */
    getCell(playerPos.row, playerPos.col).textContent = '@';

    /* Listen for arrow key presses */
    document.addEventListener('keydown', (e) => {
        const dirs = {
            'ArrowUp':    { row: -1, col:  0 },
            'ArrowDown':  { row:  1, col:  0 },
            'ArrowLeft':  { row:  0, col: -1 },
            'ArrowRight': { row:  0, col:  1 },
        };

        const dir = dirs[e.key];

        /* Ignore keys that are not arrow keys */
        if (!dir) return;

        const newRow = playerPos.row + dir.row;
        const newCol = playerPos.col + dir.col;

        /* Block movement out of bounds */
        if (newRow < 0 || newRow >= dungeon.size) return;
        if (newCol < 0 || newCol >= dungeon.size) return;

        /* Block movement into walls */
        if (dungeon.grid[newRow][newCol] === 1) return;

        /* Clear the old cell — restore S if leaving entrance */
        const oldCell = getCell(playerPos.row, playerPos.col);
        oldCell.textContent =
            (playerPos.row === dungeon.entrance.row &&
                playerPos.col === dungeon.entrance.col) ? 'S' : '';

        /* Update player position */
        playerPos.row = newRow;
        playerPos.col = newCol;

        /* Draw player on new cell */
        getCell(playerPos.row, playerPos.col).textContent = '@';
    });
}


/* ============================================================
   INIT — runs when the page is fully loaded
   1. Create the Singleton generator
   2. Register listeners via Observer (on)
   3. Generate the first dungeon
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* Singleton — always returns the same instance */
    const generator = new DungeonGenerator();

    /* Observer — when dungeonReady fires, render the grid and place the player */
    generator.events.on('dungeonReady', (dungeon) => {
        renderDungeon(dungeon);
        initPlayer(dungeon);
    });

    /* Generate the first floor at size 5x5 */
    generator.generate(15);

});