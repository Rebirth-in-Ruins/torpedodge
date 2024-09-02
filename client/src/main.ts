import Phaser from 'phaser';
import Player from './player';
import ProgressBar from './progressbar';
import Battlefield from './battlefield';
import Explosion from './explosion';
import { Direction } from './direction';
import Leaderboard from './leaderboard';

class Game extends Phaser.Scene
{
    private keys: any;

    private TURN_DURATION: number = 1500;

    private currentTurnDuration: number = 0;

    private player: Player;
    private progressBar: ProgressBar;
    private battlefield: Battlefield;

    private leaderboard: Leaderboard;
    // private explosions: Array<Explosion>

    private direction: Direction;

    preload ()
    {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('ship', 'assets/ship (1).png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');

        this.load.aseprite('bomba', 'assets/bomba.png', 'assets/bomba.json');
    }

    create ()
    {
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        const { width, height } = this.sys.game.canvas;

        this.battlefield = new Battlefield(this, width, height);
        this.player = this.battlefield.spawnPlayer('main player', 2, 2);

        this.direction = Direction.Stay;
        // this.battlefield.getPlayer(this.player);

        // this.add.sprite(50, 50).play();

        // this.map.remove(2, 2);

        new Explosion(this);

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
        // const sprite = this.add.sprite(50, 50).play('explosion');
        // sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE,  () =>
        // {
        //         sprite.destroy();
        //         console.log("gone");
        // });

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
            this.battlefield.spawnBomb(this.player);
        }
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

        // Kill players in explosion radius



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
