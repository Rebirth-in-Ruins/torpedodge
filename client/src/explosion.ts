export default class Explosion
{
    private sprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene)
    {
        //@ts-ignore
        this.sprite = scene.add.sprite(-100, -100).play('explosion');
        this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE,  () =>
        {
                this.sprite.destroy();
        });
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
