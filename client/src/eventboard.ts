export default class Eventboard
{
    private text: Phaser.GameObjects.Text;

    private MAX_LENGTH: number = 16

    constructor(scene: Phaser.Scene, gameWidth: number)
    {
        this.text = scene.add.text(gameWidth * 0.63, 450, 'EVENTS', { font: '16px monospace', stroke: 'black', strokeThickness: 2});
    }

    render(list: Array<string>)
    {
        let str = 'EVENTS\n';
        for(const entry of list)
            str += `- ${entry}\n`
        
        this.text.text = str;
    }

}
