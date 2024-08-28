export default class Explosion
{
    private image: Phaser.GameObjects.Image;

    private START_COUNT: number = 1;

    private countDown: number;

    constructor(scene: Phaser.Scene)
    {
        this.countDown = this.START_COUNT;
        // TODO: This crap is not needed. Just spawn an animation in removeBomb()
        this.image = scene.add.image(-100, -100, 'explosion');
    }

    tick()
    {
        this.countDown--;
    }

    get decayed(): boolean
    {
        return this.countDown <= 0
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
