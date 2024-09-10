export default class Loot
{
    private image: Phaser.GameObjects.Image;

    private SCALE_FACTOR: number = 0.8;

    constructor(scene: Phaser.Scene, type: string, tileSize: number)
    {
        const texture = this.pickTexture(type);
        this.image = scene.add.image(-100, -100, texture);

        this.image.displayWidth = tileSize * this.SCALE_FACTOR;
        this.image.displayHeight = tileSize * this.SCALE_FACTOR;
    }

    pickTexture(type: string): string
    {
        switch(type)
        {
            case 'good':
                return 'loot_good';
            case 'mediocre':
                return 'loot_mediocre';
            default:
                return 'error';
        }
    }

    destroy()
    {
        this.image.destroy();
    }

    set x(value: number)
    {
        this.image.x = value;
    }

    set y(value: number)
    {
        this.image.y = value;
    }
}

