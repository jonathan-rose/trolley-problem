import 'phaser';
import Button from '../Objects/Button';

export default class TitleScene extends Phaser.Scene {
    constructor () {
	super('Title');
    }

    preload () {
    }

    create () {
	var config = this.game.config;

        this.add.image(config.width/2, config.height/2, 'menuBG');
        this.add.image(config.width*0.3, config.height/2, 'Logo');

        // Game - Head to Rocket Select page
        this.gameButton = new Button(this, config.width*0.75, config.height/2 - 100, 'Button', 'ButtonPressed', 'Play', 'Game');

        // Options
        this.optionsButton = new Button(this, config.width*0.75, config.height/2, 'Button', 'ButtonPressed', 'Options', 'Options');

        // About
        this.aboutButton = new Button(this, config.width*0.75, config.height/2 + 100, 'Button', 'ButtonPressed', 'About', 'About');

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
};
