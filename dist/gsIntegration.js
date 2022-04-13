import * as http from "http";
import { Socket } from "net";
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
                    if (post.player.state.health < postDataArray[1].player.state.health) {
                        var fighting = true;
                        var lastHealth = post.player.state.health;
                        console.log('I lost ' + (postDataArray[1].player.state.health - post.player.state.health) + ' health');
                        netcon.send("say I lost  ".concat((postDataArray[1].player.state.health - post.player.state.health), " health"));
                    }
                    if (post.player.state.flashed == true && postDataArray[1].player.state.flashed == false) {
                        netcon.send("say \uD83D\uDCF8 ");
                    }
                    else if (post.player.state.flashed == false && postDataArray[1].player.state.flashed == true) {
                        netcon.send("say \uD83D\uDCF7 ");
                    }
                    if (post.player.match_stats.kills > postDataArray[1].player.match_stats.kills) {
                        netcon.send("say \uD83C\uDFAF ");
                    }
                    if (post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths) {
                        netcon.send("say \u2620\uFE0F");
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