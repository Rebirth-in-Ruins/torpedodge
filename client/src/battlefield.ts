import Player from './player';
import Bomb from './bomb';
import Explosion from './explosion';
import Airstrike from './airstrike';
import Animation from './animation';
import { ServerAirstrike, ServerAnimation, ServerBomb, ServerCorpse, ServerExplosion, ServerIntention, ServerLoot, ServerPlayer } from './server';
import Corpse from './corpse';
import Loot from './loot';

export default class Battlefield
{
    private GRID_PERCENTAGE = 0.85;
    private gridCount: number;

    private tileSize: number;

    private MARGIN_LEFT: number = 10;
    private MARGIN_TOP: number = 10;

    private scene: Phaser.Scene;

    private players: Map<number, Player> = new Map(); 
    private airstrikes: Map<number, Airstrike> = new Map(); 
    private bombs: Map<number, Bomb> = new Map(); 
    private corpses: Map<number, Corpse> = new Map(); 
    private loot: Map<number, Loot> = new Map(); 

    constructor(scene: Phaser.Scene, gameWidth: number, gameHeight: number, gridCount: number)
    {
        this.gridCount = gridCount;

        const gridSize = gameHeight*this.GRID_PERCENTAGE;
        this.tileSize = (gameHeight*this.GRID_PERCENTAGE)/this.gridCount;

        // Draw black background offset by a 2px background (serves as the grid border).
        const r1 = scene.add.rectangle(this.MARGIN_LEFT-2, this.MARGIN_TOP-2, gridSize+2, gridSize+2, 0x000000, 0.5);
        r1.setOrigin(0,0);

        // Draw the grid on top
        // const g1 = scene.add.grid(this.MARGIN_LEFT, this.MARGIN_TOP, gridSize, gridSize, this.tileSize, this.tileSize, 0x1a96c5, 1, 0x000000, 0.5);
        const g1 = scene.add.grid(this.MARGIN_LEFT, this.MARGIN_TOP, gridSize, gridSize, this.tileSize, this.tileSize, 0x1a96c5, 1, 0x000000, 0.5);
        g1.setOrigin(0,0);

        this.scene = scene;
    }


    renderPlayer(obj: ServerPlayer)
    {
        const player = new Player(this.scene, obj, this.tileSize);
        this.players.set(obj.id, player);

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        player.x = worldX;
        player.y = worldY;


        player.lookDirection(obj.rotation);
    }

    renderAirstrike(obj: ServerAirstrike)
    {
        const airstrike = new Airstrike(this.scene, obj.fuseCount, this.tileSize);
        this.airstrikes.set(obj.id, airstrike);

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        airstrike.x = worldX;
        airstrike.y = worldY;
    }

    renderBomb(obj: ServerBomb)
    {
        const bomb = new Bomb(this.scene, obj.fuseCount, this.tileSize);
        this.bombs.set(obj.id, bomb);

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        bomb.x = worldX;
        bomb.y = worldY;
    }

    renderExplosions(obj: ServerExplosion, sound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound, focusLost: boolean)
    {
        if(focusLost)
            return

        const explosion = new Explosion(this.scene);

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        explosion.x = worldX;
        explosion.y = worldY;

        this.scene.cameras.main.shake(200, 0.01);
        sound.play(); // TODO: Varying explosion sounds please
    }

    renderCorpse(obj: ServerCorpse)
    {
        const corpse = new Corpse(this.scene, obj.name, this.tileSize);
        this.corpses.set(obj.id, corpse)

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        corpse.x = worldX;
        corpse.y = worldY;

        // TODO: Play death sound on event
        // sound.play();
    }

    renderLoot(obj: ServerLoot)
    {
        const loot = new Loot(this.scene, obj.type, this.tileSize);
        this.loot.set(obj.id, loot)

        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        loot.x = worldX;
        loot.y = worldY;
    }

    renderAnimations(obj: ServerAnimation)
    {
        const [worldX, worldY] = this.gridToWorld(obj.x, obj.y);
        new Animation(this.scene, obj.name, worldX, worldY);
    }

    renderArrows(list: Array<ServerIntention>)
    {
        for(const obj of list)
        {
            const player = this.players.get(obj.id);
            player.placeArrow(obj.direction);
        }
    }

    clearPlayers()
    {
        for(const [id, player] of this.players)
        {
            player.destroy();
            this.players.delete(id);
        }
    }

    clearAirstrikes()
    {
        for(const [id, airstrike] of this.airstrikes)
        {
            airstrike.destroy();
            this.airstrikes.delete(id);
        }
    }

    clearBombs()
    {
        for(const [id, bomb] of this.bombs)
        {
            bomb.destroy();
            this.bombs.delete(id);
        }
    }

    clearCorpses()
    {
        for(const [id, corpse] of this.corpses)
        {
            corpse.destroy();
            this.corpses.delete(id);
        }
    }

    clearLoot()
    {
        for(const [id, loot] of this.loot)
        {
            loot.destroy();
            this.loot.delete(id);
        }
    }


    removePlayer(id: number)
    {
        const player = this.players.get(id);
        player.destroy();
        this.players.delete(id);
    }

    gridToWorld(x: number, y: number)
    {
        const worldX = x * this.tileSize + this.tileSize*0.5 + this.MARGIN_LEFT;
        const worldY = y * this.tileSize + this.tileSize*0.5 + this.MARGIN_TOP;

        return [worldX, worldY];
    }
}
