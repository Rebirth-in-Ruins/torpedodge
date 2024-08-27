import Arrow from './arrow';
import Position from './position';

export default class Player implements Position
{
    private scene: Phaser.Scene;
    private size: number;

    private ship: Phaser.GameObjects.Image;
    private arrow: Arrow;

    private SCALE_FACTOR: number = 0.8;

    private _name: String; // TODO: Name tag

    constructor(scene: Phaser.Scene, name: String, size: number) 
    {
        this.scene = scene;
        this.size = size;
        this._name = name;

        this.arrow = new Arrow(scene, size);

        // Spawn somewhere far away and let the map place it into correct position
        this.ship = this.scene.add.image(-100, -100, 'ship');
        this.ship.displayWidth = this.size * this.SCALE_FACTOR;
        this.ship.displayHeight = this.size * this.SCALE_FACTOR;
    }

    set x(value: number) {
        this.ship.x = value;
    }

    get x() {
        return this.ship.x;
    }

    set y(value: number) {
        this.ship.y = value;
    }

    get y() {
        return this.ship.y;
    }

    get name() {
        return this._name;
    }

    lookUp() 
    {
        this.ship.angle = 180; 
        this.arrow.pointUp(this.x, this.y);
    }

    lookDown() 
    {
        this.ship.angle = 0;
        this.arrow.pointDown(this.x, this.y);
    }

    lookLeft() 
    {
        this.ship.angle = 90;
        this.arrow.pointLeft(this.x, this.y);
    }

    lookRight() 
    {
        this.ship.angle = -90;
        this.arrow.pointRight(this.x, this.y);
    }

    tick()
    {
        this.arrow.removeArrow();
    }
}

