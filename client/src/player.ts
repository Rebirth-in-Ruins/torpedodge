import { Direction } from './direction';

export default class Player
{
    private tileSize: number;

    private ship: Phaser.GameObjects.Image;
    private arrow: Phaser.GameObjects.Image;

    private nameTag: Phaser.GameObjects.Text;

    private SCALE_FACTOR: number = 0.8;
    private NAMETAG_OFFSET: number = -15;

    constructor(scene: Phaser.Scene, name: string, health: number, bombs: number, tileSize: number) 
    {
        this.tileSize = tileSize;

        // Spawn somewhere far away and let the map place it into correct position
        this.ship = scene.add.image(-100, -100, 'ship');
        this.ship.displayWidth = this.tileSize * this.SCALE_FACTOR;
        this.ship.displayHeight = this.tileSize * this.SCALE_FACTOR;

        this.arrow = scene.add.image(-100, -100, 'arrow');
        this.arrow.alpha = 0; // TODO: Show arrow

        const fullName = '❤️'.repeat(health) + '/' + '💣'.repeat(bombs) + '\n' +  name;

        this.nameTag = scene.add.text(10, 10, fullName, { font: '10px monospace', strokeThickness: 2, stroke: '#000', align: 'center'});
        this.nameTag.setOrigin(0.5, 1);
    }

    placeArrow(direction: Direction)
    {
        this.arrow.alpha = 0; // TODO: Show arrows

        switch(direction)
        {
            case Direction.Up:
                this.arrow.x = this.ship.x;
                this.arrow.y = this.ship.y - this.tileSize*0.5;
                break;
            case Direction.Down:
                this.arrow.x = this.ship.x;
                this.arrow.y = this.ship.y + this.tileSize*0.5;
                break;
            case Direction.Left:
                this.arrow.x = this.ship.x - this.tileSize*0.5;
                this.arrow.y = this.ship.y;
                break;
            case Direction.Right:
                this.arrow.x = this.ship.x + this.tileSize*0.5;
                this.arrow.y = this.ship.y;
                break;
            default:
                this.arrow.alpha = 0;
                break;
        }
    }

    lookDirection(direction: string)
    {
        switch(direction)
            {
            case 'UP':
                this.ship.angle = 180; 
                this.arrow.angle = -90;
                this.placeArrow(Direction.Up);
                break;
            case 'DOWN':
                this.ship.angle = 0;
                this.arrow.angle = 90;
                this.placeArrow(Direction.Down);
                break;
            case 'LEFT':
                this.ship.angle = 90;
                this.arrow.angle = 180;
                this.placeArrow(Direction.Left);
                break;
            case 'RIGHT':
                this.ship.angle = -90;
                this.arrow.angle = 0;
                this.placeArrow(Direction.Right);
                break;
            default:
                this.arrow.alpha = 0;
                break;
        }
    }

    destroy()
    {
        this.nameTag.destroy();
        this.ship.destroy();
        this.arrow.destroy();
    }

    set x(value: number)
    {
        this.ship.x = value;
        this.nameTag.x = value;
    }

    set y(value: number)
    {
        this.ship.y = value
        this.nameTag.y = value + this.NAMETAG_OFFSET;
    }
}

