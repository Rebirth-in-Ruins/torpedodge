export default class Explosion
{
    private sprite: Phaser.GameObjects.Sprite;

    private START_COUNT: number = 1;

    private countDown: number;

    constructor(scene: Phaser.Scene)
    {
        this.countDown = this.START_COUNT;
        // TODO: This crap is not needed. Just spawn an animation in removeBomb()
        // this.image = scene.add.image(-100, -100, 'explosion');

        //@ts-ignore
        this.sprite = scene.add.sprite(-100, -100).play('explosion');
        // this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE,  () =>
        // {
        //         this.sprite.destroy();
        // });
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
        this.sprite.destroy();
    }

    set x(value: number)
    {
        this.sprite.x = value;
    }

    set y(value: number)
    {
        this.sprite.y = value;
    }
}
