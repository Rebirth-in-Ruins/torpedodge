import { ServerPlayer } from './server';

export default class Player
{
    private tileSize: number;

    private ship: Phaser.GameObjects.Image;
    private arrow: Phaser.GameObjects.Image;
    private mouth: Phaser.GameObjects.Image;

    private nameTag: Phaser.GameObjects.Text;

    private SCALE_FACTOR: number = 0.8;
    private NAMETAG_OFFSET: number = -15;

    constructor(scene: Phaser.Scene, obj: ServerPlayer, tileSize: number) 
    {
        this.tileSize = tileSize;

        // pick what flag to sail with
        const texture = this.pickTeam(obj.team);

        // Spawn somewhere far away and let the map place it into correct position
        this.ship = scene.add.image(-100, -100, texture);
        this.ship.displayWidth = this.tileSize * this.SCALE_FACTOR;
        this.ship.displayHeight = this.tileSize * this.SCALE_FACTOR;

        this.arrow = scene.add.image(-100, -100, 'arrow');
        this.arrow.alpha = 0;

        this.mouth = scene.add.image(-100, -100, 'mouth');
        if(!obj.charging)
            this.mouth.alpha = 0;


        const fullName = '❤️'.repeat(obj.health) + '/' + '💣'.repeat(obj.bombCount) + '\n' +  obj.name;

        this.nameTag = scene.add.text(10, 10, fullName, { font: '10px monospace', strokeThickness: 2, stroke: '#000', align: 'center'});
        this.nameTag.setOrigin(0.5, 1);

    }

    pickTeam(team: string): string
    {
        switch(team)
        {
            case 'golang':
                return 'ship_go';
            case 'javascript':
                return 'ship_js';
            case 'kotlin':
                return 'ship_kt';
            case 'python':
                return 'ship_py';
            case 'rust':
                return 'ship_rs';
            default:
                return 'ship';
        }
    }

    placeArrow(direction: string)
    {
        this.arrow.alpha = 1;

        switch(direction)
        {
            case 'UP':
                this.arrow.x = this.ship.x;
                this.arrow.y = this.ship.y - this.tileSize*0.5;
                this.arrow.angle = -90;
                break;
            case 'DOWN':
                this.arrow.x = this.ship.x;
                this.arrow.y = this.ship.y + this.tileSize*0.5;
                this.arrow.angle = 90;
                break;
            case 'LEFT':
                this.arrow.x = this.ship.x - this.tileSize*0.5;
                this.arrow.y = this.ship.y;
                this.arrow.angle = 180;
                break;
            case 'RIGHT':
                this.arrow.x = this.ship.x + this.tileSize*0.5;
                this.arrow.y = this.ship.y;
                this.arrow.angle = 0;
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
                this.mouth.angle = -90; 

                this.mouth.x = this.ship.x;
                this.mouth.y = this.ship.y - this.tileSize*0.4;
                break;
            case 'DOWN':
                this.ship.angle = 0;
                this.mouth.angle = 90;

                this.mouth.x = this.ship.x;
                this.mouth.y = this.ship.y + this.tileSize*0.4;
                break;
            case 'LEFT':
                this.ship.angle = 90;
                this.mouth.angle = 180;

                this.mouth.x = this.ship.x - this.tileSize*0.4;
                this.mouth.y = this.ship.y;
                break;
            case 'RIGHT':
                this.ship.angle = -90;
                this.mouth.angle = 0;

                this.mouth.x = this.ship.x + this.tileSize*0.4;
                this.mouth.y = this.ship.y;
                break;
            default:
                // this.arrow.alpha = 0;
                break;
        }
    }

    destroy()
    {
        this.nameTag.destroy();
        this.ship.destroy();
        this.arrow.destroy();
        this.mouth.destroy();
    }

    set x(value: number)
    {
        this.ship.x = value;
        this.mouth.x = value
        this.nameTag.x = value;
    }

    set y(value: number)
    {
        this.ship.y = value
        this.mouth.y = value
        this.nameTag.y = value + this.NAMETAG_OFFSET;
    }
}

