import Player from './player';
import Coordinates from './coordinates';
import Bomb from './bomb';
import Explosion from './explosion';
import Airstrike from './airstrike';
import { ServerAirstrike, ServerExplosion, ServerPlayer } from './main';
import { Direction } from './direction';

export default class Battlefield
{
    private GRID_PERCENTAGE = 0.85;
    private gridCount: number;

    private _tileSize: number;

    private MARGIN_LEFT: number = 10;
    private MARGIN_TOP: number = 10;

    private map: Player[][];
    private bombMap: Bomb[][];
    private airstrikeMap: Airstrike[][];

    // private _players: Map<Player, Coordinates>; 
    private _bombs: Map<Bomb, Coordinates>;
    private _explosions: Map<Explosion, Coordinates>;
    // private _airstrikes: Map<Airstrike, Coordinates>;

    private scene: Phaser.Scene;

    private explodeSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number, gridCount: number)
    {
        this.gridCount = gridCount;

        const gridSize = gameHeight*this.GRID_PERCENTAGE;
        this._tileSize = (gameHeight*this.GRID_PERCENTAGE)/this.gridCount;

        // Draw black background offset by a 2px background (serves as the grid border).
        const r1 = scene.add.rectangle(this.MARGIN_LEFT-2, this.MARGIN_TOP-2, gridSize+2, gridSize+2, 0x000000, 0.5);
        r1.setOrigin(0,0);

        // Draw the grid on top
        const g1 = scene.add.grid(this.MARGIN_LEFT, this.MARGIN_TOP, gridSize, gridSize, this._tileSize, this._tileSize, 0x0000cc, 1, 0x000000, 0.5);
        g1.setOrigin(0,0);

        this.scene = scene;
        this.map = [];
        this.bombMap = [];
        this.airstrikeMap = [];

        this._bombs = new Map();
        // this._players = new Map();
        // this._explosions = new Map();
        this._airstrikes = new Map();

        const init = (arr) =>
        {
            for(let i = 0; i < 12; i++) // TODO: Pass in GRID_COUNT
            { 
                const p = [];
                for(let i = 0; i < 12; i++)
                {
                    p.push(null);

                }
                arr.push(p);
            }
        }

        init(this.map);
        init(this.bombMap);
        init(this.airstrikeMap);
    }

    private _players: Map<number, Player> = new Map(); 
    private _airstrikes: Map<number, Airstrike> = new Map(); 

    renderPlayer(obj: ServerPlayer)
    {
        let player = this._players.get(obj.id);

        // New player joined and needs to be added
        if(player == undefined)
        {
            player = new Player(this.scene, obj.name, this._tileSize);
            this._players.set(obj.id, player);
        }

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        player.x = worldX;
        player.y = worldY;
        player.lookDirection(obj.rotation);
    }

    renderAirstrike(obj: ServerAirstrike)
    {
        const airstrike = new Airstrike(this.scene, obj.fuseCount);
        this._airstrikes.set(obj.id, airstrike);

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        airstrike.x = worldX;
        airstrike.y = worldY;
    }

    renderExplosions(obj: ServerExplosion, sound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound, focusLost: boolean)
    {
        if(focusLost)
            return

        const explosion = new Explosion(this.scene);

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        explosion.x = worldX;
        explosion.y = worldY;

        this.scene.cameras.main.shake(200, 0.01);
        sound.play();
        // TODO: Explosion sound here
    }

    clearPlayers()
    {
        for(const [id, player] of this._players)
        {
            player.destroy();
            this._players.delete(id);
        }
    }

    clearAirstrikes()
    {
        for(const [id, airstrike] of this._airstrikes)
        {
            airstrike.destroy();
            this._airstrikes.delete(id);
        }

        // this.explodeSound.play(); // TODO: Can this be less annoying?
    }

    removePlayer(id: number)
    {
        const player = this._players.get(id);
        player.destroy();
        this._players.delete(id);
    }

    spawnBomb(player: Player)
    {
        const { x, y } = this._players.get(player);

        // Server: Only spawn bomb if no bomb already exists on that space
        const exists = this.bombMap[x][y];
        if(exists !== null || player.noAmmo)
            return;

        const bomb = new Bomb(this.scene);
        this._bombs.set(bomb, new Coordinates(x, y));

        this.bombMap[x][y] = bomb;

        player.useBomb();

        const [worldX, worldY] = this.gridToWorld(x, y);
        bomb.x = worldX;
        bomb.y = worldY;
    }

    removeBomb(bomb: Bomb)
    {
        const { x, y } = this._bombs.get(bomb);

        this.bombMap[x][y] = null;
        this._bombs.delete(bomb);
        bomb.destroy();

        for(let i = 0; i < this.gridCount; i++)
        {
            this.spawnExplosion(x, i);
            this.spawnExplosion(i, y);
        }
    }

    removeExplosion(explosion: Explosion)
    {
        explosion.destroy();
        this._explosions.delete(explosion);
    }

    // moveAndCollide(player: Player, direction: Direction)
    // {
    //     const old = this._players.get(player);
    //     const neww = old.move(direction);
    //
    //     // Collision
    //     if(this.outOfBounds(neww) || this.map[neww.x][neww.y] != null)
    //         return
    //
    //     // Update data structures
    //     this.map[old.x][old.y] = null;
    //     this.map[neww.x][neww.y] = player;
    //     this._players.set(player, neww)
    //
    //     // Update image position
    //     const [worldX, worldY] = this.gridToWorld(neww.x, neww.y);
    //     player.x = worldX;
    //     player.y = worldY;
    // }

    outOfBounds(coords: Coordinates): boolean
    {
        const horizontal = coords.x < 0 || this.gridCount <= coords.x;
        const vertical = coords.y < 0 || this.gridCount <= coords.y;

        return horizontal || vertical;
    }

    gridToWorld(x: number, y: number)
    {
        const worldX = x * this._tileSize + this._tileSize*0.5 + this.MARGIN_LEFT;
        const worldY = y * this._tileSize + this._tileSize*0.5 + this.MARGIN_TOP;

        return [worldX, worldY];
    }

    get playerIds(): number[]
    {
        return Array.from(this._players).map(([id]) => id);
    }

    get bombs(): Bomb[]
    {
        return Array.from(this._bombs).map(([bomb]) => bomb);
    }

    get explosions(): Explosion[]
    {
        return Array.from(this._explosions).map(([explosion]) => explosion);
    }

    get airstrikes(): Airstrike[]
    {
        return Array.from(this._airstrikes).map(([airstrike]) => airstrike);
    }
    
    // Expose this so other entities can scale themselves based on tile size.
    get tileSize()
    {
        return this._tileSize;
    }
}
