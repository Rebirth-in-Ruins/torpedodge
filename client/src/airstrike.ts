export default class Airstrike
{
    private START_COUNT: number = 3;

    private countDown: number;
    private text: Phaser.GameObjects.Text;
    private image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene)
    {
        this.image = scene.add.image(50, 50, 'small_shadow');
    
        this.countDown = this.START_COUNT;

        this.text = scene.add.text(50, 50, '' + this.countDown)
            .setFontSize(16)
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

        switch(this.countDown)
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
        }


        console.log(this.countDown);

        if(this.countDown > 0)
        {
            console.log('change');
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
