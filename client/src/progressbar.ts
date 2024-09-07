export default class ProgressBar
{
    private graphics: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;

    // constant fields
    private MARGIN_LEFT: number = 0.1;
    private MARGIN_TOP: number = 0.9
    private WIDTH: number = 0.8;
    private HEIGHT: number = 20;
    private RADIUS_OUTER: number = 10;
    private RADIUS_INNER: number = 6;

    // set in constructor
    private x: number;
    private y: number;
    private width: number;

    // set by user (between 0 and 1)
    private progress: number;

    constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number)
    {
        this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffffff }, fillStyle: { color: 0xffffff } });

        this.x = gameWidth*this.MARGIN_LEFT;
        this.y = gameHeight*this.MARGIN_TOP;
        this.width = gameWidth*this.WIDTH;

        this.text = scene.add.text(this.x - 50, this.y + 8, 'Next turn')
            .setFontSize(16)
            .setFontStyle('bold')
            .setFontFamily('Arial')
            .setStroke('black', 2)
            .setOrigin(0.5, 0.5);


        this.setProgress(0);
    }

    setProgress(progress: number)
    {
        this.progress = this.clamp(progress, 0, 1);

        let width = this.progress*this.width;

        // When the value is too low it looks weird. Avoid that.
        if(width <= 15)
            width = 15

        this.graphics.clear();
        this.graphics.strokeRoundedRect(this.x, this.y, this.width, this.HEIGHT, this.RADIUS_OUTER);
        // inner rectangle should be a little smaller than outer
        this.graphics.fillRoundedRect(this.x + 3, this.y + 3, width - 7, this.HEIGHT - 5, this.RADIUS_INNER);
    }

    clamp(value: number, min: number, max: number): number
    {
        return Math.min(Math.max(value, min), max);
    }
}
