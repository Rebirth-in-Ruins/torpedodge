import Phaser from 'phaser';
import Player from './player';
import ProgressBar from './progressbar';
import Battlefield from './battlefield';
import { Direction } from './direction';
import Leaderboard from './leaderboard';

class GameState
{

}

class Game extends Phaser.Scene
{
    private keys: any;

    private TURN_DURATION: number = 1500;

    private currentTurnDuration: number = 0;

    private player: Player;
    private progressBar: ProgressBar;
    private battlefield: Battlefield;

    private leaderboard: Leaderboard;

    private direction: Direction;

    preload ()
    {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('ship', 'assets/ship (1).png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');

        this.load.image('small_shadow', 'assets/shadow_small.png');
        this.load.image('medium_shadow', 'assets/shadow_medium.png');
        this.load.image('big_shadow', 'assets/shadow_big.png');

        this.load.aseprite('bomba', 'assets/bomba.png', 'assets/bomba.json');
    }

    create ()
    {
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        const { width, height } = this.sys.game.canvas;

        this.battlefield = new Battlefield(this, width, height);
        this.player = this.battlefield.spawnPlayer('main player', 2, 2);

        this.direction = Direction.Stay;

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
        ]);

        this.anims.createFromAseprite('bomba');

        // TODO: Environment variable for this
        const conn = new WebSocket('ws://localhost:8080' + '/play?spectate=true');
        conn.onclose = () =>
        {
            const graphics = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.3 } });
            graphics.fillRect(0, 0, width, height)

            this.add.text(width/2, height - 32, 'Connection lost to server. Please reload')
                .setFontSize(32)
                .setFontFamily('Arial')
                .setStroke('black', 3)
                .setOrigin(0.5, 0.5);
        };
        conn.onerror = function (evt)
        {
            console.log(evt);
        }
        conn.onmessage = (evt) =>
        {
            const obj = JSON.parse(evt.data);
            this.render(obj);
        };
    }

    render(gamestate: GameState)
    {
        console.log(gamestate);

        // TODO: Sync turns
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

        // Manual Inputs
        // if(this.keys.W.isDown) 
        // {
        //     this.player.lookUp();
        //     this.direction = Direction.Up;
        // }
        // if(this.keys.A.isDown) 
        // {
        //     this.player.lookLeft();
        //     this.direction = Direction.Left;
        // }
        // if(this.keys.S.isDown)
        // {
        //     this.player.lookDown();
        //     this.direction = Direction.Down;
        // }
        // if(this.keys.D.isDown) 
        // {
        //     this.player.lookRight();
        //     this.direction = Direction.Right;
        // }
        // if(this.keys.SPACE.isDown) 
        // {
        //     this.battlefield.spawnBomb(this.player);
        // }
    }

    // Apply simulation
    // - Move (moveAndCollide)
    // - Check collision (moveAndCollide)
    // - Detonate bombs 
    // - Kill detonated players
    tick()
    {
        // Move players + do collision
        for(const player of this.battlefield.players)
        {
            player.tick();

            if(player.name == 'main player')
            {
                this.battlefield.moveAndCollide(player, this.direction);
                this.direction = Direction.Stay;
            }
        }

        // Remove previous explosion smoke (TODO: Not needed some day)
        for(const explosion of this.battlefield.explosions)
        {
            explosion.tick()

            if(explosion.decayed)
            {
                this.battlefield.removeExplosion(explosion);
            }
        }

        // Detonate bombs + hit any players in radius
        for(const bomb of this.battlefield.bombs)
        {
            bomb.tick();

            if(bomb.detonated)
            {
                this.battlefield.removeBomb(bomb)
            }
        }

        // Drop airstrikes further
        for(const airstrike of this.battlefield.airstrikes)
        {
            airstrike.tick();
            if(airstrike.detonated)
            {
                this.battlefield.removeAirstrike(airstrike);
            }
        }

        this.battlefield.spawnAirstrikes();
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#0000cc',
    width: 1000,
    height: 700,
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
