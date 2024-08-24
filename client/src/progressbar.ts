export default class ProgressBar {
    graphics: Phaser.GameObjects.Graphics;

    // constant fields
    MARGIN_LEFT: number = 0.1;
    MARGIN_TOP: number = 0.9
    WIDTH: number = 0.8;
    HEIGHT: number = 20;
    RADIUS_OUTER: number = 10;
    RADIUS_INNER: number = 6;

    // set in constructor
    x: number;
    y: number;
    width: number;

    // set by user (between 0 and 1)
    progress: number;

    constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number) {
        this.graphics = scene.add.graphics({ lineStyle: { width: 1, color: 0xffffff }, fillStyle: { color: 0xffffff } });

        this.x = gameWidth*this.MARGIN_LEFT;
        this.y = gameHeight*this.MARGIN_TOP;
        this.width = gameWidth*this.WIDTH;

        this.setProgress(0);
    }

    getProgress(): number {
        return this.progress;
    }

    setProgress(progress: number) {
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

    clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
}
