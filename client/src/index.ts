import Phaser from 'phaser';
import Player from './player';

class Game extends Phaser.Scene
{
    private keys: any;

    private GRID_COUNT: number = 12;

    private player: Player;

    preload ()
    {
        this.load.image('red', 'assets/ship (1).png');
    }

    create ()
    {

        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        let { width, height } = this.sys.game.canvas;
        const g1 = this.add.grid(0, 0, width, height, width/this.GRID_COUNT, height/this.GRID_COUNT, 0x0000cc);
        g1.setOrigin(0,0);

        this.player = new Player(this, 0, 0, width/this.GRID_COUNT);

        // this.ship = this.add.image(width/(this.GRID_COUNT*2), width/(this.GRID_COUNT*2), 'red');
        // this.ship.displayWidth = width*this.SCALE_FACTOR;
        // this.ship.displayHeight = height*this.SCALE_FACTOR;

        // const circle = new Phaser.Geom.Circle(100, 100, 10);
        // const graphics = this.add.graphics({ fillStyle: { color: 0xff0000 } });
        // graphics.fillCircleShape(circle);
    }

    update(time, delta) 
    {
        if(this.keys.W.isDown) {
            this.player.moveUp();
        }
        if(this.keys.A.isDown) {
            this.player.moveLeft();
        }
        if(this.keys.S.isDown) {
            this.player.moveDown();
        }
        if(this.keys.D.isDown) {
            this.player.moveRight();
        }

        this.player.update(time, delta);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: Game,
    parent: "game",
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { 
                x: 0,
                y: 200 
            }
        }
    }
};

const game = new Phaser.Game(config);