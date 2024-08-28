export default class Bomb
{
    private START_COUNT: number = 3;

    private countDown: number;
    private text: Phaser.GameObjects.Text;
    private image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene)
    {
        this.image = scene.add.image(10, 10, 'bomb');
    
        this.countDown = this.START_COUNT;

        this.text = scene.add.text(10, 10, '' + this.countDown)
            .setFontSize(32)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setStroke('black', 3)
            .setOrigin(0.5, 0.5);
    }

    get detonated(): boolean
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
