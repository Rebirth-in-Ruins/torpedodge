export default class Explosion
{
    private _x: number;
    private _y: number;
    private image: Phaser.GameObjects.Image;

    private START_COUNT: number = 1;

    private countDown: number;

    constructor(scene: Phaser.Scene, playerX: number, playerY: number, size: number)
    {
        this._x = playerX * size + size*0.5;
        this._y = playerY * size + size*0.5;

        this.countDown = this.START_COUNT;

        this.image = scene.add.image(this._x, this._y, 'explosion');
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
}