import Phaser from 'phaser';

class Example extends Phaser.Scene
{
    keys: any
    ship: Phaser.GameObjects.Image

    preload ()
    {
        this.load.image('red', 'asset/ship.png');
    }

    create ()
    {
        this.ship = this.add.image(400, 300, 'red');
        this.ship.displayWidth = 100;
        this.ship.displayHeight = 100;

        this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }

    update() 
    {
        if(this.keys.W.isDown) {
            this.ship.y -= 1;
        }
        if(this.keys.A.isDown) {
            this.ship.x -= 1;
        }
        if(this.keys.S.isDown) {
            this.ship.y += 1;
        }
        if(this.keys.D.isDown) {
            this.ship.x += 1;
        }
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
            gravity: { 
                x: 0,
                y: 200 
            }
        }
    }
};

const game = new Phaser.Game(config);