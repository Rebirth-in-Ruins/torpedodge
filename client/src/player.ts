import Arrows from './arrows';

export default class Player {
    private scene: Phaser.Scene;
    private size: number;
    private x: number;
    private y: number;

    private ship: Phaser.GameObjects.Image;
    private moveCooldown: number = 0;

    private MOVE_COOLDOWN: number = 200; // in ms
    private SCALE_FACTOR: number = 0.8;

    private arrow : Arrows;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number) {
        this.scene = scene;
        this.size = size;
        this.x = x;
        this.y = y;
        this.create();
    }
    
    preload() {
        this.scene.load.image('red', 'assets/ship (1).png');
    }

    create ()
    {
        let offset = this.size/2;

        this.ship = this.scene.add.image(this.x * this.size + offset, this.y * this.size + offset, 'red');
        this.ship.displayWidth = this.size * this.SCALE_FACTOR;
        this.ship.displayHeight = this.size * this.SCALE_FACTOR;
    }

    update(_: number, delta: number)
    {
        if(this.moveCooldown >= 0) {
            this.moveCooldown -= delta
        }
    }

    getCoordinates(): {x: number, y: number} {
        return {x: this.x, y: this.y}
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    moveUp() {
        if(this.moveCooldown > 0) {
            return
        }

        this.moveCooldown = this.MOVE_COOLDOWN;
        this.ship.y -= this.size;
        this.ship.angle = 180; 
        this.y -= 1;
        this.arrow = new Arrows(this.scene,this.size);
        this.arrow.showUp;
    }

    moveDown() {
        if(this.moveCooldown > 0) {
            return
        }

        this.moveCooldown = this.MOVE_COOLDOWN;
        this.ship.y += this.size;
        this.ship.angle = 0;
        this.y += 1;
        this.arrow = new Arrows(this.scene,this.size);
        this.arrow.showDown;
    }

    moveLeft() {
        if(this.moveCooldown > 0) {
            return
        }

        this.moveCooldown = this.MOVE_COOLDOWN;
        this.ship.x -= this.size;
        this.ship.angle = 90;
        this.x -= 1;
        this.arrow = new Arrows(this.scene,this.size);
        this.arrow.showLeft;
    }

    moveRight() {
        if(this.moveCooldown > 0) {
            return
        }

        this.moveCooldown = this.MOVE_COOLDOWN;
        this.ship.x += this.size;
        this.ship.angle = -90;
        this.x += 1;
        this.arrow = new Arrows(this.scene,this.size);
        this.arrow.showRight;
    }
}
