var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GameService;
(function (GameService) {
    var team;
    (function (team) {
        team["T"] = "T";
        team["CT"] = "CT";
    })(team = GameService.team || (GameService.team = {}));
    var activity;
    (function (activity) {
        activity["playing"] = "playing";
        activity["menu"] = "menu";
        activity["textinput"] = "textinput";
    })(activity = GameService.activity || (GameService.activity = {}));
    var Provider = /** @class */ (function () {
        function Provider() {
        }
        return Provider;
    }());
    GameService.Provider = Provider;
    var Player = /** @class */ (function () {
        function Player() {
        }
        return Player;
    }());
    GameService.Player = Player;
    var State = /** @class */ (function (_super) {
        __extends(State, _super);
        function State() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return State;
    }(Player));
    GameService.State = State;
    var Player_Position = /** @class */ (function (_super) {
        __extends(Player_Position, _super);
        function Player_Position() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Player_Position;
    }(Player));
    GameService.Player_Position = Player_Position;
    var Player_Match_Stats = /** @class */ (function (_super) {
        __extends(Player_Match_Stats, _super);
        function Player_Match_Stats() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Player_Match_Stats;
    }(Player));
    GameService.Player_Match_Stats = Player_Match_Stats;
    var Player_Weapons = /** @class */ (function (_super) {
        __extends(Player_Weapons, _super);
        function Player_Weapons() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Player_Weapons;
    }(Player));
    GameService.Player_Weapons = Player_Weapons;
})(GameService || (GameService = {}));
//# sourceMappingURL=gs-types.mjs.map