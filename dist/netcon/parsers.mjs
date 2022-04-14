// event-parser.ts
//game-state-parser.ts
import { EventWrapper, GameState, GlobalEvent, MatchEvent } from './types.mjs';
export function parseMatchEvent(message) {
    var event = MatchEvent.Unknown;
    var args = null;
    var messageArray = message.split(/\r?\n/);
    var DamageGivenBuffer = [];
    var DamageTakenBuffer = [];
    var PlayerConnectedBuffer = [];
    messageArray.forEach(function (message) {
        switch (event) {
            case MatchEvent.DamageGiven:
                var DamageGivenObj = void 0;
                if (message.match(/^-+$/)) {
                    break;
                }
                else {
                    if (message.match(/^Damage Given to /)) {
                        DamageGivenObj = message.replace(/^Damage Given to /, '');
                        DamageGivenObj = DamageGivenObj.split(//);
                        DamageGivenObj = DamageGivenObj.match(/(?<=").*(?=")/))[0];
                        DamageGivenObj[0] = DamageGivenObj[0].split(/^ - (\d+)(?= )/);
                        DamageGivenObj[1] = DamageGivenObj[1].split(/^ (\d+)(?= hit)/);
                        DamageGivenBuffer.push(message.replace(/^Damage Given to /, '').split('in'));
                    }
                    else {
                        event = MatchEvent.Unknown;
                        break;
                    }
                }
                break;
            case MatchEvent.DamageTaken:
                if (message.match(/^-+$/)) {
                    break;
                }
                else {
                    if (message.match(/^Damage Taken from /)) {
                        DamageTakenBuffer.push(message);
                    }
                    else {
                        event = MatchEvent.Unknown;
                        break;
                    }
                }
                break;
            case MatchEvent.Unknown:
                if (message.trimEnd().endsWith('Damage Given')) {
                    event = MatchEvent.DamageGiven;
                    var DamageGivenBuffer_1 = [];
                }
                else if (message.trimEnd().endsWith('Damage Taken')) {
                    event = MatchEvent.DamageTaken;
                    var DamageTakenBuffer_1 = [];
                }
                else if (message.trimEnd().endsWith(MatchEvent.PlayerConnected)) {
                    event = MatchEvent.PlayerConnected;
                    PlayerConnectedBuffer.push(message.match(/^(.*)(?= connected\.)/)[1]);
                }
                break;
        }
    });
    return [];
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