export default class Arrow
{
    private scene : Phaser.Scene;
    private x: number
    private y: number
    private tileSize: number;

    private arrow: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, tilesize: number)
    {
        this.scene = scene;
        this.tileSize = tilesize;

        // Spawn outside the world so that it is not null
        this.arrow = this.scene.add.image(-100, -100, 'arrow');
    }
    
    pointRight(playerX: number, playerY: number)
    {
        const x = playerX * this.tileSize + this.tileSize;
        const y = playerY * this.tileSize + this.tileSize*0.5;

        this.arrow.x = x;
        this.arrow.y = y;
        this.arrow.angle = 0;
    }

    pointLeft(playerX: number, playerY: number) 
    {
        const x = playerX * this.tileSize + 0;
        const y = playerY * this.tileSize + this.tileSize*0.5;

        this.arrow.x = x;
        this.arrow.y = y;
        this.arrow.angle = 180;
    }

    pointUp(playerX: number, playerY: number) 
    {
        const x = playerX * this.tileSize + this.tileSize*0.5;
        const y = playerY * this.tileSize + 0;

        this.arrow.x = x;
        this.arrow.y = y;
        this.arrow.angle = -90;
    }

    pointDown(playerX: number, playerY: number)
    {
        const x = playerX * this.tileSize + this.tileSize*0.5;
        const y = playerY * this.tileSize + this.tileSize;
        
        this.arrow.x = x;
        this.arrow.y = y;
        this.arrow.angle = 90;
    }

    removeArrow() 
    {
        this.arrow.x = -100;
        this.arrow.y = -100;
    }
}