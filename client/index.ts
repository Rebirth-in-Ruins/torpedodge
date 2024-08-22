import Phaser from 'phaser';

class Example extends Phaser.Scene
{
    keys: any
    ship: Phaser.GameObjects.Image

    GRID_COUNT: number = 12;

    preload ()
    {
        this.load.image('red', 'assets/Sprite-0001.png');
    }

    create ()
    {

        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        let { width, height } = this.sys.game.canvas;
        const g1 = this.add.grid(0, 0, width, height, width/this.GRID_COUNT, height/this.GRID_COUNT, 0x057605);
        g1.setOrigin(0,0);
        
        this.ship = this.add.image(width/(this.GRID_COUNT*2), width/(this.GRID_COUNT*2), 'red');
        this.ship.displayWidth = width/this.GRID_COUNT;
        this.ship.displayHeight = height/this.GRID_COUNT;

        // const circle = new Phaser.Geom.Circle(100, 100, 10);
        // const graphics = this.add.graphics({ fillStyle: { color: 0xff0000 } });
        // graphics.fillCircleShape(circle);
    }

    update() 
    {
        if(this.keys.W.isDown) {
            this.ship.y -= 1;
            this.ship.angle = 0;
        }
        if(this.keys.A.isDown) {
            this.ship.x -= 1;
            this.ship.angle = -90;
        }
        if(this.keys.S.isDown) {
            this.ship.y += 1;
            this.ship.angle = 180;
        }
        if(this.keys.D.isDown) {
            this.ship.x += 1;
            this.ship.angle = 90;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
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