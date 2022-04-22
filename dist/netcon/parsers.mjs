// event-parser.ts
//game-state-parser.ts
import { EventWrapper, GameState, GlobalEvent, MatchEvent } from './types.mjs';
export function parseMatchEvent(message) {
    var event = MatchEvent.Unknown;
    var args = null;
    if (message.endsWith(MatchEvent.PlayerConnected)) {
        event = MatchEvent.PlayerConnected;
        args = message
            .substr(0, message.length - MatchEvent.PlayerConnected.length)
            .trim();
    }
    else if (message.startsWith(MatchEvent.DamageGiven)) {
        event = MatchEvent.DamageGiven;
        var _a = message
            .substr(MatchEvent.DamageGiven.length)
            .trim()
            .split(' - '), playerName = _a[0], hit = _a[1];
        var _b = hit.split('in').map(function (x) { return x.trim(); }), damage = _b[0], numberOfHits = _b[1];
        args = [playerName, damage, numberOfHits];
    }
    else if (message.startsWith(MatchEvent.DamageTaken)) {
        event = MatchEvent.DamageTaken;
        var _c = message
            .substr(MatchEvent.DamageTaken.length)
            .trim()
            .split(' - '), playerName = _c[0], hit = _c[1];
        var _d = hit.split('in').map(function (x) { return x.trim(); }), damage = _d[0], numberOfHits = _d[1];
        args = [playerName, damage, numberOfHits];
    }
    var result = new EventWrapper(event, args);
    return result;
}
export function parseGlobalEvent(message) {
    var event = GlobalEvent.Unknown;
    var args = null;
    if (message.startsWith(GlobalEvent.GameStateChanged)) {
        event = GlobalEvent.GameStateChanged;
        args = message.substr(GlobalEvent.GameStateChanged.length);
    }
    else if (message.indexOf(GlobalEvent.Message) !== -1) {
        event = GlobalEvent.Message;
        args = message.split(GlobalEvent.Message);
    }
    else {
        event = GlobalEvent.Unknown;
    }
    var result = new EventWrapper(event, args);
    return result;
}
export function parseGameState(message) {
    var split = message.split('->');
    switch (split[1].trim()) {
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
//# sourceMappingURL=parsers.mjs.map