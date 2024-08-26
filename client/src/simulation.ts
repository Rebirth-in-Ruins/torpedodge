import Bomb from './bomb';
import Explosion from './explosion';
import Player from './player';

export default class Simulation
{
    private mainPlayer: Player;

    private bombs: Array<Bomb>
    private explosions: Array<Explosion>
    private players: Array<Player>;

    private scene: Phaser.Scene;
    private tileSize: number;

    private map: any[][];

    constructor(scene: Phaser.Scene, player: Player, tileSize: number)
    {
        this.mainPlayer = player;

        this.bombs = [];
        this.explosions = [];
        this.players = [];
        this.scene = scene;
        this.tileSize = tileSize;

        this.map = [];
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

    // Apply simulation
    // - Move
    // - Detonate Bombs
    // - Check collision
    //      - Kill touching players
    tick()
    {
        this.mainPlayer.tick(); // Player moves

        this.explosions.forEach(v => v.tick()) // All explosions count down
        this.bombs.forEach(v => v.tick()); // All bombs count down

        // Handle bombs
        const detonated = this.bombs.filter(v => v.denonated);
        
        detonated.forEach(v => this.spawnCrossExplosion(v.x, v.y));     // Spawn explosions on detonated bombs
        detonated.forEach(v => v.destroy());                            // Remove detonated bombs
        this.bombs = this.bombs.filter(v => !v.denonated)               // Keep the undetonated bombs

        // Handle explosions
        const decayed = this.explosions.filter(v => v.decayed);
        decayed.forEach(v => v.destroy());
        this.explosions = this.explosions.filter(v => !v.decayed);
    }

    plantBomb(player: Player)
    {
        this.bombs.push(new Bomb(this.scene, player.x, player.y, this.tileSize))
    }

    spawnPlayer(x: number, y: number)
    {
        const player = new Player(this.scene, x, y, this.tileSize);
        this.players.push(player);
    }

    spawnCrossExplosion(x: number, y: number)
    {
        const explosion = new Explosion(this.scene, x, y, this.tileSize);
        this.explosions.push(explosion);
    }
}