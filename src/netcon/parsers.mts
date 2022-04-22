// event-parser.ts
//game-state-parser.ts
import {EventValue, EventWrapper, GameState, GlobalEvent, MatchEvent} from './types.mjs';

export function parseMatchEvent(message: string): EventWrapper<MatchEvent> {
    let event = MatchEvent.Unknown;
    let args: EventValue = null;
    if (message.endsWith(MatchEvent.PlayerConnected)) {
        event = MatchEvent.PlayerConnected;
        args = message
            .substr(0, message.length - MatchEvent.PlayerConnected.length)
            .trim();
    } else if (message.startsWith(MatchEvent.DamageGiven)) {
        event = MatchEvent.DamageGiven;
        const [playerName, hit] = message
            .substr(MatchEvent.DamageGiven.length)
            .trim()
            .split(' - ');
        const [damage, numberOfHits] = hit.split('in').map((x) => x.trim());
        args = [playerName, damage, numberOfHits];
    } else if (message.startsWith(MatchEvent.DamageTaken)) {
        event = MatchEvent.DamageTaken;
        const [playerName, hit] = message
            .substr(MatchEvent.DamageTaken.length)
            .trim()
            .split(' - ');
        const [damage, numberOfHits] = hit.split('in').map((x) => x.trim());
        args = [playerName, damage, numberOfHits];
    }

    const result = new EventWrapper<MatchEvent>(event, args);
    return result;
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