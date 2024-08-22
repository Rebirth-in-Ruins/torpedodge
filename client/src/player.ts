export default class Player {
    private scene: Phaser.Scene;
    private size: number;
    private x: number;
    private y: number;

    private keys: any; // TODO: needed?
    private ship: Phaser.GameObjects.Image;
    private tile: number;
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

    }

    move_Up(){

    }
    move_Down(){
        
    }
    move_Left(){
        
    }
    move_Right(){
        
    }
}