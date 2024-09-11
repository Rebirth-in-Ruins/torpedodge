export class GameState
{
    players: Array<ServerPlayer>
    airstrikes: Array<ServerAirstrike>
    explosions: Array<ServerExplosion>
    bombs: Array<ServerBomb>
    corpses: Array<ServerCorpse>
    loot: Array<ServerLoot>
    leaderboard: Array<ServerEntry>
    kings: Array<ServerKing>
    animations: Array<ServerAnimation>
    events: Array<string>
    settings: ServerSettings
}

export class ServerPlayer
{
    id: number

    name: string

    // coordinates
    x: number
    y: number
    rotation: string

    // player is about to firah his lazor (movement locked)
    charging: boolean

    // decides what skin is used
    team: string

    // amount of lives
    health: number

    // allowed  
    bombCount: number

    // amount of turns until bomb is available
    bombRespawn: number
}

export class ServerCorpse
{
    id: number

    // name tag
    name: string

    // coordinates
    x: number
    y: number
    rotation: string
}

export class ServerLoot
{
    id: number

    // good or bad type of loot
    type: string

    // coordinates
    x: number
    y: number
}

export class ServerEntry
{
    name: string
    score: number
}

export class ServerBomb
{
	id: number
	playerId: number
	x: number
	y: number
	fuseCount: number
}

export class ServerAirstrike
{
    id: number

    // coordinates
    x: number
    y: number

    // amount of turns until it explodes
    fuseCount: number
}

export class ServerExplosion
{
    id: number

    x: number
    y: number
}

export class ServerSettings
{
    // time until inputs are evaluated and game state is updated
    turnDuration: number

    // size of the map
    gridSize: number

    // how many bombs can be stored at once
    inventorySize: number

    // how many turns it takes before a player can get another bomb
    bombRespawnTime: number

    // how many lives the player has 
    startHealth: number
}

export class ServerAnimation
{
    name: string
    x: number
    y: number
}

export class ServerKing
{
    name: string
    score: number
    created_at: string
}
