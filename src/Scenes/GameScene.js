import 'phaser';
import Button from '../Objects/Button';

var maxTrolleyAngleDelta = Phaser.Math.DegToRad(10);

var player;
var heldTrolleysCount = 3;
var trolleys;
var cursors;

var speed = 0;
var minSpeed = 0;
var maxSpeed = 1;
var leadRotation = 0;
var trolleyAngleDelta = 0;


export default class GameScene extends Phaser.Scene {
    constructor () {
        super('Game');
    }

    create ()
    {
        // A simple background for our game
        this.add.image(400, 300, 'sky');

        trolleys = this.add.container(150, 150);
        for (var i = 0; i < 10; i++) {
            var t = this.add.sprite(0, i * 10, 'trolley');
            trolleys.add(t);
        }

        player = this.physics.add.sprite(100, 450, 'dude');
        trolleys.add(player);

        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();

        //  Checks to see if the player overlaps with any of the trolleys
        this.physics.add.overlap(player, trolleys, collectTrolley, null, this);
    }

    update ()
    {
        // if up is held, increment speed to max
        // if down is held decrement speed to min
        // else decay speed to min slowly.

        if (cursors.up.isDown) {
            speed = Math.min(maxSpeed, speed + 0.1);
        } else if (cursors.down.isDown) {
            speed = Math.max(minSpeed, speed - 0.1);
        } else {
            speed *= 0.99;
        }

        // @TODO: can we have the angle ripple up the chain?

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
        if (speed > 0.05 && Math.abs(trolleyAngleDelta) > 0.05) {
            if (trolleyAngleDelta > 0) {
                leadRotation -= Phaser.Math.DegToRad(0.5);
            } else {
                leadRotation += Phaser.Math.DegToRad(0.5);
            }
        }

        var tmpRotation = leadRotation;
        var tmpX = trolleys.x;
        var tmpY = trolleys.y;
        var i = 0;
        trolleys.each((t) => {
            tmpRotation += trolleyAngleDelta;
            tmpX -= Math.sin(leadRotation + (i * trolleyAngleDelta)) * 20;
            tmpY += Math.cos(leadRotation + (i * trolleyAngleDelta)) * 20;
            t.setRotation(tmpRotation);
            t.setX(tmpX);
            t.setY(tmpY);
            i++;
        });

        trolleys.setX(trolleys.x + Math.sin(leadRotation + trolleyAngleDelta) * speed);
        trolleys.setY(trolleys.y - Math.cos(leadRotation + trolleyAngleDelta) * speed);
    }
};

function collectTrolley (player, trolley)
{
    trolley.disableBody(true, true);

    heldTrolleysCount++;

    if (trolleys.countActive(true) === 0)
    {
        //  A new batch of trolleys to collect
        trolleys.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    }
}
