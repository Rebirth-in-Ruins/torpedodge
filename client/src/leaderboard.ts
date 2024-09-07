import { ServerEntry } from './main';

export default class Leaderboard
{
    private text: Phaser.GameObjects.Text;

    private MAX_LENGTH: number = 16

    constructor(scene: Phaser.Scene, gameWidth: number)
    {
        this.text = scene.add.text(gameWidth * 0.65, 50, 'LEADERBOARD', { font: '16px monospace', stroke: 'black', strokeThickness: 2});
    }

    render(list: Array<ServerEntry>)
    {
        let str = 'LEADERBOARD\n';
        
        list.sort((a, b) => b.score - a.score);
        
        list.forEach((entry, index) =>
        {
            const name = entry.name.padEnd(this.MAX_LENGTH, ' ');
            str += `${index+1}. ${name}\t${entry.score}\n`
        });

        this.text.text = str;
    }

}
