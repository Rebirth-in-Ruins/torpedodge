import Arrow from './arrow';

export default class Player
{
    private scene: Phaser.Scene;
    private size: number;
    private _x: number;
    private _y: number;

    private ship: Phaser.GameObjects.Image;
    private arrow: Arrow;

    private SCALE_FACTOR: number = 0.8;

    private direction: Direction;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number) 
    {
        this.scene = scene;
        this.size = size;
        this._x = x;
        this._y = y;
        this.direction = Direction.Stay;

        this.arrow = new Arrow(scene, size);
        this.create();
    }

    create ()
    {
        const offset = this.size/2;

        this.ship = this.scene.add.image(this._x * this.size + offset, this._y * this.size + offset, 'red');
        this.ship.displayWidth = this.size * this.SCALE_FACTOR;
        this.ship.displayHeight = this.size * this.SCALE_FACTOR;
    }

    get x(): number 
    {
        return this._x;
    }

    get y(): number 
    {
        return this._y;
    }

    moveUp() 
    {
        this.ship.angle = 180; 
        this.direction = Direction.Up;
        this.arrow.pointUp(this._x, this._y);
    }

    moveDown() 
    {
        this.ship.angle = 0;
        this.direction = Direction.Down;
        this.arrow.pointDown(this._x, this._y);
    }

    moveLeft() 
    {
        this.ship.angle = 90;
        this.direction = Direction.Left;
        this.arrow.pointLeft(this._x, this._y);
    }

    moveRight() 
    {
        this.ship.angle = -90;
        this.direction = Direction.Right;
        this.arrow.pointRight(this._x, this._y);
    }

    tick()
    {
        switch(this.direction)
        {
            case Direction.Down:
                this.ship.y += this.size;
                this._y += 1;
                break;
            case Direction.Left:
                this.ship.x -= this.size;
                this._x -= 1;
                break;
            case Direction.Right:
                this.ship.x += this.size;
                this._x += 1;
                break;
            case Direction.Up:
                this.ship.y -= this.size;
                this._y -= 1;
                break;
        }
        
        this.arrow.removeArrow();
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