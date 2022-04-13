export enum Language {
    Ruski = 'russian'
}

export enum LanguageIso {
    English = 'en',
    Russia = 'ru',
    Swedish = 'sv',
    Danish = 'da',
    Norwegian = 'no'
}

export enum CommandArg {
    Language = '--lang',
    Port = '--port',
    Host = '--host'
}

export enum MatchEvent {
    Unknown = '',
    PlayerConnected = 'connected.',
    PlayerDisconnected = 'disconnected.',
    DamageGiven = 'Damage Given to',
    DamageTaken = 'Damage Taken from'
}

export enum LobbyEvent {
    PlayerJoined = '',
}

export enum GlobalEvent {
    Unknown = '',
    Message = ' : ',
    GameStateChanged = 'ChangeGameUIState',
}

export type EventValue = string | string[] | null;
export class EventWrapper<T extends MatchEvent | LobbyEvent | GlobalEvent> {
    constructor(
        public event: T,
        public value: EventValue
    ) {}
}

export enum GameState {
    Initial = '',
    Unknown = 'Unknown',
    Match = 'CSGO_GAME_UI_STATE_INGAME',
    PauseMenu = 'CSGO_GAME_UI_STATE_PAUSEMENU',
    MainMenu = 'CSGO_GAME_UI_STATE_MAINMENU',
    LoadingScreen = 'CSGO_GAME_UI_STATE_LOADINGSCREEN'
}

export class Translation {
    constructor(
        public language: LanguageIso,
        public text: string
    ) {}
}
