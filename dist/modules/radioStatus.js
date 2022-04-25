// A class for interfacing with the "playerchatwheel CW.*" radio commands.
// Rate limit rules: A maximum of 3 commands issued in a 10-second window.
// The rate limit is based in a first in, first out basis.
// I.E: If radio command 1 is issued at 0 seconds, radio command 2 is issued at 5 seconds, and radio command 3 is
// issued at 9 seconds. You could send radio command 4 command at 10 seconds, as radio command 1 in the queue would
// have timed out. However, if you tried to send radio command 5 before 15 seconds, it would not be accepted.
// Additionally, sending radio commands successively before it's n-3 command has timed out will continuously
// prevent any radio command from being sent. It simply extends the rate limit by an additional 10 seconds.
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
export var ColorMap;
(function (ColorMap) {
    ColorMap["white"] = "\u0001";
    ColorMap["green"] = "\u0004";
    ColorMap["blue"] = "\v";
    ColorMap["darkblue"] = "\f";
    ColorMap["darkred"] = "\u0002";
    ColorMap["gold"] = "\u0010";
    ColorMap["grey"] = "\b";
    ColorMap["lightgreen"] = "\u0005";
    ColorMap["lightred"] = "\u000F";
    ColorMap["lime"] = "\u0006";
    ColorMap["orchid"] = "\u000E";
    ColorMap["yellow"] = "\t";
    ColorMap["palered"] = "\u0007";
})(ColorMap || (ColorMap = {}));
var RadialCommandType = /** @class */ (function () {
    function RadialCommandType() {
    }
    RadialCommandType.request = {
        Name: "request",
        HasVoiceLine: false
    };
    RadialCommandType.respond = {
        Name: "respond",
        HasVoiceLine: false
    };
    RadialCommandType.followme = {
        Name: "followme",
        HasVoiceLine: true
    };
    RadialCommandType.gogogo = {
        Name: "gogogo",
        HasVoiceLine: true
    };
    return RadialCommandType;
}());
export { RadialCommandType };
var RadioStatus = /** @class */ (function () {
    function RadioStatus() {
        this.buffer = [];
        this.buffer = [];
    }
    // Sends a radial message to the netcon
    RadioStatus.prototype.sendRadialMessage = function (commandType, message, color) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 1. Check to see if the buffer is full
                // 1.1 If the buffer is full, check to see if the first command in the buffer has timed out
                // 1.2 If the first command in the buffer has timed out, remove it from the buffer and continue
                // 1.3 If the first command in the buffer has not timed out, throw an error
                // 2. Add the new message to the buffer
                // 3. Parse the message
                // 4. Send the message to the netcon
                if (this.buffer.length === RadioStatus.rateLimit.maxCommands) {
                    if (this.buffer[0].timeStamp.getTime() + RadioStatus.rateLimit.timeWindow * 1000 < new Date().getTime()) {
                        this.buffer.shift();
                    }
                    else {
                        throw new Error("Radio buffer is full and no commands have timed out");
                    }
                }
                else {
                    this.buffer.push({
                        radialMessage: { commandType: commandType, message: message },
                        timeStamp: new Date()
                    });
                    return [2 /*return*/, (RadioStatus.radialCommandParser(commandType, message, color))];
                }
                return [2 /*return*/];
            });
        });
    };
    RadioStatus.radialCommandParser = function (commandType, message, color) {
        // Start forming the string
        var command = "playerchatwheel CW.".concat(commandType);
        if (color === undefined) {
            color = ColorMap.white;
        }
        // Add the message and color
        command += " \"".concat(color).concat(message, "\"");
        return command;
    };
    RadioStatus.rateLimit = {
        timeWindow: 10,
        maxCommands: 3
    };
    return RadioStatus;
}());
export { RadioStatus };
//# sourceMappingURL=radioStatus.js.map