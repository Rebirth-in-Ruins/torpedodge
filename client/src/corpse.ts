export default class Corpse
{
    private image: Phaser.GameObjects.Image;

    private SCALE_FACTOR: number = 0.8;
    private NAMETAG_OFFSET: number = -15;

    private nameTag: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, name: string, tileSize: number)
    {
        this.image = scene.add.image(-100, -100, 'ship_dead');

        this.image.displayWidth = tileSize * this.SCALE_FACTOR;
        this.image.displayHeight = tileSize * this.SCALE_FACTOR;

        this.nameTag = scene.add.text(-100, -100, name, { font: '10px monospace', strokeThickness: 2, stroke: '#000', align: 'center'});
        this.nameTag.setOrigin(0.5, 1);
    }

    destroy()
    {
        this.image.destroy();
        this.nameTag.destroy();
    }

    set x(value: number)
    {
        this.image.x = value;
        this.nameTag.x = value;
    }

    set y(value: number)
    {
        this.image.y = value;
        this.nameTag.y = value + this.NAMETAG_OFFSET;
    }
}
