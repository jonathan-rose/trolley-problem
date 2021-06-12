import 'phaser';
import { Clock } from 'phaser/src/time';
import Button from '../Objects/Button';

var maxTrolleyAngleDelta = Phaser.Math.DegToRad(10);

var player;
var trolleys;
var cursors;
var trolleyHouse;

var heldTrolleysCount = 1;
var speed = 0;
var speedDelta = 0.3;
var minSpeed = 0;
var maxSpeed = 3;
var leadRotation = 0;
var rotationDelta = 2;
var trolleyAngleDelta = 0;
var startingLooseCount = 20;

var loosetrolleys;
var heldTrolleys;
var inHouse = false;

var nextTrolley;

var redCar;

var frame_count = 0;


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
        for (var i = 0; i < 1; i++) {
            var t = this.add.sprite(0, i * 10, 'trolley');
            trolleys.add(t);
            heldTrolleys.add(t);
            heldTrolleysCount++;
        }

        loosetrolleys = this.physics.add.group();
        for (var i = 0; i < startingLooseCount; i++) {
            t = this.physics.add.sprite(Phaser.Math.RND.between(0, gameWidth), Phaser.Math.RND.between(0, gameHeight), 'trolley');
            loosetrolleys.add(t);
        }

        redCar = this.physics.add.sprite(300, 150, 'redCar');
        redCar = this.physics.add.sprite(400, 150, 'orangeCar');
        redCar = this.physics.add.sprite(200, 150, 'blueCar');
        redCar = this.physics.add.sprite(500, 150, 'greenCar');
        redCar = this.physics.add.sprite(600, 150, 'blackCar');

        // 64 is hard coded value of half the width of trolleyHouse sprite to save time
        var trolleyHouseX = (gameWorld.bounds.width / 2) - 64
        trolleyHouse = this.physics.add.sprite(trolleyHouseX, 100, 'House');

        // Add collider between firstmost trolley and trollyHouse
        this.physics.add.overlap(heldTrolleys, trolleyHouse, scoreTrolley, null, this);

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
        this.model = this.sys.game.globals.model;
        if (this.model.musicOn === true) {
            this.sound.stopAll();
            this.bgMusic = this.sound.add('gameMusic', { volume: 0.5, loop: true });
            this.bgMusic.play();
            this.model.bgMusicPlaying = true;
            this.sys.game.globals.bgMusic = this.bgMusic;
        }
        
    }

    update ()
    {
        // console.log(trolleys.length);

        // if up is held, increment speed to max
        // if down is held decrement speed to min
        // else decay speed to min slowly.

        if (cursors.up.isDown) {
            speed = Math.min(maxSpeed, speed + (speedDelta / heldTrolleysCount));
        } else if (cursors.down.isDown) {
            speed = Math.max(minSpeed, speed - (speedDelta / heldTrolleysCount * 0.6));
        } else {
            speed *= 0.99;
        }

        // left and right bend the trolley chain by modifying trolleyAngleDelta
        if (cursors.left.isDown) {
            if (trolleyAngleDelta <= maxTrolleyAngleDelta) {
                trolleyAngleDelta += Phaser.Math.DegToRad(rotationDelta / (heldTrolleysCount * 2));
            }
        }
        else if (cursors.right.isDown) {
            if (trolleyAngleDelta >= -maxTrolleyAngleDelta) {
                trolleyAngleDelta -= Phaser.Math.DegToRad(rotationDelta / (heldTrolleysCount * 2));
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
    // play sound effect
    this.sound.play(Phaser.Math.RND.pick(['crash-1', 'crash-2', 'crash-3']), { volume: 0.5 });
}

function scoreTrolley ()
{
    // console.log(trolleys.length);

    // -1 on trolley.length to account for player entity
    for (var i = (trolleys.length - 1); i > 1; i--) {
        console.log(i);
        trolleys.remove(trolleys.first);
        heldTrolleysCount--;
    }

    // if(((frame_count % 600) == 0) && trolleys.children.length > 0){
    //     trolleys.remove(trolleys.first);
    //     heldTrolleysCount--;
    // }

    // // var timer = this.add.TimerEvent;
    // if (heldTrolleysCount > 1) {
    //     this.time.delayedCall(1000, trolleys.remove(trolleys.first));
    // heldTrolleysCount--;
    // }

    // if (heldTrolleysCount > 1) {
    //     trolleys.remove(trolleys.first);
    // }
    

    // timer = this.time.addEvent({ delay: 500, timeScale: 1});

    // var timeNow = game.time;

    // if (heldTrolleysCount > 0 && nextTrolley == (timeNow + 500)) {
    //     trolleys.remove(trolleys.first);
    // }
    // else
    // {
    //     nextTrolley = game.time; 
    // };

        // heldTrolleysCount--;
        // trolleys.remove(player);
        // heldTrolleys.remove(trolley);
        // heldTrolleys.remove(heldTrolleys.children[0], true);
        // heldTrolleys.remove(t);
        // heldTrolleys.destroy();
    
    console.log(heldTrolleysCount);
    // heldTrolleys.remove(trolley);
    
}
