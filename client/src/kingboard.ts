import { ServerKing } from './server';

export default class Kingboard
{
    private text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, gameWidth: number)
    {
        this.text = scene.add.text(gameWidth * 0.63, 300, 'KING OF THE HILL', { font: '16px monospace', stroke: 'black', strokeThickness: 2});
    }

    render(list: Array<ServerKing>)
    {
        let str = 'KING OF THE HILL\n';
        for(const [index, entry] of list.entries())
            str += `${index+1}. ${entry.name} (${entry.score})\n`
        
        this.text.text = str;
    }

}
