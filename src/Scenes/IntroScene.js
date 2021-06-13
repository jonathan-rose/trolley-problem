import 'phaser';
import Button from '../Objects/Button';

export default class IntroScene extends Phaser.Scene {
    constructor () {
        super('Intro');
    }


    create () {
        this.model = this.sys.game.globals.model;
        var config = this.game.config;

        this.add.image(config.width/2, config.height/2, 'introBG');

        this.menuButton = new Button(this, config.width/3, 500, 'Button', 'ButtonPressed', 'Menu', 'Title');
        this.menuButton = new Button(this, (config.width/3)*2, 500, 'Button', 'ButtonPressed', 'Play', 'Game');
    }
};
