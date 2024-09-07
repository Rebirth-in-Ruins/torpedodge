export default class Bomb
{
    private text: Phaser.GameObjects.Text;
    private image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, fuseCount: number)
    {
        this.image = scene.add.image(-100, -100, 'bomb');
    
        this.text = scene.add.text(-100, -100, '' + fuseCount)
            .setFontSize(32)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setStroke('black', 3)
            .setOrigin(0.5, 0.5);
    }

    destroy()
    {
        this.image.destroy();
        this.text.destroy();
    }

    set x(value: number)
    {
        this.image.x = value;
        this.text.x = value;
    }

    set y(value: number)
    {
        this.image.y = value;
        this.text.y = value;
    }
}
