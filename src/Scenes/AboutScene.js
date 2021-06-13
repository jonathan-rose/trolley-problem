import 'phaser';
import Button from '../Objects/Button';

export default class AboutScene extends Phaser.Scene {
    constructor () {
        super('About');
    }


    create () {
        var config = this.game.config;
        this.model = this.sys.game.globals.model;
        this.add.image(config.width/2, config.height/2, 'aboutBG');

        this.add.text(
            config.width*0.1,
            config.height*0.11,
            'The Trolley Problem was made in 48 hours\n\nfor the GMTK 2021 Game Jam\n\nwith the theme "Joined Together"\n\n\nby Jon Rose, Beth Kimber and Dave Kimber\n\n\nWe hope you enjoy playing it as much\n\nas we enjoyed making it!',
            { align: 'center', fontSize: '25px', fill: '#000' }
        );
        this.menuButton = new Button(this, 400, 480, 'Button', 'ButtonPressed', 'Menu', 'Title');

    }

};
