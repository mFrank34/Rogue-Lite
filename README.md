# Rogue-Lite

it's small game designed to understand multiplayer stacks while being a fun and interesting way to show off code and building a system design.

goal of this project to design a multiplayer game with html canvas and js, helping to understand game networking stacks within games, though simple web game.

the idea of the game, you are person needing escape a dungeon, that gets progressively more difficult more levels you clime either with friend or multiple group, with matchmaking.

# language and requirements

this web application will be using js, html, CSS for web client while the server will be using node.js to run with built in API tools.

# asset

the asset will be made either by me or gathered from online sources, depending how I feel, or might be regular blocks.

````
src/
  server.js              // thin: express/http + ws, starts the game, nothing else
  server/
    game.js              // tick loop, update, spawning, waves
    collision.js         // grid, separate, resolveEnemyCollisions
    network.js           // sockets, input queue, snapshots
    entities.js          // sim-only Player/Enemy (no drawing)
  shared/
    config.js            // GAME_W/H, WORLD_W/H, CELL, speeds, tick rate
    protocol.js          // message types, snapshot format
    movement.js          // pure player movement (if you predict)
  public/                // client only, this is what the browser downloads
    index.html
    style.css
    client.js            // bootstrap + render loop
    input.js
    net.js
    camera.js
    renderer.js
    debug.js```
````
