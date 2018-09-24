/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on the player and enemy objects.
 *
 * There was a long description here of how animation frames work, which seemed
 * so elementary to me that it came off as patronizing. The description obviously
 * wasn't for me, so it doesn't really matter.
 *
 * This engine makes the canvas' context (ctx) object globally available because
 * it was written that way when I found it, but I could've just as well passed
 * it in as a parameter with each call to a mob's render method and removed it
 * from app.js entirely.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    let doc = global.document,
    win = global.window,
    canvas = doc.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    lastTime,
    GameMap;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     * This is unchanged except for how dt is calculated.
     */

    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime);

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop and generating our GameMap that's going to save us a bazillion
     * redraws.
     */

    function init() {
        reset();
        lastTime = Date.now();
        GameMap = generateGameMap();
        main();
    }

    /* This function obviously checks for collisions.
     * Here, we don't care about all collisions, just the collisions between
     * an enemy and the player.
     * Should this be a method on the enemies? I didn't think so.
     * Since this 'engine' is more like a barebones framework, I'm using it as
     * such. This means it gets delegated things like physics calculations.
     * The methods on the mobs *ONLY* concern themselves. Anything involving
     * interaction or mass updates came over here with updateEntities.
     */

    function checkCollisions() {
        let collided = false;
        pLeft = player.locX;
        pRight = player.locX + 100;
        allEnemies.forEach(function(enemy) {
            if (enemy.gridY == player.gridY &&
                enemy.locX < pRight &&
                enemy.locX + 100 > pLeft) {
                // YOU COLLIDE
                // GOOD DAY SIR
                collided = true;
            }
        });
        if (collided === true) {
            // We return the player to their starting location
            player.gridX = 2;
            player.gridY = 5;
        }
    }

    // If the player makes it to the water, they win and we move them back to the start

    function checkForWin() {
        if (player.gridY == 0) {
            player.gridX = 2;
            player.gridY = 5;
        }
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. 
     */

    function update(dt) {
        updateEntities(dt);
        checkCollisions();
        checkForWin();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for the
     * player object.
     * The update method for enemy mobs calculates their position based on their
     * speed, then render uses those updated coordinates.
     * The update method for the player mob calculates their position based on
     * their position on the grid, then render uses those updated coordinates.
     */

    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* It's hella weird to me that this code just redraws the one canvas over and over,
     * but real talk I'm not about to rewrite this renderer when it's already here.
     */

    /* OK CHANGED MY MIND
     * We're going to define GameMap as a reference to a canvas that we've drawn
     * the background onto. This way, instead of rebuilding the background every time
     * we redraw, we can just redraw this canvas, then the mobs.
     * That drops us to 5 draws per tick instead of 35.
     */

    function generateGameMap() {
        let baseMapCanvas = doc.createElement('canvas');
        let baseMap = baseMapCanvas.getContext('2d');
        baseMapCanvas.width = 505;
        baseMapCanvas.height = 606;

        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        let rowImages = [
                'images/water-block.png', // Top row is water
            'images/stone-block.png', // Row 1 of 3 of stone
            'images/stone-block.png', // Row 2 of 3 of stone
            'images/stone-block.png', // Row 3 of 3 of stone
            'images/grass-block.png', // Row 1 of 2 of grass
            'images/grass-block.png' // Row 2 of 2 of grass
        ],
        numRows = 6,
        numCols = 5,
        // the width of our cells
        cellW = 101,
        // the height of our cells in the grid.
        // NOTE this isn't the same as the height to account for the way
        // the terrain tiles have a front wall that we have to cover.
        cellH = 83,
        row, col;

        baseMap.fillStyle = 'black';
        baseMap.fillRect(0, 0, baseMapCanvas.width, baseMapCanvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                baseMap.drawImage(Resources.get(rowImages[row]), col * cellW, row * cellH);
            }
        }

        return baseMapCanvas;
    }

    function render() {
        ctx.drawImage(GameMap, 0, 0);
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */

    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */

    function reset() {
        // I am not normally one to turn in the minimum viable product for a
        // project, but I'm already behind and this isn't my first rodeo,
        // so I managed to put all this together over a weekend.
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
            'images/stone-block.png',
            'images/water-block.png',
            'images/grass-block.png',
            'images/enemy-bug.png',
            'images/char-horn-girl.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);