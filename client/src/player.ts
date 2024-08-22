export default class Player {
    private scene: Phaser.Scene;
    private size: number;
    private x: number;
    private y: number;

    private keys: any; // TODO: needed?
    private ship: Phaser.GameObjects.Image;
    private moveCooldown: number = 0;

    private MOVE_COOLDOWN: number = 200; // in ms
    private SCALE_FACTOR: number = 0.8;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number) {
        this.scene = scene;
        this.size = size;
        this.x = x;
        this.y = y;
        this.create();
    }
    
    preload() {
        this.scene.load.image('red', 'assets/Player_Boot.png');
    }

    create ()
    {
        let offset = this.size/2;

        this.ship = this.scene.add.image(this.x * this.size + offset, this.y * this.size + offset, 'red');
        this.ship.displayWidth = this.size * this.SCALE_FACTOR;
        this.ship.displayHeight = this.size * this.SCALE_FACTOR;
    }

    update(time, delta)
    {
        if(this.moveCooldown >= 0) {
            this.moveCooldown -= delta
        }
        console.log(this.moveCooldown);
    }

    moveUp() {
        if(this.moveCooldown <= 0){
            this.moveCooldown = this.MOVE_COOLDOWN;
            this.ship.y -= this.size;
            this.ship.angle = 0; 
        }
    }

    moveDown() {
        if(this.moveCooldown <= 0) {
            this.moveCooldown = this.MOVE_COOLDOWN;
            this.ship.y += this.size;
            this.ship.angle = 180;
        }
    }

    moveLeft() {
        if(this.moveCooldown <= 0) {
            this.moveCooldown = this.MOVE_COOLDOWN;
            this.ship.x -= this.size;
            this.ship.angle = -90;
        }
    }

    moveRight() {
        if(this.moveCooldown <= 0) {
            this.moveCooldown = this.MOVE_COOLDOWN;
            this.ship.x += this.size;
            this.ship.angle = 90;
        }
    }
}