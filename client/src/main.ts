import Phaser from 'phaser';
// import Player from './player';
import ProgressBar from './progressbar';
import Battlefield from './battlefield';
// import { Direction } from './direction';
import Leaderboard from './leaderboard';

// TODO: Better name, better location
export class ServerPlayer
{
    id: number

    name: string

    // coordinates
    x: number
    y: number
    rotation: string

    // amount of lives
    health: number

    // allowed  
    bombCount: number

    // amount of turns until bomb is available
    bombRespawn: number
}

export class ServerAirstrike
{
    id: number

    // coordinates
    x: number
    y: number

    // amount of turns until it explodes
    fuseCount: number
}

export class ServerExplosion
{
    id: number

    x: number
    y: number
}

class ServerSettings
{
    // time until inputs are evaluated and game state is updated
    turnDuration: number

    // size of the map
    gridSize: number

    // how many bombs can be stored at once
    inventorySize: number

    // how many turns it takes before a player can get another bomb
    bombRespawnTime: number

    // how many lives the player has 
    startHealth: number
}

class GameState
{
    players: Array<ServerPlayer>
    airstrikes: Array<ServerAirstrike>
    explosions: Array<ServerExplosion>
    settings: ServerSettings
}

class Game extends Phaser.Scene
{
    private currentTurnDuration: number = 0;

    private progressBar: ProgressBar;
    private battlefield: Battlefield;

    private leaderboard: Leaderboard;

    private statusText: Phaser.GameObjects.Text;

    private width: number;
    private height: number;

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

        this.load.audio('explosion1', 'assets/explosion1.mp3');
        this.load.audio('explosion2', 'assets/explosion2.mp3');
    }

    create ()
    {
        // this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        const { width, height } = this.sys.game.canvas;
        this.width = width;
        this.height = height;

        // this.direction = Direction.Stay;

        this.statusText = this.add.text(width/2, height - 32, 'Loading Game...')
            .setFontSize(32)
            .setFontFamily('Arial')
            .setStroke('black', 3)
            .setOrigin(0.5, 0.5);

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

            this.statusText.text = 'Connection lost to server. Please reload';
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

        // const button = this.add.text(800, 500, 'Play Game', {
        //     fontFamily: 'Arial',
        //     fontSize: '32px',
        //     color: '#ffffff',
        //     align: 'center',
        //     fixedWidth: 260,
        //     backgroundColor: '#2d2d2d'
        // }).setPadding(32).setOrigin(0.5);
        //
        // button.setInteractive({ useHandCursor: true });
        // button.on('pointerdown', () => {
        //
        // });
        // button.on('pointerover', () => {
        //     button.setBackgroundColor('#8d8d8d');
        // });
        // button.on('pointerout', () => {
        //     button.setBackgroundColor('#2d2d2d');
        // });
    }

    // private currentGameState: GameState;
    private settings: ServerSettings;

    render(gamestate: GameState)
    {
        // Render map when we received the settings (if the settings change the client is out of sync but cba).
        if(this.settings === undefined)
    {
            this.settings = gamestate.settings;
            this.settings.turnDuration /= 1_000_000; // convert from nanoseconds
            this.battlefield = new Battlefield(this, this.width, this.height, this.settings.gridSize);
            this.statusText.text = '';
        }

        console.log(gamestate);

        // Render players
        this.battlefield.clearPlayers();
        for(const obj of gamestate.players)
        {
            this.battlefield.renderPlayer(obj);
        }

        // Render airstrikes
        this.battlefield.clearAirstrikes();
        for(const obj of gamestate.airstrikes)
        {
            this.battlefield.renderAirstrike(obj);

        }

        // Render explosions
        for(const obj of gamestate.explosions)
        {
            this.battlefield.renderExplosions(obj);
        }


        this.currentTurnDuration = 0;
        // this.currentGameState = gamestate;
    }

    update(_: number, delta: number) 
    {
        // Only render the turn's progress bar when server told us how long a turn takes.
        if(this.settings === undefined)
            return

        this.currentTurnDuration += delta;
        this.progressBar.setProgress(this.currentTurnDuration / this.settings.turnDuration);

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
        // for(const player of this.battlefield.players)
        // {
        //     player.tick();
        //
        //     if(player.name == 'main player')
        //     {
        //         this.battlefield.moveAndCollide(player, this.direction);
        //         this.direction = Direction.Stay;
        //     }
        // }

        // Remove previous explosion smoke (TODO: Not needed some day)
        // for(const explosion of this.battlefield.explosions)
        // {
        //     explosion.tick()
        //
        //     if(explosion.decayed)
        //     {
        //         this.battlefield.removeExplosion(explosion);
        //     }
        // }
        //
        // // Detonate bombs + hit any players in radius
        // for(const bomb of this.battlefield.bombs)
        // {
        //     bomb.tick();
        //
        //     if(bomb.detonated)
        //     {
        //         this.battlefield.removeBomb(bomb)
        //     }
        // }
        //
        // // Drop airstrikes further
        // for(const airstrike of this.battlefield.airstrikes)
        // {
        //     airstrike.tick();
        //     if(airstrike.detonated)
        //     {
        //         this.battlefield.removeAirstrike(airstrike);
        //     }
        // }
        //
        // this.battlefield.spawnAirstrikes();
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
