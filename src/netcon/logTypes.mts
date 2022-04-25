export class Player {
    public username: string;
    public steamID: number;
}

export class Damage {
    public sourceName: Player
    public targetName: Player
    public damage: number
    public hits: number
}