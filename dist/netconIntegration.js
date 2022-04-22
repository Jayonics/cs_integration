var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Socket } from "net";
import { parseGameState, parseGlobalEvent, parseMatchEvent } from "./netcon/parsers.mjs";
import { GameState, GlobalEvent, MatchEvent } from "./netcon/types.mjs";
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var Client = /** @class */ (function () {
    function Client(port, host) {
        var _this = this;
        this.port = port;
        this.host = host;
        this.cmdQueue = [];
        this.connectionOpen = false;
        this.socket = new Socket();
        this.socket.addListener('error', function () {
            _this.connectionOpen = false;
            console.error('Failed to connect Netcon socket.', "\nStart CSGO and make sure that you add launch option: -netconport ".concat(_this.port));
        });
    }
    Client.prototype.connect = function () {
        var _this = this;
        console.log("Connecting Netcon Socket to ".concat(this.host, ":").concat(this.port, "..."));
        return this.socket.connect(this.port, this.host, function () {
            _this.connectionOpen = true;
            console.info('Connected!');
        });
    };
    Client.prototype.send = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        for (var _a = 0, messages_1 = messages; _a < messages_1.length; _a++) {
            var message = messages_1[_a];
            this.socket.write("".concat(message, "\r\n"));
        }
    };
    Client.prototype.sendVerbose = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        for (var _a = 0, messages_2 = messages; _a < messages_2.length; _a++) {
            var message = messages_2[_a];
            this.socket.write("echo ".concat(message, "\r\n"));
        }
    };
    Client.prototype.addListener = function (handler) {
        this.socket.addListener('data', function (data) {
            var message = data.toString('utf8').trimEnd().split(/\r?\n/);
            handler(message);
        });
    };
    return Client;
}());
var gameState = GameState.Match;
var netcon = new Client(2323, '10.66.11.1');
netcon.addListener(function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, globalEvent, _b, player, msg, matchEvent, _i, message_1, line, globalEvent_1, _c, _d, player, msg, _e, matchEvent, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _a = typeof message;
                switch (_a) {
                    case 'string': return [3 /*break*/, 1];
                    case 'object': return [3 /*break*/, 2];
                }
                return [3 /*break*/, 19];
            case 1:
                globalEvent = parseGlobalEvent(message);
                switch (globalEvent.event) {
                    case GlobalEvent.GameStateChanged:
                        gameState = parseGameState(globalEvent.value);
                        break;
                    case GlobalEvent.Message:
                        _b = globalEvent.value, player = _b[0], msg = _b[1];
                        break;
                    default:
                        switch (gameState) {
                            case GameState.LoadingScreen:
                                netcon.send("echo \"Loading...\"");
                                break;
                            case GameState.Match:
                                matchEvent = parseMatchEvent(message);
                                switch (matchEvent.event) {
                                    case MatchEvent.PlayerConnected:
                                        // todo: Do something fun with this.
                                        netcon.send("say Player connected: ".concat(matchEvent.value));
                                        break;
                                    case MatchEvent.PlayerDisconnected:
                                        // todo: Do something fun with this.
                                        netcon.send("say Player disconnected: ".concat(matchEvent.value));
                                        break;
                                    default:
                                        break;
                                }
                                break;
                        }
                        break;
                }
                return [3 /*break*/, 19];
            case 2:
                _i = 0, message_1 = message;
                _g.label = 3;
            case 3:
                if (!(_i < message_1.length)) return [3 /*break*/, 19];
                line = message_1[_i];
                globalEvent_1 = parseGlobalEvent(line);
                _c = globalEvent_1.event;
                switch (_c) {
                    case GlobalEvent.GameStateChanged: return [3 /*break*/, 4];
                    case GlobalEvent.Message: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 6];
            case 4:
                gameState = parseGameState(globalEvent_1.value);
                return [3 /*break*/, 18];
            case 5:
                _d = globalEvent_1.value, player = _d[0], msg = _d[1];
                return [3 /*break*/, 18];
            case 6:
                _e = gameState;
                switch (_e) {
                    case GameState.LoadingScreen: return [3 /*break*/, 7];
                    case GameState.Match: return [3 /*break*/, 8];
                }
                return [3 /*break*/, 17];
            case 7:
                netcon.send("echo \"Loading...\"");
                return [3 /*break*/, 17];
            case 8:
                matchEvent = parseMatchEvent(line);
                _f = matchEvent.event;
                switch (_f) {
                    case MatchEvent.PlayerConnected: return [3 /*break*/, 9];
                    case MatchEvent.PlayerDisconnected: return [3 /*break*/, 10];
                    case MatchEvent.DamageGiven: return [3 /*break*/, 11];
                    case MatchEvent.DamageTaken: return [3 /*break*/, 13];
                }
                return [3 /*break*/, 15];
            case 9:
                // todo: Do something fun with this.
                netcon.send("say Player connected: ".concat(matchEvent.value));
                return [3 /*break*/, 16];
            case 10:
                // todo: Do something fun with this.
                netcon.send("say Player disconnected: ".concat(matchEvent.value));
                return [3 /*break*/, 16];
            case 11:
                netcon.send("say_team DMG Dealt: ".concat(matchEvent.value[0], " - ").concat(matchEvent.value[1], " in ").concat(matchEvent.value[2]));
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 12:
                _g.sent();
                return [3 /*break*/, 16];
            case 13:
                netcon.send("say_team DMG Taken: ".concat(matchEvent.value[0], " - ").concat(matchEvent.value[1], " in ").concat(matchEvent.value[2]));
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 14:
                _g.sent();
                return [3 /*break*/, 16];
            case 15: return [3 /*break*/, 16];
            case 16: return [3 /*break*/, 17];
            case 17: return [3 /*break*/, 18];
            case 18:
                _i++;
                return [3 /*break*/, 3];
            case 19: return [2 /*return*/];
        }
    });
}); });
// A rainbow crosshair function that cycles through the rainbow (R,G,B format) at a given rate.
function rainbowCrosshair(rate) {
    return __awaiter(this, void 0, void 0, function () {
        var colors, lowRangeColors, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    colors = [
                        [255, 0, 0],
                        [255, 64, 0],
                        [255, 128, 0],
                        [255, 192, 0],
                        [255, 255, 0],
                        [192, 255, 0],
                        [128, 255, 0],
                        [64, 255, 0],
                        [0, 255, 0],
                        [0, 255, 64],
                        [0, 255, 128],
                        [0, 255, 192],
                        [0, 255, 255],
                        [0, 192, 255],
                        [0, 128, 255],
                        [0, 64, 255],
                        [0, 0, 255],
                        [64, 0, 255],
                        [128, 0, 255],
                        [192, 0, 255],
                        [255, 0, 255],
                        [255, 0, 192],
                        [255, 0, 128],
                        [255, 0, 64],
                    ];
                    lowRangeColors = [
                        [255, 0, 0],
                        [255, 128, 0],
                        [255, 255, 0],
                        [128, 255, 0],
                        [0, 255, 0],
                        [0, 255, 128],
                        [0, 255, 255],
                        [0, 128, 255],
                        [0, 0, 255],
                        [128, 0, 255],
                        [255, 0, 255],
                        [255, 0, 128]
                    ];
                    _a.label = 1;
                case 1:
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < lowRangeColors.length)) return [3 /*break*/, 7];
                    // Apply the colours individually to the crosshair with the format:
                    // `cl_crosshaircolor_r cl_crosshaircolor_g cl_crosshaircolor_b`
                    // And wait for max console send rate between each colour change.
                    netcon.send("cl_crosshaircolor_r ".concat(lowRangeColors[i][0]));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, rate); })];
                case 3:
                    _a.sent();
                    netcon.send("cl_crosshaircolor_g ".concat(lowRangeColors[i][1]));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, rate); })];
                case 4:
                    _a.sent();
                    netcon.send("cl_crosshaircolor_b ".concat(lowRangeColors[i][2]));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, rate); })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (netcon.connectionOpen === true) return [3 /*break*/, 1];
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// A function that fits a number within the 0-255 inside a given range.
function fitNumberIn(number) {
    var oldRange = (255);
    var newRange = (number);
    return (((number) * newRange) / oldRange);
}
netcon.connect();
do {
    rainbowCrosshair(100);
} while (netcon.connectionOpen === true);
//# sourceMappingURL=netconIntegration.js.map