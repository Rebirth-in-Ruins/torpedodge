import Phaser from 'phaser';
import Player from './player';
import ProgressBar from './progressbar';
import Simulation from './simulation';

class Game extends Phaser.Scene
{
    private keys: any;

    private GRID_COUNT: number = 12;
    private TURN_DURATION: number = 1500;

    private currentTurnDuration: number = 0;

    private player: Player;
    private progressBar: ProgressBar;
    private simulation: Simulation;

    preload ()
    {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('red', 'assets/ship (1).png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');
    }


    create ()
    {
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        const { width, height } = this.sys.game.canvas;
        const tileSize = width/this.GRID_COUNT;

        const g1 = this.add.grid(0, 0, width, height, tileSize, height/this.GRID_COUNT, 0x0000cc);
        g1.setOrigin(0,0);

        this.player = new Player(this, 6, 6, tileSize);

        this.simulation = new Simulation(this, this.player, tileSize)
        this.simulation.spawnPlayer(2, 2)

        this.progressBar = new ProgressBar(this, width, height);

        // const circle = new Phaser.Geom.Circle(100, 100, 10);
        // const graphics = this.add.graphics({ fillStyle: { color: 0xff0000 } });
        // graphics.fillCircleShape(circle);
    }

    update(_: number, delta: number) 
    {
        this.currentTurnDuration += delta;
        this.progressBar.setProgress(this.currentTurnDuration / this.TURN_DURATION);
        
        // Turn is over
        if(this.currentTurnDuration > this.TURN_DURATION)
        {
            this.currentTurnDuration = 0;
            this.simulation.tick();
        }

        // Inputs
        if(this.keys.W.isDown) 
        {
            this.player.moveUp();
        }
        if(this.keys.A.isDown) 
        {
            this.player.moveLeft();
        }
        if(this.keys.S.isDown)
        {
            this.player.moveDown();
        }
        if(this.keys.D.isDown) 
        {
            this.player.moveRight();
        }
        if(this.keys.SPACE.isDown) 
        {
            this.simulation.plantBomb(this.player);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: Game,
    parent: 'game',
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

new Phaser.Game(config);
