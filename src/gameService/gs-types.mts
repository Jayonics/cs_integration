namespace GameService {
    export type observer_slot = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

    export enum team { T = "T", CT = "CT" }

    export enum activity { playing = "playing", menu = "menu", textinput = "textinput"}

    export type steamid = bigint;

    export class Provider {
        public static name: string
        public static appid: number
        public static version: number
        public static steamid: steamid
        public static timestamp: Date
    }

    export class Player {
        public static steamid: number
        public static name: string
        public static observer_slot: observer_slot | null
        public static team: team
        public static activity: activity
    }

    export class State extends Player {
        public static health: number
        public static armor: number
        public static helmet: boolean
        public static flashed: number
        public static smoked: number
        public static burning: number
        public static money: number
        public static round_kills: number
        public static round_killhs: number
        public static equip_value: number
    }

    export class Player_Position extends Player {
        public static spectarget: steamid
        public static position: { x: number, y: number, z: number } | string
        public static forward: { x: number, y: number, z: number } | string
    }

    export class Player_Match_Stats extends Player {
        public static kills: number
        public static deaths: number
        public static assists: number
        public static mvps: number
        public static score: number
    }

    export type weapon = {
        "name": string,
        "paintkit": string,
        "type": string,
        "ammo_clip": number,
        "ammo_clip_max": number,
        "ammo_reserve": number,
        "state": string,
    }

    export class Player_Weapons extends Player {
        public static weapons: weapon[]
    }
}
