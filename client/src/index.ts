import Phaser from 'phaser';
import Player from './player';
import CollisionDetection from './collision';
import ProgressBar from './progressbar';

class Game extends Phaser.Scene
{
    private keys: any;

    private GRID_COUNT: number = 12;
    private TURN_DURATION: number = 1000;

    private currentTurnDuration: number = 0;


    private player: Player;
    private progressBar: ProgressBar;

    preload ()
    {
        this.load.image('red', 'assets/ship (1).png');
        this.load.image('arrow', 'assets/arrow.png');
    }

    // TODO: ok?
    private collisionDetection: CollisionDetection

    create ()
    {
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        let { width, height } = this.sys.game.canvas;

        // Text
        const g1 = this.add.grid(0, 0, width, height, width/this.GRID_COUNT, height/this.GRID_COUNT, 0x0000cc);
        g1.setOrigin(0,0);

        this.player = new Player(this, 0, 0, width/this.GRID_COUNT);
        let object = new Player(this, 2, 2, width/this.GRID_COUNT);

        this.collisionDetection = new CollisionDetection();
        this.collisionDetection.add(this.player);
        this.collisionDetection.add(object);

        // let tileSize = width/this.GRID_COUNT;

        // // Right
        // this.add.image(tileSize*1 + tileSize, tileSize*0.5 + tileSize, 'arrow');

        // // Left
        // let larrow = this.add.image(tileSize*0 + tileSize, tileSize*0.5 + tileSize, 'arrow');
        // larrow.angle = 180;

        // // Up
        // let uarrow = this.add.image(tileSize*0.5 + tileSize, tileSize*0 + tileSize, 'arrow');
        // uarrow.angle = -90;

        // // Down
        // let darrow = this.add.image(tileSize*0.5 + tileSize, tileSize*1 + tileSize, 'arrow');
        // darrow.angle = 90;

        this.progressBar = new ProgressBar(this, width, height);

        // this.ship = this.add.image(width/(this.GRID_COUNT*2), width/(this.GRID_COUNT*2), 'red');
        // this.ship.displayWidth = width*this.SCALE_FACTOR;
        // this.ship.displayHeight = height*this.SCALE_FACTOR;

        // const circle = new Phaser.Geom.Circle(100, 100, 10);
        // const graphics = this.add.graphics({ fillStyle: { color: 0xff0000 } });
        // graphics.fillCircleShape(circle);
    }

    update(time: number, delta: number) 
    {
        this.currentTurnDuration += delta;
        this.progressBar.setProgress(this.currentTurnDuration / this.TURN_DURATION);
        
        // Turn is over
        if(this.currentTurnDuration > this.TURN_DURATION) {
            this.currentTurnDuration = 0;
            // Move the player in the direction he wanted
        }

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
