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
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var Client = /** @class */ (function () {
    function Client(port, host) {
        var _this = this;
        this.port = port;
        this.host = host;
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
            if (data && handler) {
                var message = data.toString('utf8');
                handler(message);
            }
        });
    };
    return Client;
}());
var gameState = GameState.Initial;
var netcon = new Client(2323, '10.66.11.1');
netcon.addListener(function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var globalEvent, _a, player, msg, matchEvent;
    return __generator(this, function (_b) {
        globalEvent = parseGlobalEvent(message);
        switch (globalEvent.event) {
            case GlobalEvent.GameStateChanged:
                gameState = parseGameState(globalEvent.value);
                break;
            case GlobalEvent.Message:
                _a = globalEvent.value, player = _a[0], msg = _a[1];
                // const { text, language } = await translate(LanguageIso.English, msg);
                // if (!skipLanguages[language]) {
                //     const translationKey = "[msg]";
                //     const translatedPlayerMessage = `${translationKey} ${player}: ${text}`;
                //     console.log(translatedPlayerMessage);
                //     netcon.send(
                //         "developer 1",
                //         "con_filter_enable 2",
                //         `con_filter_text "${translationKey}"`,
                //         `echo "${translatedPlayerMessage}"`,
                //     );
                // }
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
        return [2 /*return*/];
    });
}); });
netcon.connect();
// Create an array that hold the last 10 POST messages, pushing and popping
// elements as necessary.
var postDataArray = [];
var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var body_1 = '';
        req.on('data', function (data) {
            body_1 += data;
        });
        req.on('end', function () {
            var post = JSON.parse(body_1);
            if (post.player.name === 'Jayonics' && post.player.activity === 'playing') {
                // Keep adding post data to the array until it's full.
                if (postDataArray.length <= 10) {
                    postDataArray.unshift(post);
                }
                else {
                    postDataArray.pop();
                    postDataArray.unshift(post);
                }
                // Only run functions if there is a previous post to compare to.
                if (postDataArray.length > 1) {
                    if (post.player.state.health < postDataArray[1].player.state.health && post.player.state.health !== 0) {
                        var fighting = true;
                        var lastHealth = post.player.state.health;
                        netcon.send("say I lost  -".concat((postDataArray[1].player.state.health - post.player.state.health), " health"));
                    }
                    if (post.player.state.flashed == true && postDataArray[1].player.state.flashed == false) {
                        netcon.send("say I'm ".concat(post.player.state.flashed * 100, "% flashed "));
                    }
                    else if (post.player.state.flashed > postDataArray[1].player.state.flashed) {
                        netcon.send("say I'm ".concat(post.player.state.flashed * 100, "% flashed "));
                    }
                    else if (post.player.state.flashed == false && postDataArray[1].player.state.flashed == true) {
                        netcon.send("say I'm not blind anymore! ");
                    }
                    if (post.player.state.burning == true && postDataArray[1].player.state.burning == false) {
                        netcon.send("say I'm on fire! ");
                    }
                    else if (post.player.state.burning == false && postDataArray[1].player.state.burning == true) {
                        netcon.send("say I'm not on fire anymore! ");
                    }
                    if (post.player.match_stats.kills > postDataArray[1].player.match_stats.kills) {
                        netcon.send("say K.I.A ");
                    }
                    if (post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths) {
                        netcon.send("say R.I.P ");
                    }
                }
            }
            res.end("Received POST request: " + post);
        });
    }
    else {
        console.log("Not expecting a " + req.method + " request");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
        res.end(html);
    }
});
server.listen(port, host);
console.log('Server running at http://' + host + ':' + port + '/');
//# sourceMappingURL=gsIntegration.js.map