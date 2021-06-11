import 'phaser';
import Button from '../Objects/Button';

var maxTrolleyAngleDelta = Phaser.Math.DegToRad(15);

var player;
var heldTrolleysCount = 3;
var trolleys;
var cursors;

var speed = 0;
var leadRotation = 0;
var trolleyAngleDelta = 0;


export default class GameScene extends Phaser.Scene {
    constructor () {
        super('Game');
    }

    create ()
    {
        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        this.physics.add.container(100, 450);

        // The player and its settings
        player = this.physics.add.sprite(100, 450, 'dude');

        //  Player physics properties. Give the little guy a slight bounce.
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();

        trolleys = this.physics.add.group({
            key: 'trolley',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(player, trolleys, collectTrolley, null, this);
    }

    update ()
    {
        // if up is held, inc speed to max
        // if down is held dec speed to min
        // else dec speed to min slowly.

        if (cursors.up.isDown) {
            player.setVelocityY(-160);
        }
        else if (cursors.down.isDown) {
            player.setVelocityY(160);
        }

        // @TODO: can we have the angle ripple up the chain?

        // if left is held dec trolleyAngleDelta to min, then start dec rotation
        // if right is held inc trolleyAngleDelta to max, then start inc rotation

        if (cursors.left.isDown) {
            if (trolleyAngleDelta >= maxTrolleyAngleDelta) {
                leadRotation += Phaser.Math.DegToRad(1);
            } else {
                trolleyAngleDelta += Phaser.Math.DegToRad(1);
            }
        }
        else if (cursors.right.isDown) {
            if (trolleyAngleDelta <= -maxTrolleyAngleDelta) {
                leadRotation -= Phaser.Math.DegToRad(1);
            } else {
                trolleyAngleDelta -= Phaser.Math.DegToRad(1);
            }
        }

        player.setRotation(leadRotation);
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
