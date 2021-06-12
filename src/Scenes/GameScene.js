import 'phaser';
import Button from '../Objects/Button';

var maxTrolleyAngleDelta = Phaser.Math.DegToRad(10);

var player;
var trolleys;
var cursors;

var heldTrolleysCount = 0;
var speed = 0;
var speedDelta = 0.001;
var minSpeed = 0;
var maxSpeed = 1;
var leadRotation = 0;
var trolleyAngleDelta = 0;

var loosetrolleys;
var heldTrolleys;
var trolley1;
var trolley2;
var redCar;

export default class GameScene extends Phaser.Scene {
    constructor () {
        super('Game');
    }

    create ()
    {
        // Create references to the width and height of the viewport in browser
        var gameWidth = game.config.width;
        var gameHeight = game.config.height;

        // Set the boundaries of the gameworld
        // worldScaleFactor * dimensions of the browser viewport
        var worldScaleFactor = 2;
        var gameWorld = this.physics.world;
        gameWorld.setBounds(0, 0, gameWidth * worldScaleFactor, gameWidth * worldScaleFactor);

        // A simple background for our game
        // Uses tileSprite for future change to tile if wanted
        var background  = this.add.tileSprite(0, 0, gameWorld.bounds.width, gameWorld.bounds.height, 'Background');
        background.setTileScale(1, 1);
        background.setOrigin(0, 0);

        heldTrolleys = this.physics.add.group();

        trolleys = this.add.container(300, 250);
        for (var i = 0; i < 5; i++) {
            var t = this.add.sprite(0, i * 10, 'trolley');
            trolleys.add(t);
            heldTrolleys.add(t);
            heldTrolleysCount++;
        }

        loosetrolleys = this.physics.add.group();
        trolley1 = this.physics.add.sprite(400, 100, 'trolley');
        trolley2 = this.physics.add.sprite(300, 450, 'trolley');

        redCar = this.physics.add.sprite(300, 150, 'redCar');
        redCar = this.physics.add.sprite(400, 150, 'orangeCar');
        redCar = this.physics.add.sprite(200, 150, 'blueCar');
        redCar = this.physics.add.sprite(500, 150, 'greenCar');
        redCar = this.physics.add.sprite(600, 150, 'blackCar');

        loosetrolleys.add(trolley1);
        loosetrolleys.add(trolley2);

        player = this.physics.add.sprite(0, 0, 'player');
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });
        trolleys.add(player);

        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();

        //  Checks to see if the player overlaps with any of the trolleys
        this.physics.add.overlap(heldTrolleys, loosetrolleys, collectTrolley, null, this);
    }

    update ()
    {

        // if up is held, increment speed to max
        // if down is held decrement speed to min
        // else decay speed to min slowly.

        if (cursors.up.isDown) {
            speed = Math.min(maxSpeed, speed + (speedDelta * heldTrolleysCount));
        } else if (cursors.down.isDown) {
            speed = Math.max(minSpeed, speed - (speedDelta * heldTrolleysCount * 0.6));
        } else {
            speed *= 0.99;
        }

        // left and right bend the trolley chain by modifying trolleyAngleDelta
        if (cursors.left.isDown) {
            if (trolleyAngleDelta <= maxTrolleyAngleDelta) {
                trolleyAngleDelta += Phaser.Math.DegToRad(0.1);
            }
        }
        else if (cursors.right.isDown) {
            if (trolleyAngleDelta >= -maxTrolleyAngleDelta) {
                trolleyAngleDelta -= Phaser.Math.DegToRad(0.1);
            }
        }

        // if moving and turning, rotate lead
        if (speed > 0 && Math.abs(trolleyAngleDelta) > 0) {
            leadRotation -= (speed * trolleyAngleDelta * 0.1);
        }

        if (speed > 0)
        {
            player.anims.play('walk', true);
        }

        var tmpRotation = leadRotation;
        var tmpX = 0;
        var tmpY = 0;
        var i = 0;
        trolleys.each((t) => {
            t.setRotation(tmpRotation);
            t.setX(tmpX);
            t.setY(tmpY);
            tmpRotation += trolleyAngleDelta;
            tmpX -= Math.sin(leadRotation + (i * trolleyAngleDelta)) * 20;
            tmpY += Math.cos(leadRotation + (i * trolleyAngleDelta)) * 20;
            i++;
        });

        trolleys.setX(trolleys.x + Math.sin(leadRotation + trolleyAngleDelta) * speed);
        trolleys.setY(trolleys.y - Math.cos(leadRotation + trolleyAngleDelta) * speed);

        this.cameras.main.centerOn(trolleys.x + player.x, trolleys.y + player.y);
    }
};

function collectTrolley (player, trolley)
{
    heldTrolleysCount++;

    // Add and remove trolley from groups which handle collisions
    loosetrolleys.remove(trolley);
    heldTrolleys.add(trolley);

    // Set new position of trolleys
    trolleys.setX(trolleys.x + (Math.sin((leadRotation - trolleyAngleDelta)) * 20));
    trolleys.setY(trolleys.y - (Math.cos((leadRotation - trolleyAngleDelta)) * 20));
    leadRotation -= trolleyAngleDelta;

    // Add new trolley to the collection
    trolleys.add(trolley);
    trolleys.sendToBack(trolley);
}
