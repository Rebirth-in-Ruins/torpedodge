import Player from "./player";
import Position from "./position";
import Coordinates from "./coordinates";
import { Direction } from "./direction";

export default class Battlefield {
    private GRID_PERCENTAGE = 0.85;
    private GRID_COUNT: number = 12;

    private _tileSize: number;

    private MARGIN_LEFT: number = 10;
    private MARGIN_TOP: number = 10;

    private map: Position[][];
    private _players: Map<Player, Coordinates> // TODO: rename 'lookup'

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
        this._players = new Map();
        for(let i = 0; i < 12; i++) // TODO: Pass in GRID_COUNT
        { 
            const p = [];
            for(let i = 0; i < 12; i++)
            {
                p.push(null);

            }
            this.map.push(p)
        }

    }

    spawnPlayer(name: String, x: number, y: number): Player
    {
        const player = new Player(this.scene, name, this.tileSize);
        this._players.set(player, new Coordinates(x, y));

        // TODO: Place somewhere else if blocked
        this.map[x][y] = player;

        // Position object correctly on the grid
        let [worldX, worldY] = this.gridToWorld(x, y);
        player.x = worldX;
        player.y = worldY;

        return player;
    }

    getPlayer(input: Player)
    {
        let coords = this._players.get(input);
        let { x, y } = coords.above()
    }

    move(player: Player, direction: Direction) {
        let old = this._players.get(player);
        let neww = old.move(direction);

        // Update data structures
        this.map[old.x][old.y] = null;
        this.map[neww.x][neww.y] = player;
        this._players.set(player, neww)

        // Update image position
        let [worldX, worldY] = this.gridToWorld(neww.x, neww.y);
        player.x = worldX;
        player.y = worldY;
    }

    gridToWorld(x: number, y: number)
    {
        let worldX = x * this._tileSize + this._tileSize*0.5 + this.MARGIN_LEFT;
        let worldY = y * this._tileSize + this._tileSize*0.5 + this.MARGIN_TOP;

        return [worldX, worldY];
    }

    get players(): Player[]
    {
        return Array.from(this._players).map(([player, _]) => player);
    }


    // Expose this so other entities can scale themselves based on tile size.
    get tileSize()
    {
        return this._tileSize;
    }
}
