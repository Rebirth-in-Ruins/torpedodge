import Player from './player';

export default class Simulation
{

    private scene: Phaser.Scene;
    private tileSize: number;

    constructor(scene: Phaser.Scene, player: Player, tileSize: number)
    {
        // this.mainPlayer = player;
        // this.bombs = [];
        // this.explosions = [];
        this.scene = scene;
        this.tileSize = tileSize;
    }

    // Apply simulation
    // - Move
    // - Check collision
    // - Detonate bombs
    // - Kill detonated players
    tick()
    {
    }

    spawnCrossExplosion(x: number, y: number)
    {
        // const explosion = new Explosion(this.scene, x, y, this.tileSize);
        // this.explosions.push(explosion);
    }
}
