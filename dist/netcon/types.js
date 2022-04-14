// enums.ts
export var LanguageIso;
(function (LanguageIso) {
    LanguageIso["English"] = "en";
    LanguageIso["Russia"] = "ru";
    LanguageIso["Swedish"] = "sv";
    LanguageIso["Danish"] = "da";
    LanguageIso["Norwegian"] = "no";
})(LanguageIso || (LanguageIso = {}));
// events.ts
export var MatchEvent;
(function (MatchEvent) {
    MatchEvent["Unknown"] = "";
    MatchEvent["PlayerConnected"] = "connected.";
    MatchEvent["PlayerDisconnected"] = "disconnected.";
    MatchEvent["DamageGiven"] = "Damage Given to";
    MatchEvent["DamageTaken"] = "Damage Taken from";
})(MatchEvent || (MatchEvent = {}));
export var LobbyEvent;
(function (LobbyEvent) {
    LobbyEvent["PlayerJoined"] = "";
})(LobbyEvent || (LobbyEvent = {}));
export var GlobalEvent;
(function (GlobalEvent) {
    GlobalEvent["Unknown"] = "";
    GlobalEvent["Message"] = " : ";
    GlobalEvent["GameStateChanged"] = "ChangeGameUIState";
})(GlobalEvent || (GlobalEvent = {}));
var EventWrapper = /** @class */ (function () {
    function EventWrapper(event, value) {
        this.event = event;
        this.value = value;
    }
    return EventWrapper;
}());
export { EventWrapper };
// game-state.ts
export var GameState;
(function (GameState) {
    GameState["Initial"] = "";
    GameState["Unknown"] = "Unknown";
    GameState["Match"] = "CSGO_GAME_UI_STATE_INGAME";
    GameState["PauseMenu"] = "CSGO_GAME_UI_STATE_PAUSEMENU";
    GameState["MainMenu"] = "CSGO_GAME_UI_STATE_MAINMENU";
    GameState["LoadingScreen"] = "CSGO_GAME_UI_STATE_LOADINGSCREEN";
})(GameState || (GameState = {}));
// translation.ts
var Translation = /** @class */ (function () {
    function Translation(language, text) {
        this.language = language;
        this.text = text;
    }
    return Translation;
}());
export { Translation };
//# sourceMappingURL=types.js.map