import Phaser from 'phaser';
import Player from './player';
import ProgressBar from './progressbar';
import Simulation from './simulation';
import Battlefield from './battlefield';
import { Direction } from './direction';
import Leaderboard from './leaderboard';

class Game extends Phaser.Scene
{
    private keys: any;

    private TURN_DURATION: number = 1500;

    private currentTurnDuration: number = 0;

    private player: Player;
    private progressBar: ProgressBar;
    private simulation: Simulation;
    private battlefield: Battlefield;

    private leaderboard: Leaderboard;
    // private bombs: Array<Bomb>
    // private explosions: Array<Explosion>

    private direction: Direction;

    preload ()
    {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('ship', 'assets/ship (1).png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');

        // this.load.path = 'assets';
        // this.load.aseprite('bomba', 'bomba.png', 'bomba.json');
    }

    create ()
    {
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        const { width, height } = this.sys.game.canvas;

        this.battlefield = new Battlefield(this, width, height);
        this.player = this.battlefield.spawnPlayer('main player', 2, 2);

        this.direction = Direction.Stay;
        // this.battlefield.getPlayer(this.player);

        // this.map.remove(2, 2);
        // let player = this.map.get(2, 2);

        this.simulation = new Simulation(this, this.player, this.battlefield.tileSize)

        this.progressBar = new ProgressBar(this, width, height);
        this.leaderboard = new Leaderboard(this, width);
        this.leaderboard.render([
            {
                name: 'Armadillo',
                score: 12,
            },
            {
                name: 'Connection Lost',
                score: 1337,  
            },
            {
                name: 'Aeroreido',
                score: 4000,
            },
            {
                name: 'Cpt Connection',
                score: 120,
            },
            {
                name: 'xd',
                score: 120,
            },
        ])
    }

    update(_: number, delta: number) 
    {
        this.currentTurnDuration += delta;
        this.progressBar.setProgress(this.currentTurnDuration / this.TURN_DURATION);
        
        // Turn is over
        if(this.currentTurnDuration > this.TURN_DURATION)
        {
            this.currentTurnDuration = 0;
            this.tick();
        }

        // Inputs
        if(this.keys.W.isDown) 
        {
            this.player.lookUp();
            this.direction = Direction.Up;
        }
        if(this.keys.A.isDown) 
        {
            this.player.lookLeft();
            this.direction = Direction.Left;
        }
        if(this.keys.S.isDown)
        {
            this.player.lookDown();
            this.direction = Direction.Down;
        }
        if(this.keys.D.isDown) 
        {
            this.player.lookRight();
            this.direction = Direction.Right;
        }
        if(this.keys.SPACE.isDown) 
        {
            this.simulation.plantBomb(this.player);
        }
    }

    // Apply simulation
    // - Move
    // - Check collision
    // - Detonate bombs
    // - Kill detonated players
    tick()
    {
        // Move
        for(const player of this.battlefield.players)
        {
            if(player.name == 'main player')
            {
                this.battlefield.moveAndCollide(player, this.direction);
                this.direction = Direction.Stay;
            }

            player.tick();
        }

        // this.explosions.forEach(v => v.tick()) // All explosions count down
        // this.bombs.forEach(v => v.tick()); // All bombs count down

        // Handle bombs
        // const detonated = this.bombs.filter(v => v.denonated);
        
        // detonated.forEach(v => this.spawnCrossExplosion(v.x, v.y));     // Spawn explosions on detonated bombs
        // detonated.forEach(v => v.destroy());                            // Remove detonated bombs
        // this.bombs = this.bombs.filter(v => !v.denonated)               // Keep the undetonated bombs

        // Handle explosions
        // const decayed = this.explosions.filter(v => v.decayed);
        // decayed.forEach(v => v.destroy());
        // this.explosions = this.explosions.filter(v => !v.decayed);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#0000cc',
    width: 1000,
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
