// app.js
// where the dudes live

/* Our basic Mob (mobile) object, which will represent anything that moves.
 * Our Mobject.
 * We'll define the shared properties here just for reference,
 * then we'll overwrite them in the factory function createMob to differentiate them.
 */
const Mob = {
    sprite: null,
    locX: null,
    locY: null,
    update: null,
    render: function() {
        ctx.drawImage(this.sprite(), this.locX, this.locY);
    },
};

const Mobs = {
    Enemy: {
        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        sprite: () => Resources.get('images/enemy-bug.png'),
        // Enemies have a gridY value but not a gridX since they have a row but not a column
        gridY: 1,
        // Enemies have a speed stat measured in pixels per second.
        // We'll make the default value 'ludicrous speed'
        speed: 505 / 1000,
        // The default location for enemies is off the right of the screen on the top row.
        // This should trigger the update function to shuffle them into a new row.
        locX: 606,
        locY: 83 - 15,
        // Update the enemy's position, required method for game
        // Parameter: dt, a time delta between ticks
        update: function(dt) {
            // if they're off the right side of the screen, pick a new row and a new speed,
            // then put them back at the start.
            if (this.locX > 605) {
                console.log('moving back to start');
                this.gridY = pickRandomRow();
                this.locY = (83 * this.gridY) - 15;
                this.locX = -101;
                this.speed = pickRandomSpeed();
            } else {
                console.log('moving to the right');
                console.log('current dt: ' + dt);
                console.log('current locX: ' + this.locX);
                console.log('current speed: ' + this.speed);
                this.locX += Math.floor(this.speed * dt);
            }
        },
    },
    Player: {
        // The image/sprite for our player
        sprite: () => Resources.get('images/char-horn-girl.png'),
        // The player also has a gridX and gridY value since it moves on a grid
        gridX: 2,
        gridY: 5,
        // The player's defaut locX and locY are based on their gridX and gridY
        locX: (2 * 101),
        // Each cell on the grid is 83px tall but each sprite is 170px tall,
        // so we have to account for that when we draw them.
        // We shift each mob's sprite up 15px so it looks a bit more centered
        // on the tile.
        locY: (5 * 83) - 15,
        // Update the player's position, required method for game.
        update: function() {
            this.locX = (this.gridX * 101);
            this.locY = (this.gridY * 83) - 15;
        },
        // Handles input by converting it to changes in the player's gridX and
        // gridY values, which the update method then converts to pixels.
        handleInput: function(inp) {
            let xd,
            yd;

            switch (inp) {
                case 'up':
                    // move up
                    xd = 0;
                    yd = -1;
                    break;
                case 'right':
                    // move right
                    xd = 1;
                    yd = 0;
                    break;
                case 'down':
                    // move down
                    xd = 0;
                    yd = 1;
                    break;
                case 'left':
                    // move left
                    xd = -1;
                    yd = 0;
                    break;
                default:
                    // move nowhere
                    xd = 0;
                    yd = 0;
                    break;
            }

            tryToMovePlayerInDir(xd, yd);
        },
    }
};

// This should return a random row between 1 and 3.

function pickRandomRow() {
    return Math.floor(Math.random() * 3) + 1;
}

// This should return a random speed between 2 and 6 columns per second,
// weighted toward the center.

function pickRandomSpeed() {
    let newCPS = (Math.floor(Math.random() * 5) + 2) * 101;
    if (newCPS === 2 && flipACoin()) {
        // There's a 50% chance any 2 will become a 3.
        newCPS = 3;
    } else if (newCPS === 6 && flipACoin()) {
        // There's a 50% chance any 6 will become a 5.
        newCPS = 5;
    }
    return newCPS / 1000;
}

// This function flips a coin and returns 1 or 0.

function flipACoin() {
    return Math.floor(Math.random() * 2);
}

/* This is our mob factory function.
 * Object.assign has changed my life, I've been doing this the hard way
 * for YEARS, and now I don't have to write all the individual prototype
 * declarations to compose the mob's suite of functions?
 * Psh. Donezo.
 */

function createMob(mType) {
    const newMob = {};
    Object.assign(newMob, Mob);
    Object.assign(newMob, Mobs[mType]);
    return newMob;
}

/*
 * Attempts to move the player in the chosen direction.
 * Built specifically for the player mob since the enemy mobs
 * can be off the sides of the map and don't obey the same
 * rules as the player about how they move.
 */

function tryToMovePlayerInDir(xd, yd) {
    const nx = player.gridX + xd,
    ny = player.gridY + yd;

    if (nx < 0 || nx > 4 || ny < 0 || ny > 5) {
        // don't move.
        return;
    } else {
        player.gridX = nx;
        player.gridY = ny;
    }
}

// Now we instantiate the mobjects.

const allEnemies = [];
allEnemies.push(createMob('Enemy'));
allEnemies.push(createMob('Enemy'));
allEnemies.push(createMob('Enemy'));
const player = createMob('Player');

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    const allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    console.log('pressed key ' + allowedKeys[e.keyCode]);
    player.handleInput(allowedKeys[e.keyCode]);
});