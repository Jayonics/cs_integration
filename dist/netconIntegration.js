import { Socket } from 'net';
var Client = /** @class */ (function () {
    function Client(port, host) {
        var _this = this;
        this.port = port;
        this.host = host;
        this.connectionOpen = false;
        this.socket = new Socket();
        this.socket.addListener('error', function () {
            _this.connectionOpen = false;
            console.error('Failed to connect to CSGO.', "\nStart CSGO and make sure that you add launch option: -netconport ".concat(_this.port));
        });
    }
    Client.prototype.connect = function () {
        var _this = this;
        console.log('Connecting...');
        return this.socket.connect(this.port, this.host, function () {
            _this.connectionOpen = true;
            console.log('Connected!');
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
var netcon = new Client(2323, '10.66.11.1');
netcon.connect();
netcon.send("crosshair 0");
netcon.send("crosshair 1");
//# sourceMappingURL=netconIntegration.js.map