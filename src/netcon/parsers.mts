// event-parser.ts
//game-state-parser.ts
import {EventValue, EventWrapper, GameState, GlobalEvent, MatchEvent} from './types.mjs';

export function parseMatchEvent(message: string): EventWrapper<MatchEvent> {
    let event: MatchEvent = MatchEvent.Unknown;
    let args: EventValue = null;
    let messageArray = message.split(/\r?\n/);
    let DamageGivenBuffer = [];
    let DamageTakenBuffer = [];
    let PlayerConnectedBuffer = [];
    messageArray.forEach(message => {
        switch (event) {
            case MatchEvent.DamageGiven:
                let DamageGivenObj;
                if (message.match(/^-+$/)) {
                    break;
                } else {
                    if (message.match(/^Damage Given to /)) {
                        DamageGivenObj = message.replace(/^Damage Given to /, '')
                        DamageGivenObj = DamageGivenObj.split(//);
                        DamageGivenObj = DamageGivenObj.match(/(?<=").*(?=")/))[0];
                        DamageGivenObj[0] = DamageGivenObj[0].split(/^ - (\d+)(?= )/);
                        DamageGivenObj[1] = DamageGivenObj[1].split(/^ (\d+)(?= hit)/);
                        DamageGivenBuffer.push(message.replace(/^Damage Given to /, '').split('in'));
                    } else {
                        event = MatchEvent.Unknown;
                        break;
                    }
                }
                break;
            case MatchEvent.DamageTaken:
                if (message.match(/^-+$/)) {
                    break;
                } else {
                    if (message.match(/^Damage Taken from /)) {
                        DamageTakenBuffer.push(message);
                    } else {
                        event = MatchEvent.Unknown;
                        break;
                    }
                }
                break;
            case MatchEvent.Unknown:
                if (message.trimEnd().endsWith('Damage Given')){
                    event = MatchEvent.DamageGiven;
                    let DamageGivenBuffer = [];
                } else if (message.trimEnd().endsWith('Damage Taken')){
                    event = MatchEvent.DamageTaken;
                    let DamageTakenBuffer = [];
                } else if (message.trimEnd().endsWith(MatchEvent.PlayerConnected)) {
                    event = MatchEvent.PlayerConnected;
                    PlayerConnectedBuffer.push(message.match(/^(.*)(?= connected\.)/)[1]);
                }
                break;
        }
    });
    return []
}

export function parseGlobalEvent(message: string): EventWrapper<GlobalEvent> {
    let event = GlobalEvent.Unknown;
    let args: EventValue = null;

    if (message.startsWith(GlobalEvent.GameStateChanged)) {
        event = GlobalEvent.GameStateChanged;
        args = message.substr(GlobalEvent.GameStateChanged.length);
    } else if (message.indexOf(GlobalEvent.Message) !== -1) {
        event = GlobalEvent.Message;
        args = message.split(GlobalEvent.Message);
    } else {
        event = GlobalEvent.Unknown;
    }

    const result = new EventWrapper<GlobalEvent>(event, args);
    return result;
}

export function parseGameState(message: string): GameState {
    const split = message.split('->');
    switch(split[1].trim()) {
        case GameState.Match:
            return GameState.Match;
        case GameState.LoadingScreen:
            return GameState.LoadingScreen;
        case GameState.MainMenu:
            return GameState.MainMenu;
        case GameState.PauseMenu:
            return GameState.PauseMenu;
        default:
            return GameState.Unknown;
    }
}