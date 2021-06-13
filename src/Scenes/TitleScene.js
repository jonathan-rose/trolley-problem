import 'phaser';
import Button from '../Objects/Button';

var indicators;
var purchases;

// @TODO: create food item assets and put their names here
var purchaseOptions = ['player', 'trolley', 'redCar'];

export default class TitleScene extends Phaser.Scene {
    constructor () {
	super('Title');
    }

    create () {
	var config = this.game.config;

        this.add.image(config.width/2, config.height/2, 'menuBG');

        // Draw conveyor belt
        this.add.rectangle(config.width*0.5 - 50, config.height*0.85, config.width + 100, 100, 0x394648);

        // Conveyor belt moving indicators
        indicators = this.physics.add.group();
        for (var i = 0; i < 3; i++) {
            var indicator = this.physics.add.sprite(i*(config.width + 100)/3, config.height*0.85, 'conveyorIndicator');
            indicators.add(indicator);
            indicator.body.setVelocityX(40);
        }

        // Items on conveyor belt
        purchases = this.physics.add.group();
        for(var i = 0; i < 5; i++) {
            var purchase = this.physics.add.sprite(
                i*(config.width + 100)/5 - config.width/2,
                Phaser.Math.RND.between(config.height*0.82, config.height*0.88),
                Phaser.Math.RND.pick(purchaseOptions)
            );
            purchases.add(purchase);
            purchase.body.setVelocityX(40);
        };

        // Game - Head to Rocket Select page
        this.gameButton = new Button(this, config.width*0.75, config.height/2 - 110, 'Button', 'ButtonPressed', 'Play', 'Intro');

        // Options
        this.optionsButton = new Button(this, config.width*0.75, config.height/2 - 10, 'Button', 'ButtonPressed', 'Options', 'Options');

        // About
        this.aboutButton = new Button(this, config.width*0.75, config.height/2 + 90, 'Button', 'ButtonPressed', 'About', 'About');

        this.model = this.sys.game.globals.model;
        if (this.model.musicOn === true && this.model.bgMusicPlaying === false) {
            this.bgMusic = this.sound.add('titleMusic', { volume: 0.5, loop: true });
            this.bgMusic.play();
            this.model.bgMusicPlaying = true;
            this.sys.game.globals.bgMusic = this.bgMusic;
        }

        var tills = this.sound.add('tills');
        tills.play();

        // Play extra tills sounds every few seconds
        var ctx = this;
        this.time.addEvent({
            delay: 6000,
            callback: () => {
                var tills = ctx.sound.add('tills');
                tills.play();
            },
            callbackScope: ctx,
            loop: true
        });
    }

    update () {
        var config = this.game.config;

        indicators.children.each((indicator) => {
            if (indicator.x > config.width + 50) {
                indicator.setX(-50);
            }
        });

        // Refresh purchases when they scroll off screen
        purchases.children.each((purchase) => {
            if (purchase.x > config.width + 50) {
                console.log("NEW");
                purchase.destroy();
                var newPurchase = this.physics.add.sprite(
                    Phaser.Math.RND.between(-100, -50),
                    Phaser.Math.RND.between(config.height*0.82, config.height*0.88),
                    Phaser.Math.RND.pick(purchaseOptions)
                );
                purchases.add(newPurchase);
                newPurchase.body.setVelocityX(40);
            }
        });
    }
};
