import Phaser from 'phaser';
import ProgressBar from './progressbar';
import Battlefield from './battlefield';
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

    private musicMuted: boolean = true;
    private soundMuted: boolean = true;

    // This prevents a bug where switching back to the game would draw a lot of explosions
    // Switching away from the tab pauses the game but explosion animations still get queued => too much boom boom.
    private focusLost: boolean = false;

    private music: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private explodeSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    preload ()
    {
        // Images
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('ship', 'assets/ship.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('explosion', 'assets/explosion.png');

        this.load.image('small_shadow', 'assets/shadow_small.png');
        this.load.image('medium_shadow', 'assets/shadow_medium.png');
        this.load.image('big_shadow', 'assets/shadow_big.png');

        this.load.image('music_muted', 'assets/music_muted.png');
        this.load.image('music_unmuted', 'assets/music_unmuted.png');

        this.load.image('sound_muted', 'assets/sound_muted.png');
        this.load.image('sound_unmuted', 'assets/sound_unmuted.png');

        // Animations
        this.load.aseprite('bomba', 'assets/bomba.png', 'assets/bomba.json');

        // Audio
        this.load.audio('explosion1', 'assets/explosion1.mp3');
        this.load.audio('explosion2', 'assets/explosion2.mp3');
        this.load.audio('background_music', 'assets/background_music.mp3');
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

        this.music = this.sound.add('background_music');
        this.music.setLoop(true);

        this.explodeSound = this.sound.add('explosion1'); // TODO: decide on sound
        this.explodeSound.setVolume(0.3); // TODO: reduce volume
        this.explodeSound.setMute(true);

        // TODO: Environment variable for this
        const conn = new WebSocket('ws://localhost:8080' + '/play?spectate=true');
        conn.onclose = () =>
        {
            const graphics = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.3 } });
            graphics.fillRect(0, 0, width, height)

            this.statusText.text = 'Connection lost to server. Please reload';
        };
        conn.onmessage = (evt) =>
        {
            const obj = JSON.parse(evt.data);
            this.render(obj);
        };

        // TODO: Put into classes
        const button = this.add.image(width - 40, 30, 'music_muted');
        button.setScale(2, 2);
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () =>
        {
            this.musicMuted = !this.musicMuted;
            if(this.musicMuted)
            {
                button.setTexture('music_muted');
                this.music.stop();
            }
            else 
            {
                button.setTexture('music_unmuted');
                this.music.play();
            }

        })

        const button2 = this.add.image(width - 90, 30, 'sound_muted');
        button2.setScale(2, 2);
        button2.setInteractive({ useHandCursor: true });
        button2.on('pointerdown', () =>
        {
            this.soundMuted = !this.soundMuted;
            if(this.soundMuted)
            {
                button2.setTexture('sound_muted');
                this.explodeSound.setMute(true);
            }
            else 
            {
                button2.setTexture('sound_unmuted');
                this.explodeSound.setMute(false);
            }

        });

        this.game.events.on('blur', () =>
        {
            this.focusLost = true;
        });
        this.game.events.on('focus', () =>
        {
            this.focusLost = false;
        });
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
            this.battlefield.renderExplosions(obj, this.explodeSound, this.focusLost);
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
