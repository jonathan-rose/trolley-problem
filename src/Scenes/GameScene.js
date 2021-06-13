import 'phaser';
import { Clock } from 'phaser/src/time';
import Button from '../Objects/Button';

var maxTrolleyAngleDelta = Phaser.Math.DegToRad(10);

var cursors;

var player;
var trolleys;
var trolleyHouse;
var obstacles;

var boundaries;
var upBoundary;
var downBoundary;
var leftBoundary;
var rightBoundary;

var frontTrolleyCollider;
var sideTrolleyCollider;
var loosetrolleys;
var heldTrolleys;

var trolleysVelocityX = 0;
var trolleysVelocityY = 0;

var timeText;
var startingTime = 20;
var remainingTime = startingTime;

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

export default class GameScene extends Phaser.Scene {
    constructor () {
        super('Game');
    }

    create () {
        var config = this.game.config;

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

        trolleys = this.add.container(800, 400);
        for (var i = 0; i < 1; i++) {
            var t = this.add.sprite(0, i * 10, 'trolley');
            trolleys.add(t);
            heldTrolleys.add(t);
            heldTrolleysCount++;
        }

        loosetrolleys = this.physics.add.group();
        for (var i = 0; i < startingLooseCount; i++) {
            t = this.physics.add.sprite(Phaser.Math.RND.between(0, gameWidth), Phaser.Math.RND.between(0, gameHeight), 'trolley');
            t.setRotation(Phaser.Math.RND.rotation());
            t.setCollideWorldBounds(true);
            loosetrolleys.add(t);
        }

        var redCar = this.physics.add.sprite(300, 150, 'redCar');
        var orangeCar = this.physics.add.sprite(400, 150, 'orangeCar');
        var blueCar = this.physics.add.sprite(200, 150, 'blueCar');
        var greenCar = this.physics.add.sprite(500, 150, 'greenCar');
        var blackCar = this.physics.add.sprite(600, 150, 'blackCar');

        upBoundary = this.add.rectangle(0, -100, gameWidth * worldScaleFactor, 100);
        downBoundary = this.add.rectangle(0, gameHeight * worldScaleFactor, gameWidth * worldScaleFactor, 100);
        leftBoundary = this.add.rectangle(-100, 0, 100, gameHeight * worldScaleFactor);
        rightBoundary = this.add.rectangle(gameWidth * worldScaleFactor, 0, 100, gameHeight * worldScaleFactor);

        upBoundary.setOrigin(0, 0);
        downBoundary.setOrigin(0, 0);
        leftBoundary.setOrigin(0, 0);
        rightBoundary.setOrigin(0, 0);
        
        boundaries = this.physics.add.group();
        boundaries.add(upBoundary);
        boundaries.add(downBoundary);
        boundaries.add(leftBoundary);
        boundaries.add(rightBoundary);

        this.physics.add.collider(heldTrolleys, boundaries, hitBoundary, null, this);

        obstacles = this.physics.add.group();
        obstacles.add(redCar);
        obstacles.add(orangeCar);
        obstacles.add(blueCar);
        obstacles.add(greenCar);
        obstacles.add(blackCar);

        this.physics.add.collider(heldTrolleys, obstacles, hitObstacle, null, this);
        
        // Position of trolley house
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

        // Input Events
        cursors = this.input.keyboard.createCursorKeys();

        // Checks to see if the front held trolley overlaps with any of the trolleys
        frontTrolleyCollider = this.physics.add.overlap(trolleys.first, loosetrolleys, collectTrolley, null, this);

        // Check to see if non-front held trolleys collide with loose trolleys
        sideTrolleyCollider = this.physics.add.collider(heldTrolleys, loosetrolleys, knockTrolley, null, this);

        // Play the game music
        this.model = this.sys.game.globals.model;
        if (this.model.musicOn === true) {
            this.sound.stopAll();
            this.bgMusic = this.sound.add('gameMusic', { volume: 0.5, loop: true });
            this.bgMusic.play();
            this.model.bgMusicPlaying = true;
            this.sys.game.globals.bgMusic = this.bgMusic;
        }
        
        // Display remaining time
        timeText = this.add.text(
            config.width * 0.5,
            config.height * 0.11,
            remainingTime,
            {align: 'center',
             fontSize: '48px',
             fill: '#FFF',
             backgroundColor: 'rgba(0,0,0,0.5)'}
        );
        timeText.setScrollFactor(0);

        // Decay the timer 50 times a second (looks fast, but uses fewer callbacks)
        this.time.addEvent({
            delay: 20,
            callback: () => {
                remainingTime = Math.max(0, remainingTime - 0.02);
                timeText.setText(remainingTime.toFixed(2));
            },
            loop: true
        });

        // Turn the timer red when you're low on time.
        this.time.addEvent({
            delay: (startingTime * 1000 * 0.5), // roughly half starting time in seconds
            callback: () => {
                timeText.setColor('#FF0000');
            }
        });
    }

    update ()
    {
        var config = this.game.config;

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

        // Draw the trolleys and player based on the trolleys container position, rotation and trolleyAngleDelta
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

        trolleys.setX(trolleys.x + trolleysVelocityX);
        trolleys.setY(trolleys.y + trolleysVelocityY);

        trolleysVelocityX *= 0.95;
        trolleysVelocityY *= 0.95;

        // slow down moving loose trolleys
        loosetrolleys.children.each((t) => {
            t.body.setVelocityX(0.98 * t.body.velocity.x);
            t.body.setVelocityY(0.98 * t.body.velocity.y);
            t.body.setAngularVelocity(0.98 * t.body.angularVelocity);
        });

        this.cameras.main.centerOn(trolleys.x + player.x, trolleys.y + player.y);
    }
};

function collectTrolley (player, trolley) {
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

    // reset the front and side trolley colliders
    frontTrolleyCollider.destroy();
    frontTrolleyCollider = this.physics.add.overlap(trolleys.first, loosetrolleys, collectTrolley, null, this);
    sideTrolleyCollider.destroy();
    sideTrolleyCollider = this.physics.add.collider(heldTrolleys, loosetrolleys, knockTrolley, null, this);

    // play sound effect
    this.sound.play(Phaser.Math.RND.pick(['crash-1', 'crash-2', 'crash-3']), { volume: 0.5 });
}

function scoreTrolley (trolleyHouse, trolley)
{
    if (trolleys.length > 2) 
    {
        trolley.destroy();
        heldTrolleysCount--;

        trolleys.setX(trolleys.x - Math.sin(leadRotation - trolleyAngleDelta) * 20);
        trolleys.setY(trolleys.y + Math.cos(leadRotation - trolleyAngleDelta) * 20);
    }

    // reset the front and side trolley colliders
    frontTrolleyCollider.destroy();
    frontTrolleyCollider = this.physics.add.overlap(trolleys.first, loosetrolleys, collectTrolley, null, this);
    sideTrolleyCollider.destroy();
    sideTrolleyCollider = this.physics.add.collider(heldTrolleys, loosetrolleys, knockTrolley, null, this);

}

/**
 * Knock trolleys out of the way of the trolley chain if they hit the sides.
 */
function knockTrolley(heldTrolley, looseTrolley) {
    // Clone the position vectors so we don't actually modify them
    var heldPos = heldTrolley.body.position.clone();
    var loosePos = looseTrolley.body.position.clone();

    // Calculate the vector between the two trolleys
    var diff = loosePos.subtract(heldPos);

    // Normalise it to get a directed unit vector
    var unit = diff.normalize();

    // Update the velocity of the loose trolley based on the unit vector direction
    if (heldTrolley != trolleys.first) {
        looseTrolley.body.setVelocityX(unit.x * 200);
        looseTrolley.body.setVelocityY(unit.y * 200);
        looseTrolley.body.setAngularVelocity(Phaser.Math.RND.sign() * Phaser.Math.RND.between(75, 125));
    }
}

function hitObstacle(heldTrolley, obstacle)
{
    var heldPos = heldTrolley.body.position.clone();
    var obstaclePos = obstacle.body.position.clone();

    var diff = heldPos.subtract(obstaclePos);

    var unit = diff.normalize();

    trolleysVelocityX += unit.x * (speed * 2);
    trolleysVelocityY += unit.y * (speed * 2);

}

function hitBoundary(heldTrolley, boundaryBlock)
{
    if (boundaryBlock = upBoundary)
    {
        trolleysVelocityY += (speed * 2);
    }

    if (boundaryBlock = downBoundary)
    {
        trolleysVelocityY -= (speed * 2);
    }
    
    if (boundaryBlock = leftBoundary)
    {
        trolleysVelocityX += (speed * 2);
    }

    if (boundaryBlock = rightBoundary)
    {
        trolleysVelocityX -= (speed * 2);
    }
}
