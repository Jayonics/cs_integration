import * as http from "http";
import * as fs from "fs";
import { Socket } from "net";

let port = process.env.PORT || 3000;
let host: string = process.env.HOST || '0.0.0.0';

class Client {
    socket: Socket;
    connectionOpen: boolean;

    constructor(
        private port: number,
        private host: string,) {
        this.connectionOpen = false;
        this.socket = new Socket();
        this.socket.addListener('error', () => {
            this.connectionOpen = false;
            console.error(
                'Failed to connect to CSGO.',
                `\nStart CSGO and make sure that you add launch option: -netconport ${this.port}`
            );
        });
    }

    connect(): Socket {
        console.log('Connecting...');
        return this.socket.connect(this.port, this.host, () => {
            this.connectionOpen = true;
            console.log('Connected!');
        });
    }

    send(...messages: string[]): void {
        for(const message of messages) {
            this.socket.write(`${message}\r\n`);
        }
    }

    addListener(handler: (message: string) => void): void {
        this.socket.addListener('data', (data: Buffer) => {
            if(data && handler) {
                const message = data.toString('utf8');
                handler(message);
            }
        });
    }
}

const netcon = new Client(2323, '10.66.11.1');

netcon.connect();

// Create an array that hold the last 10 POST messages, pushing and popping
// elements as necessary.
let postDataArray = [];

let server = http.createServer( function (req, res) {
    if (req.method === 'POST') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        let body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var post = JSON.parse(body);
            if (post.player.name === 'Jayonics' && post.player.activity === 'playing') {
                // Keep adding post data to the array until it's full.
                if (postDataArray.length <= 10) {
                    postDataArray.unshift(post);
                } else {
                    postDataArray.pop();
                    postDataArray.unshift(post);
                }

                // Only run functions if there is a previous post to compare to.
                if (postDataArray.length > 1) {
                    if (post.player.state.health < postDataArray[1].player.state.health) {
                        let fighting = true;
                        let lastHealth = post.player.state.health;
                        console.log('I lost ' + (postDataArray[1].player.state.health - post.player.state.health) + ' health');
                        netcon.send(`say I lost  ${(postDataArray[1].player.state.health - post.player.state.health)} health`);
                    }

                    if (post.player.state.flashed == true && postDataArray[1].player.state.flashed == false) {
                        netcon.send(`say 📸 `);
                    } else if (post.player.state.flashed == false && postDataArray[1].player.state.flashed == true) {
                        netcon.send(`say 📷 `);
                    }

                    if (post.player.match_stats.kills > postDataArray[1].player.match_stats.kills) {
                        netcon.send(`say 🎯 `);
                    }
                    if (post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths) {
                        netcon.send(`say ☠️`);
                    }
                }
            }
            res.end("Received POST request: " + post);
        });
    }
    else {
        console.log("Not expecting a " + req.method + " request");
        res.writeHead(200, {'Content-Type': 'text/html'});
        let html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
        res.end(html);
    }
});


server.listen(port, host);
console.log('Server running at http://' + host + ':' + port + '/');