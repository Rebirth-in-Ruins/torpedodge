import Phaser from 'phaser';
import ProgressBar from './progressbar';
import Battlefield from './battlefield';
import Leaderboard from './leaderboard';
import Button from './button';
import { GameState, ServerSettings } from './server';

class Game extends Phaser.Scene
{
    private currentTurnDuration: number = 0;

    private progressBar: ProgressBar;
    private battlefield: Battlefield;

    private leaderboard: Leaderboard;

    private statusText: Phaser.GameObjects.Text;

    private width: number;
    private height: number;

    // This prevents a bug where switching back to the game would draw a lot of explosions
    // Switching away from the tab pauses the game but explosion animations still get queued => too much boom boom.
    private focusLost: boolean = false;

    private music: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private explodeSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private deathSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    private settings: ServerSettings;

    preload ()
    {
        // Images
        this.load.image('ship', 'assets/ship.png');
        this.load.image('ship_dead', 'assets/ship_dead.png');
        this.load.image('arrow', 'assets/arrow.png');
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
        this.load.aseprite('bomba', 'assets/explosion.png', 'assets/explosion.json');

        // Audio
        this.load.audio('death', 'assets/death.mp3');
        this.load.audio('explosion', 'assets/explosion.mp3');
        this.load.audio('background_music', 'assets/background_music.mp3');
    }

    create ()
    {
        const { width, height } = this.sys.game.canvas;
        this.width = width;
        this.height = height;

        this.statusText = this.add.text(width/2, height - 32, 'Loading Game...')
            .setFontSize(32)
            .setFontFamily('Arial')
            .setStroke('black', 3)
            .setOrigin(0.5, 0.5);

        this.progressBar = new ProgressBar(this, width, height);
        this.leaderboard = new Leaderboard(this, width);

        this.anims.createFromAseprite('bomba');

        this.music = this.sound.add('background_music');
        this.music.setLoop(true);

        this.explodeSound = this.sound.add('explosion');
        this.explodeSound.setMute(true);

        this.deathSound = this.sound.add('death');
        this.deathSound.setMute(true);

        // @ts-expect-error vite bollocks
        const gameserverUrl = import.meta.env.VITE_GAMESERVER_URL;

        const conn = new WebSocket(gameserverUrl + '?spectate=true');
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

        new Button(this, width - 40, 30, 'music_muted', 'music_unmuted', (active: boolean) =>
        {
            if(active)
                this.music.play();
            else 
                this.music.stop();
        });

        new Button(this, width - 90, 30, 'sound_muted', 'sound_unmuted', (active: boolean) =>
        {
            this.explodeSound.setMute(!active);
            this.deathSound.setMute(!active);
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

    render(gamestate: GameState)
    {
        console.log(gamestate);

        // Render map when we received the settings (if the settings change the client is out of sync but cba).
        if(this.settings === undefined)
        {
            this.settings = gamestate.settings;
            this.settings.turnDuration /= 1_000_000; // convert from nanoseconds
            this.battlefield = new Battlefield(this, this.width, this.height, this.settings.gridSize);
            this.statusText.text = '';
        }

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

        // Render bombs
        this.battlefield.clearBombs();
        for(const obj of gamestate.bombs)
        {
            this.battlefield.renderBomb(obj);
        }

        // Render explosions
        for(const obj of gamestate.explosions)
        {
            this.battlefield.renderExplosions(obj, this.explodeSound, this.focusLost);
        }

        // Render corpses
        this.battlefield.clearCorpses();
        for(const obj of gamestate.corpses)
        {
            this.battlefield.renderCorpse(obj, this.deathSound);
        }

        // Update leaderboard
        this.leaderboard.render(gamestate.leaderboard);

        this.currentTurnDuration = 0;
    }

    update(_: number, delta: number) 
    {
        // Only render the turn's progress bar when server told us how long a turn takes.
        if(this.settings === undefined)
            return

        this.currentTurnDuration += delta;
        this.progressBar.setProgress(this.currentTurnDuration / this.settings.turnDuration);
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
