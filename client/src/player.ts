import Arrows from './arrows';

export default class Player
{
    private scene: Phaser.Scene;
    private size: number;
    private x: number;
    private y: number;

    private ship: Phaser.GameObjects.Image;
    private moveCooldown: number = 0;

    private MOVE_COOLDOWN: number = 200; // in ms
    private SCALE_FACTOR: number = 0.8;

    private arrow : Arrows;

    private direction: Direction;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number) {
        this.scene = scene;
        this.size = size;
        this.x = x;
        this.y = y;
        this.direction = Direction.Stay;

        this.create();
    }
    
    preload() {
        this.scene.load.image('red', 'assets/ship (1).png');
    }

    create ()
    {
        const offset = this.size/2;

        this.ship = this.scene.add.image(this.x * this.size + offset, this.y * this.size + offset, 'red');
        this.ship.displayWidth = this.size * this.SCALE_FACTOR;
        this.ship.displayHeight = this.size * this.SCALE_FACTOR;
    }

    update()
    {
        
    }

    getCoordinates(): {x: number, y: number} 
    {
        return {x: this.x, y: this.y}
    }

    getX(): number 
    {
        return this.x;
    }

    getY(): number 
    {
        return this.y;
    }

    moveUp() 
    {
        this.ship.angle = 180; 
        this.direction = Direction.Up;
    }

    moveDown() 
    {
        this.ship.angle = 0;
        this.direction = Direction.Down;
    }

    moveLeft() 
    {
        this.ship.angle = 90;
        this.direction = Direction.Left;

    }

    moveRight() 
    {
        this.ship.angle = -90;
        this.direction = Direction.Right;

    }

    move()
    {
        switch(this.direction)
        {
            case Direction.Down:
                this.ship.y += this.size;
                this.y -= 1;
                break;
            case Direction.Left:
                this.ship.x -= this.size;
                this.x -= 1;
                break;
            case Direction.Right:
                this.ship.x += this.size;
                this.x += 1;
                break;
            case Direction.Up:
                this.ship.y -= this.size;
                this.y += 1;
                break;
        }
        this.direction = Direction.Stay;
    }
}

enum Direction {
    Up = 1,
    Down,
    Left,
    Right,
    Stay,
}