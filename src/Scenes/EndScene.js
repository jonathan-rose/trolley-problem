import 'phaser';
import Button from '../Objects/Button';

export default class EndScene extends Phaser.Scene {
    constructor () {
        super('End');
    }


    create () {
        var config = this.game.config;
        this.model = this.sys.game.globals.model;

        var popup = this.add.image(config.width/2, config.height/2, 'deathScene');
        var text = this.add.text(360, 320, this.model.score, { fontSize: '80px', fill: '#FFF' });
        var menuButton = new Button(this, 200, 500, 'Button', 'ButtonPressed', 'Menu', 'Title');
        var playButton = new Button(this, 600, 500, 'Button', 'ButtonPressed', 'Play Again', 'Game');
    }
};
