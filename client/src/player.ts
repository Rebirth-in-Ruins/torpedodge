import Position from './position';
import { Direction } from './direction';

export default class Player implements Position
{
    private scene: Phaser.Scene;
    private tileSize: number;

    private ship: Phaser.GameObjects.Image;
    private arrow: Phaser.GameObjects.Image;

    private SCALE_FACTOR: number = 0.8;

    private _name: string; // TODO: Name tag

    constructor(scene: Phaser.Scene, name: string, tileSize: number) 
    {
        this.scene = scene;
        this.tileSize = tileSize;
        this._name = name;

        // this.arrow = new Arrow(scene, size);
        this.arrow = this.scene.add.image(-100, -100, 'arrow');

        // Spawn somewhere far away and let the map place it into correct position
        this.ship = this.scene.add.image(-100, -100, 'ship');
        this.ship.displayWidth = this.tileSize * this.SCALE_FACTOR;
        this.ship.displayHeight = this.tileSize * this.SCALE_FACTOR;
    }
    tick()
    {
        this.arrow.alpha = 0;
    }

    placeArrow(direction: Direction)
    {
        this.arrow.alpha = 1;

        switch(direction)
        {
            case Direction.Up:
                this.arrow.x = this.ship.x;
                this.arrow.y = this.ship.y - this.tileSize*0.5;
                break;
            case Direction.Down:
                this.arrow.x = this.ship.x;
                this.arrow.y = this.ship.y + this.tileSize*0.5;
                break;
            case Direction.Left:
                this.arrow.x = this.ship.x - this.tileSize*0.5;
                this.arrow.y = this.ship.y;
                break;
            case Direction.Right:
                this.arrow.x = this.ship.x + this.tileSize*0.5;
                this.arrow.y = this.ship.y;
                break;
            default:
                this.arrow.alpha = 0;
                break;
        }
    }

    lookUp() 
    {
        this.ship.angle = 180; 
        this.arrow.angle = -90;
        this.placeArrow(Direction.Up);
    }

    lookDown() 
    {
        this.ship.angle = 0;
        this.arrow.angle = 90;
        this.placeArrow(Direction.Down);
    }

    lookLeft() 
    {
        this.ship.angle = 90;
        this.arrow.angle = 180;
        this.placeArrow(Direction.Left);
    }

    lookRight() 
    {
        this.ship.angle = -90;
        this.arrow.angle = 0;
        this.placeArrow(Direction.Right);
    }

    set x(value: number)
    {
        this.ship.x = value;
    }

    set y(value: number)
    {
        this.ship.y = value
    }

    get name()
    {
        return this._name;
    }
}

