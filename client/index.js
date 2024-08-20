class Example extends Phaser.Scene
{
    preload ()
    {
        this.load.image('red', 'asset/ship.png');
    }

    create ()
    {
        let ship = this.add.image(400, 300, 'red');
        ship.scaleY
        ship.displayWidth = 100;
        ship.displayHeight = 100;

    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Example,
    parent: "game",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    }
};

const game = new Phaser.Game(config);