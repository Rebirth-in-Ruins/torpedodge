export default class Arrows {

    private scene : Phaser.Scene;
    private tileSize: number;

    public arrow: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene,tilesize: number){
        this.scene = scene;
        this.tileSize = tilesize;
        this.arrow = this.scene.add.image(this.tileSize*1 + this.tileSize, this.tileSize*0.5 + this.tileSize, 'arrow'); 
        this.arrow.alpha = 0;
    }
    
    showRight() 
    {
        this.arrow.destroy();
        this.arrow = this.scene.add.image(this.tileSize*1 + this.tileSize, this.tileSize*0.5 + this.tileSize, 'arrow'); 
        this.arrow.alpha = 1;
    }

    showLeft() 
    {
        this.arrow.destroy();
        this.arrow = this.scene.add.image(this.tileSize*0 + this.tileSize, this.tileSize*0.5 + this.tileSize, 'arrow'); 
        this.arrow.angle = 180;
        this.arrow.alpha = 1;
    }

    showUp() 
    {
        this.arrow.destroy();
        this.arrow = this.scene.add.image(this.tileSize*0.5 + this.tileSize, this.tileSize*0 + this.tileSize, 'arrow');
        this.arrow.angle = -90;
        this.arrow.alpha = 1;
    }

    showDown()
    {
        this.arrow.destroy();
        this.arrow = this.scene.add.image(this.tileSize*0.5 + this.tileSize, this.tileSize*1 + this.tileSize, 'arrow');
        this.arrow.angle = 90;
        this.arrow.alpha = 1;
    }

    removeArrows() 
    {
        this.arrow.alpha = 0;
    }
}