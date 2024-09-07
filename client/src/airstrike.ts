export default class Airstrike
{
    private text: Phaser.GameObjects.Text;
    private image: Phaser.GameObjects.Image;

    private SCALE_FACTOR: number = 0.8;

    // TODO: rename fuseCount (everywhere else) to fuseLength
    constructor(scene: Phaser.Scene, fuseLength: number, tileSize: number)
    {
        this.image = scene.add.image(-100, -100, 'small_shadow');

        this.image.displayWidth = tileSize * this.SCALE_FACTOR;
        this.image.displayHeight = tileSize * this.SCALE_FACTOR;

        switch(fuseLength)
        {
            case 3:
                this.image.setTexture('small_shadow');
                break;
            case 2:
                this.image.setTexture('medium_shadow');
                break;
            case 1:
                this.image.setTexture('big_shadow');
                break;
            default:
                this.image.setTexture('small_shadow');
                break;
        }

        this.text = scene.add.text(50, 50, '' + fuseLength)
            .setFontSize(16)
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
