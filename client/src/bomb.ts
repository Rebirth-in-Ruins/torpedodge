export default class Bomb
{
    private START_COUNT: number = 3;

    private countDown: number;
    private text: Phaser.GameObjects.Text;
    private image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, playerX: number, playerY: number, size: number)
    {
        let x = playerX * size + size*0.5;
        let y = playerY * size + size*0.5;

        this.plantedX = playerX;
        this.plantedY = playerY;

        this.image = scene.add.image(x, y, 'bomb');
    
        this.countDown = this.START_COUNT;

        this.text = scene.add.text(x, y, '' + this.countDown)
            .setFontSize(32)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setStroke('black', 3)
            .setOrigin(0.5, 0.5);
    }

    get denonated(): boolean
    {
        return this.countDown <= 0
    }

    tick()
    {
        this.countDown--;

        if(this.countDown > 0)
        {
            this.text.text = '' + this.countDown;
        }
    }


    destroy()
    {
        this.image.destroy();
        this.text.destroy();
    }
}