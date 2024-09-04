import Player from './player';
import Coordinates from './coordinates';
import Bomb from './bomb';
import Explosion from './explosion';
import Airstrike from './airstrike';
import { Direction } from './direction';

export default class Battlefield
{
    private GRID_PERCENTAGE = 0.85;
    private GRID_COUNT: number = 12;

    private _tileSize: number;

    private MARGIN_LEFT: number = 10;
    private MARGIN_TOP: number = 10;

    private map: Player[][];
    private bombMap: Bomb[][];
    private airstrikeMap: Airstrike[][];

    private _players: Map<Player, Coordinates>; 
    private _bombs: Map<Bomb, Coordinates>;
    private _explosions: Map<Explosion, Coordinates>;
    private _airstrikes: Map<Airstrike, Coordinates>;

    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number)
    {
        const gridSize = gameHeight*this.GRID_PERCENTAGE;
        this._tileSize = (gameHeight*this.GRID_PERCENTAGE)/this.GRID_COUNT;

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
        this._players = new Map();
        this._explosions = new Map();
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

    spawnPlayer(name: string, x: number, y: number): Player
    {
        const player = new Player(this.scene, name, this.tileSize);
        this._players.set(player, new Coordinates(x, y));

        // TODO: Place somewhere else if blocked
        this.map[x][y] = player;

        const [worldX, worldY] = this.gridToWorld(x, y);
        player.x = worldX;
        player.y = worldY;

        return player;
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

    spawnExplosion(x: number, y: number)
    {
        const explosion = new Explosion(this.scene);
        this._explosions.set(explosion, new Coordinates(x, y));

        const [worldX, worldY] = this.gridToWorld(x, y);
        explosion.x = worldX;
        explosion.y = worldY;

        // Player collision
        const player = this.map[x][y];
        if(player !== null) {
            player.loseHealth();
            // TODO: Losing Health animation
        }

        this.scene.cameras.main.shake(100);

        // const sprite = this.scene.add.sprite(worldX, worldY).play('explosion');
        // sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE,  () =>
        // {
        //         sprite.destroy();
        //         console.log("gone");
        // });
    }

    spawnAirstrikes()
    {
        let x = this.randomNumber(0, this.GRID_COUNT-1);
        let y = this.randomNumber(0, this.GRID_COUNT-1);

        // Server: Only spawn airstrike if no other entity already exists on that space
        const bomb = this.bombMap[x][y];
        const player = this.map[x][y];
        const other = this.airstrikeMap[x][y];
        if(bomb !== null || player !== null || other !== null)
            return;

        const airstrike = new Airstrike(this.scene);
        this._airstrikes.set(airstrike, new Coordinates(x, y));

        const [worldX, worldY] = this.gridToWorld(x, y);
        airstrike.x = worldX;
        airstrike.y = worldY;

        this.airstrikeMap[x][y] = airstrike;
    }

    randomNumber(min: number, max: number): number
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    removeAirstrike(airstrike: Airstrike)
    {
        const { x, y } = this._airstrikes.get(airstrike);

        this.airstrikeMap[x][y] = null;
        this._airstrikes.delete(airstrike);
        airstrike.destroy();

        for(let i = 0; i < this.GRID_COUNT; i++)
        {
            this.spawnExplosion(x, i);
            this.spawnExplosion(i, y);
        }

    }

    removeBomb(bomb: Bomb)
    {
        const { x, y } = this._bombs.get(bomb);

        this.bombMap[x][y] = null;
        this._bombs.delete(bomb);
        bomb.destroy();

        for(let i = 0; i < this.GRID_COUNT; i++)
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

    moveAndCollide(player: Player, direction: Direction)
    {
        const old = this._players.get(player);
        const neww = old.move(direction);

        // Collision
        if(this.outOfBounds(neww) || this.map[neww.x][neww.y] != null)
            return

        // Update data structures
        this.map[old.x][old.y] = null;
        this.map[neww.x][neww.y] = player;
        this._players.set(player, neww)

        // Update image position
        const [worldX, worldY] = this.gridToWorld(neww.x, neww.y);
        player.x = worldX;
        player.y = worldY;
    }

    outOfBounds(coords: Coordinates): boolean
    {
        const horizontal = coords.x < 0 || this.GRID_COUNT <= coords.x;
        const vertical = coords.y < 0 || this.GRID_COUNT <= coords.y;

        return horizontal || vertical;
    }

    gridToWorld(x: number, y: number)
    {
        const worldX = x * this._tileSize + this._tileSize*0.5 + this.MARGIN_LEFT;
        const worldY = y * this._tileSize + this._tileSize*0.5 + this.MARGIN_TOP;

        return [worldX, worldY];
    }

    get players(): Player[]
    {
        return Array.from(this._players).map(([player]) => player);
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
