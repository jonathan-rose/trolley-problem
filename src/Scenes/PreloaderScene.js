import 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor () {
        super('Preloader');
    }

    preload () {
        // add logo image
        var logo = this.add.image(400, 120, 'Logo');
        logo.setScale(0.45);

        // display progress bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // update progress bar
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        // update file progress text
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });

        // remove progress bar when complete
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        // load assets needed in our game

        this.load.audio('titleMusic', ['assets/sound/music/aldi-ambience.mp3']);
        this.load.audio('gameMusic', ['assets/sound/music/newer-wave.mp3']);
        this.load.audio('tills', ['assets/sound/fx/aldi-tills.wav']);
        this.load.audio('crash-1', ['assets/sound/fx/crash-1.wav']);
        this.load.audio('crash-2', ['assets/sound/fx/crash-2.wav']);
        this.load.audio('crash-3', ['assets/sound/fx/crash-3.wav']);
        this.load.audio('coinSound', ['assets/sound/fx/coin.wav']);


        this.load.image('trolley', 'assets/img/trolley.png');
        this.load.spritesheet('player', 'assets/img/playerSprite.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('coin', 'assets/img/coin.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('carPark', 'assets/img/carPark.png');
        this.load.image('redCar', 'assets/img/carRed.png');
        this.load.image('greenCar', 'assets/img/carGreen.png');
        this.load.image('blueCar', 'assets/img/carBlue.png');
        this.load.image('orangeCar', 'assets/img/carOrange.png');
        this.load.image('blackCar', 'assets/img/carBlack.png');
        this.load.image('conveyorIndicator', 'assets/img/conveyorIndicator.png');
        this.load.image('bin', 'assets/img/bin.png');
        this.load.image('trafCone', 'assets/img/trafficCone.png');

        //Backgrounds
        this.load.image('menuBG', 'assets/img/menuBackground.png');
        this.load.image('optionsBG', 'assets/img/optionsBackground.png');
        this.load.image('aboutBG', 'assets/img/aboutBackground.png');
        this.load.image('introBG', 'assets/img/introBackground.png');

        // TEMP assets
        this.load.image('sky', 'assets/img/sky.png');
        this.load.image('deathScene', 'assets/img/deathScene.png');

        this.load.image('Button', 'assets/img/button1.png');
        this.load.image('ButtonPressed', 'assets/img/button1selected.png');
        this.load.image('box', 'assets/img/box.png');
        this.load.image('checkedBox', 'assets/img/checked1.png');
        //this.load.image('Logo', 'assets/img/logoBigger.png');
        //this.load.image('Background', 'assets/img/background.png');
        this.load.image('House', 'assets/img/trolleyHouse.png');

        // remove progress bar when complete
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            this.game.registry.set('titleMusic', this.sound.add('titleMusic', { volume: 0.5, loop: true }));
            this.game.registry.set('gameMusic', this.sound.add('gameMusic', { volume: 0.5, loop: true }));
            this.game.registry.set('tills', this.sound.add('tills', { volume: 0.5 }));
            this.game.registry.set('crash-1', this.sound.add('crash-1', { volume: 0.5 }));
            this.game.registry.set('crash-2', this.sound.add('crash-2', { volume: 0.5 }));
            this.game.registry.set('crash-3', this.sound.add('crash-3', { volume: 0.5 }));
            this.game.registry.set('coinSound', this.sound.add('coinSound', { volume: 0.5 }));
            this.ready();
        }.bind(this));

        this.timedEvent = this.time.delayedCall(3000, this.ready, [], this);
    }

    create () {
    }

    init () {
        this.readyCount = 0;
    }

    ready () {
        this.scene.start('Title');
    }
};
