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
var ChatConfiguration = /** @class */ (function () {
    function ChatConfiguration() {
    }
    // Chat commands follow the format /command:option
    // Parses in game messages for configuration options
    ChatConfiguration.ParseChatCommand = function (chatCommand) {
        // Check for the help command first.
        if (chatCommand === '/help') {
            ChatConfiguration.ListChatCommands(chatCommand);
            return;
        }
        // Check the prefix "/"
        if (chatCommand.charAt(0) === '/') {
            // Get the command
            var command = chatCommand.substring(1, chatCommand.indexOf(':'));
            // Get the option
            var option = chatCommand.substring(chatCommand.indexOf(':') + 1);
            // Wait one second to prevent spamming
            new Promise(function (resolve) { return setTimeout(resolve, 1000); });
            // Process the command in the switch statement
            switch (command) {
                case 'headshotkilltalk':
                    if (option === 'on') {
                        ChatConfiguration.HeadshotKillTalk = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Headshot kill talk is now on');
                    }
                    else if (option === 'off') {
                        ChatConfiguration.HeadshotKillTalk = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Headshot kill talk is now off');
                    }
                    break;
                case 'standardkilltalk':
                    if (option === 'on') {
                        ChatConfiguration.StandardKillTalk = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Standard kill talk is now on');
                    }
                    else if (option === 'off') {
                        ChatConfiguration.StandardKillTalk = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Standard kill talk is now off');
                    }
                    break;
                case 'deathtalk':
                    if (option === 'on') {
                        ChatConfiguration.DeathTalk = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Death talk is now on');
                    }
                    else if (option === 'off') {
                        ChatConfiguration.DeathTalk = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Death talk is now off');
                    }
                    break;
                case 'flashstatemessages':
                    if (option === 'on') {
                        ChatConfiguration.FlashStateMessages = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Flash state messages are now on');
                    }
                    else if (option === 'off') {
                        ChatConfiguration.FlashStateMessages = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Flash state messages are now off');
                    }
                    break;
                case 'burningstatemessages':
                    if (option === 'on') {
                        ChatConfiguration.BurningStateMessages = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Burning state messages are now on');
                    }
                    else if (option === 'off') {
                        ChatConfiguration.BurningStateMessages = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Burning state messages are now off');
                    }
                    break;
                case 'smokedstatemessages':
                    if (option === 'on') {
                        ChatConfiguration.SmokedStateMessages = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Smoked state messages are now on');
                    }
                    else if (option === 'off') {
                        ChatConfiguration.SmokedStateMessages = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Smoked state messages are now off');
                    }
                    break;
                default:
                    ChatConfiguration.netcon.sendAllChatMessage(1000, false, 'Invalid command');
                    ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/help for a list of commands');
                    break;
            }
        }
    };
    // List all configuration commands if /help is used
    ChatConfiguration.ListChatCommands = function (chatCommand) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(chatCommand === '/help')) return [3 /*break*/, 7];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        _a.sent();
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/headshotkilltalk - Toggle headshot kill talk on/off');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 2:
                        _a.sent();
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/standardkilltalk - Toggle standard kill talk on/off');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 3:
                        _a.sent();
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/deathtalk - Toggle death talk on/off');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 4:
                        _a.sent();
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/flashstatemessages - Toggle flash state messages on/off');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 5:
                        _a.sent();
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/burningstatemessages - Toggle burning state messages on/off');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 6:
                        _a.sent();
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false, '/smokedstatemessages - Toggle smoked state messages on/off');
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ChatConfiguration.HeadshotKillTalk = true;
    ChatConfiguration.StandardKillTalk = true;
    ChatConfiguration.DeathTalk = true;
    ChatConfiguration.FlashStateMessages = true;
    ChatConfiguration.BurningStateMessages = true;
    ChatConfiguration.SmokedStateMessages = true;
    ChatConfiguration.RainbowCrosshair = true;
    return ChatConfiguration;
}());
export { ChatConfiguration };
//# sourceMappingURL=chatConfiguration.js.map