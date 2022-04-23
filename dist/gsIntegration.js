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
import * as http from "http";
import { Socket } from "net";
import { parseGameState, parseGlobalEvent, parseMatchEvent } from "./netcon/parsers.mjs";
import { GameState, GlobalEvent, MatchEvent } from "./netcon/types.mjs";
import { Mutex } from "async-mutex";
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var mutex = new Mutex();
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
    var _a, globalEvent, _b, _c, player, msg, _d, matchEvent, _i, message_1, line, globalEvent_1, _e, _f, player, msg, _g, matchEvent, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _a = typeof message;
                switch (_a) {
                    case 'string': return [3 /*break*/, 1];
                    case 'object': return [3 /*break*/, 10];
                }
                return [3 /*break*/, 27];
            case 1:
                globalEvent = parseGlobalEvent(message);
                _b = globalEvent.event;
                switch (_b) {
                    case GlobalEvent.GameStateChanged: return [3 /*break*/, 2];
                    case GlobalEvent.Message: return [3 /*break*/, 3];
                }
                return [3 /*break*/, 4];
            case 2:
                gameState = parseGameState(globalEvent.value);
                return [3 /*break*/, 9];
            case 3:
                _c = globalEvent.value, player = _c[0], msg = _c[1];
                return [3 /*break*/, 9];
            case 4:
                _d = gameState;
                switch (_d) {
                    case GameState.LoadingScreen: return [3 /*break*/, 5];
                    case GameState.Match: return [3 /*break*/, 7];
                }
                return [3 /*break*/, 8];
            case 5:
                netcon.send("echo \"Loading...\"");
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 6:
                _j.sent();
                return [3 /*break*/, 8];
            case 7:
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
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 27];
            case 10:
                _i = 0, message_1 = message;
                _j.label = 11;
            case 11:
                if (!(_i < message_1.length)) return [3 /*break*/, 27];
                line = message_1[_i];
                globalEvent_1 = parseGlobalEvent(line);
                _e = globalEvent_1.event;
                switch (_e) {
                    case GlobalEvent.GameStateChanged: return [3 /*break*/, 12];
                    case GlobalEvent.Message: return [3 /*break*/, 13];
                }
                return [3 /*break*/, 14];
            case 12:
                gameState = parseGameState(globalEvent_1.value);
                return [3 /*break*/, 26];
            case 13:
                _f = globalEvent_1.value, player = _f[0], msg = _f[1];
                return [3 /*break*/, 26];
            case 14:
                _g = gameState;
                switch (_g) {
                    case GameState.LoadingScreen: return [3 /*break*/, 15];
                    case GameState.Match: return [3 /*break*/, 16];
                }
                return [3 /*break*/, 25];
            case 15:
                netcon.send("echo \"Loading...\"");
                return [3 /*break*/, 25];
            case 16:
                matchEvent = parseMatchEvent(line);
                _h = matchEvent.event;
                switch (_h) {
                    case MatchEvent.PlayerConnected: return [3 /*break*/, 17];
                    case MatchEvent.PlayerDisconnected: return [3 /*break*/, 18];
                    case MatchEvent.DamageGiven: return [3 /*break*/, 19];
                    case MatchEvent.DamageTaken: return [3 /*break*/, 22];
                }
                return [3 /*break*/, 23];
            case 17:
                // todo: Do something fun with this.
                netcon.send("say Player connected: ".concat(matchEvent.value));
                return [3 /*break*/, 24];
            case 18:
                // todo: Do something fun with this.
                netcon.send("say Player disconnected: ".concat(matchEvent.value));
                return [3 /*break*/, 24];
            case 19:
                if (!(postDataArray[0].round.phase === "live")) return [3 /*break*/, 21];
                netcon.send("say_team DMG Dealt: ".concat(matchEvent.value[0], " - ").concat(matchEvent.value[1], " in ").concat(matchEvent.value[2]));
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1100); })];
            case 20:
                _j.sent();
                _j.label = 21;
            case 21: return [3 /*break*/, 24];
            case 22: 
            // netcon.send(
            //     `say_team DMG Taken: ${matchEvent.value[0]} - ${matchEvent.value[1]} in ${matchEvent.value[2]}`
            // )
            // await new Promise(resolve => setTimeout(resolve, 1000));
            return [3 /*break*/, 24];
            case 23: return [3 /*break*/, 24];
            case 24: return [3 /*break*/, 25];
            case 25: return [3 /*break*/, 26];
            case 26:
                _i++;
                return [3 /*break*/, 11];
            case 27: return [2 /*return*/];
        }
    });
}); });
// A rainbow crosshair function that cycles through the rainbow (R,G,B format) at a given rate.
function rainbowCrosshair(rate) {
    return __awaiter(this, void 0, void 0, function () {
        var colors, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    colors = [
                        // Peak Red with green fade in.
                        [255, 0, 0],
                        [255, 64, 0],
                        [255, 128, 0],
                        [255, 192, 0],
                        [255, 255, 0],
                        // Peak green with red fade out.
                        [192, 255, 0],
                        [128, 255, 0],
                        [64, 255, 0],
                        [0, 255, 0],
                        // Peak green with blue fade in.
                        [0, 255, 64],
                        [0, 255, 128],
                        [0, 255, 192],
                        [0, 255, 255],
                        // Peak blue with green fade out.
                        [0, 192, 255],
                        [0, 128, 255],
                        [0, 64, 255],
                        [0, 0, 255],
                        // Peak blue with red fade in.
                        [64, 0, 255],
                        [128, 0, 255],
                        [192, 0, 255],
                        [255, 0, 255],
                        // Peak red with blue fade out.
                        [255, 0, 192],
                        [255, 0, 128],
                        [255, 0, 64],
                    ];
                    _a.label = 1;
                case 1:
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < colors.length)) return [3 /*break*/, 5];
                    // Apply the colours individually to the crosshair with the format:
                    // `cl_crosshaircolor_r; cl_crosshaircolor_g; cl_crosshaircolor_b`
                    // And wait for the max console send rate between each colour change.
                    netcon.send("cl_crosshaircolor_r ".concat(colors[i][0], "; cl_crosshaircolor_g ").concat(colors[i][1], "; cl_crosshaircolor_b ").concat(colors[i][2]));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, rate); })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (netcon.connectionOpen === true) return [3 /*break*/, 1];
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
// A function that fits a number within the 0-255 inside a given range.
// TODO: Make this useful in some way.
// FIXME:
// - Figure out why POST data for 0-255 ranges (Flashed, smoked, burning) returns either 255, 1, or 0.
// but not a value in between as you would expect proportional to the scale.
function fitNumberIn(number) {
    // let oldRange = (255)
    // let newRange = (100)
    // return (((number) * newRange) / oldRange);
    return number;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function getRandomArrayEllement(array) {
    return array[getRandomInt(array.length)];
}
// Create an array that hold the last 10 POST messages, pushing and popping
// elements as necessary.
var postDataArray = [];
// @ts-ignore
var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var body_1 = '';
        req.on('data', function (data) {
            body_1 += data;
        });
        req.on('end', function () {
            return __awaiter(this, void 0, void 0, function () {
                var post, randomHeadshotMessages, randomHeadshotMessage, randomKillMessages, randomKillMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            post = JSON.parse(body_1);
                            if (!(post.player.activity === 'playing' && post.player.name === "Jayonics")) return [3 /*break*/, 30];
                            // Keep adding post data to the array until it's full.
                            if (postDataArray.length <= 10) {
                                postDataArray.unshift(post);
                            }
                            else {
                                postDataArray.pop();
                                postDataArray.unshift(post);
                            }
                            if (!(postDataArray.length > 1)) return [3 /*break*/, 30];
                            if (!(post.player.state.smoked == true && postDataArray[1].player.state.smoked == false)) return [3 /*break*/, 2];
                            netcon.send("say_team ".concat(post.player.name, " ").concat(fitNumberIn(post.player.state.smoked), "% smoked "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 2:
                            if (!(post.player.state.smoked > postDataArray[1].player.state.smoked)) return [3 /*break*/, 4];
                            netcon.send("say_team ".concat(post.player.name, " ").concat(fitNumberIn(post.player.state.smoked), "% smoked "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            if (!(post.player.state.smoked == false && postDataArray[1].player.state.smoked == true)) return [3 /*break*/, 6];
                            netcon.send("say_team ".concat(post.player.name, " not smoked anymore! "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            if (!(post.player.state.flashed == true && postDataArray[1].player.state.flashed == false)) return [3 /*break*/, 8];
                            netcon.send("say_team ".concat(post.player.name, " ").concat(fitNumberIn(post.player.state.flashed), "% flashed "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 12];
                        case 8:
                            if (!(post.player.state.flashed > postDataArray[1].player.state.flashed)) return [3 /*break*/, 10];
                            netcon.send("say_team ".concat(post.player.name, " ").concat(fitNumberIn(post.player.state.flashed), "% flashed "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 9:
                            _a.sent();
                            return [3 /*break*/, 12];
                        case 10:
                            if (!(post.player.state.flashed == false && postDataArray[1].player.state.flashed == true)) return [3 /*break*/, 12];
                            netcon.send("say_team ".concat(post.player.name, " not blind anymore! "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 11:
                            _a.sent();
                            _a.label = 12;
                        case 12:
                            if (!(post.player.state.burning == true && postDataArray[1].player.state.burning == false)) return [3 /*break*/, 14];
                            netcon.send("say_team ".concat(post.player.name, " ").concat(fitNumberIn(post.player.state.burning), "% burning "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 13:
                            _a.sent();
                            return [3 /*break*/, 18];
                        case 14:
                            if (!(post.player.state.burning > postDataArray[1].player.state.burning)) return [3 /*break*/, 16];
                            netcon.send("say_team ".concat(post.player.name, " ").concat(fitNumberIn(post.player.state.burning), "% burning "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 15:
                            _a.sent();
                            return [3 /*break*/, 18];
                        case 16:
                            if (!(post.player.state.burning == false && postDataArray[1].player.state.burning == true)) return [3 /*break*/, 18];
                            netcon.send("say_team ".concat(post.player.name, " not burning anymore! "));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 17:
                            _a.sent();
                            _a.label = 18;
                        case 18:
                            if (!(post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths)) return [3 /*break*/, 20];
                            netcon.send("say R.I.P ");
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 19:
                            _a.sent();
                            _a.label = 20;
                        case 20:
                            if (!(post.player.state.round_killhs > postDataArray[1].player.state.round_killhs)) return [3 /*break*/, 22];
                            randomHeadshotMessages = [
                                "".concat(post.player.name, " is a headshot machine!"),
                                "Boom Headshot!",
                                "Ez pz, Lemon Headshot.",
                                "Ez Hz",
                                "Heads will roll!"
                            ];
                            randomHeadshotMessage = getRandomArrayEllement(randomHeadshotMessages);
                            netcon.send("say ".concat(randomHeadshotMessage));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 21:
                            _a.sent();
                            return [3 /*break*/, 24];
                        case 22:
                            if (!(post.player.state.round_kills > postDataArray[1].player.state.round_kills)) return [3 /*break*/, 24];
                            randomKillMessages = [
                                "".concat(post.player.name, " is a kill machine!"),
                                "Someone get the body bag!",
                                "\u2620\uFE0F",
                                "\uD83D\uDDD1\uFE0F",
                                "Don't worry, it'll all be over soon...",
                                "Better luck next round."
                            ];
                            randomKillMessage = getRandomArrayEllement(randomKillMessages);
                            netcon.send("say ".concat(randomKillMessage));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 23:
                            _a.sent();
                            _a.label = 24;
                        case 24:
                            if (!(post.map.phase == 'live' && postDataArray[1].map.phase == 'warmup')) return [3 /*break*/, 26];
                            netcon.send("say Gl Hf");
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 25:
                            _a.sent();
                            return [3 /*break*/, 30];
                        case 26:
                            if (!(post.map.phase == 'intermission' && postDataArray[1].map.phase == 'live')) return [3 /*break*/, 28];
                            netcon.send("say Good half.");
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 27:
                            _a.sent();
                            return [3 /*break*/, 30];
                        case 28:
                            if (!(post.map.phase == 'gameover' && postDataArray[1].map.phase == 'live')) return [3 /*break*/, 30];
                            netcon.send("say Game over!");
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 29:
                            _a.sent();
                            _a.label = 30;
                        case 30:
                            res.end("Received POST request: " + post);
                            return [2 /*return*/];
                    }
                });
            });
        });
    }
    else {
        console.log("Not expecting a " + req.method + " request");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
        res.end(html);
    }
});
netcon.connect();
server.listen(port, '0.0.0.0');
console.log('Server running at http://' + host + ':' + port + '/');
do {
    rainbowCrosshair(50);
} while (netcon.connectionOpen === true);
//# sourceMappingURL=gsIntegration.js.map