export default class Button
{
    private active: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture_off: string, texture_on: string, onPointerdown: (active: boolean) => void)
    {
        const button = scene.add.image(x, y, texture_off);
        button.setScale(2, 2);
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () =>
        {
            this.active = !this.active
            if(this.active)
                button.setTexture(texture_on);
            else 
                button.setTexture(texture_off);

            onPointerdown(this.active)

        })
    }
}
