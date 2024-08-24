export default class Arrows {

    private scene : Phaser.Scene;
    private tileSize: number;

    public downArrow;

    constructor(scene: Phaser.Scene,tilesize: number){
        this.scene = scene;
        this.tileSize = tilesize;
    }
    
    showRight() {
        let rightArrow = this.scene.add.image(this.tileSize*1 + this.tileSize, this.tileSize*0.5 + this.tileSize, 'arrow'); 
    }

    showLeft() {
        let leftArrow = this.scene.add.image(this.tileSize*0 + this.tileSize, this.tileSize*0.5 + this.tileSize, 'arrow'); 
        leftArrow.angle = 180;
    }

    showUp() {
        let upArrow = this.scene.add.image(this.tileSize*0.5 + this.tileSize, this.tileSize*0 + this.tileSize, 'arrow');
        upArrow.angle = -90;
    }

    showDown() {
        this.downArrow = this.scene.add.image(this.tileSize*0.5 + this.tileSize, this.tileSize*1 + this.tileSize, 'arrow');
        this.downArrow.angle = 90;
        
    }

    removeArrows(){

    }
}