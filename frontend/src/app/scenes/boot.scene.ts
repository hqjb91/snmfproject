import { Scene } from 'phaser';

export class BootScene extends Scene {

    joyStick;
    
    constructor() {
        super({
            key: "BootScene"
        });
    }

    preload() {
        this.load.image('tiles', 'assets/map/spritesheet.png');
        this.load.image('bullet', 'assets/bullets/bullet.png');
        this.load.tilemapTiledJSON('map', 'assets/map/map.json');
        this.load.spritesheet('player', 'assets/player_spritesheet.png', { frameWidth: 16, frameHeight: 16 });
    
        this.load.spritesheet('coin', 'assets/enemies/coin.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('bomb', 'assets/enemies/bomb.png', { frameWidth: 20, frameHeight: 26 });
        this.load.spritesheet('explosion', 'assets/enemies/explosion.png', { frameWidth: 96, frameHeight: 96 });
    }

    create() {
        this.scene.start('MainScene');
    }

    upload() {

    }
}