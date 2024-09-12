export default class Animation
{
    private sprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, texture: string, x: number, y: number)
    {
        // Silly hardcoded hack to align animations
        let offset = 0;
        if(texture == 'score') {
            offset = -50;
        }

        //@ts-expect-error the last argument is actually optional
        this.sprite = scene.add.sprite(x, y+offset).play(texture);
        this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE,  () =>
        {
                this.sprite.destroy();
        });
    }
}
