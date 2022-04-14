import * as http from "http";
import * as fs from "fs";
import { Socket } from "net";
import {parseGameState, parseGlobalEvent, parseMatchEvent} from "./netcon/parsers.mjs";
import {GameState, GlobalEvent, LanguageIso, MatchEvent} from "./netcon/types.mjs";
import {translate} from "./netcon/services.mjs";

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
                'Failed to connect Netcon socket.',
                `\nStart CSGO and make sure that you add launch option: -netconport ${this.port}`
            );
        });
    }

    connect(): Socket {
        console.log(`Connecting Netcon Socket to ${this.host}:${this.port}...`);
        return this.socket.connect(this.port, this.host, () => {
            this.connectionOpen = true;
            console.info('Connected!');
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

let gameState = GameState.Initial;
const netcon = new Client(2323, '10.66.11.1');
netcon.addListener(async (message: string) => {
    const globalEvent = parseGlobalEvent(message);
    switch (globalEvent.event) {
        case GlobalEvent.GameStateChanged:
            gameState = parseGameState(globalEvent.value as string);
            break;
        case GlobalEvent.Message:
            const [player, msg] = (globalEvent.value as string[]);
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
                    netcon.send(
                        `echo "Loading..."`,
                    )
                    break;
                case GameState.Match:
                    const matchEvent = parseMatchEvent(message);
                    switch (matchEvent.event) {
                        case MatchEvent.PlayerConnected:
                            // todo: Do something fun with this.
                            netcon.send(
                                `say Player connected: ${matchEvent.value}`
                            )
                            break;
                        case MatchEvent.PlayerDisconnected:
                            // todo: Do something fun with this.
                            netcon.send(
                                `say Player disconnected: ${matchEvent.value}`
                            )
                            break;
                        default:
                            break;
                    }
                    break;
            }
            break;
    }
});
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
                    if (post.player.state.health < postDataArray[1].player.state.health && post.player.state.health !== 0) {
                        let fighting = true;
                        let lastHealth = post.player.state.health;
                        netcon.send(`say I lost  -${(postDataArray[1].player.state.health - post.player.state.health)} health`);
                    }

                    if (post.player.state.flashed == true && postDataArray[1].player.state.flashed == false) {
                        netcon.send(`say I'm ${post.player.state.flashed * 100}% flashed `);
                    } else if (post.player.state.flashed > postDataArray[1].player.state.flashed) {
                        netcon.send(`say I'm ${post.player.state.flashed * 100}% flashed `);
                    } else if (post.player.state.flashed == false && postDataArray[1].player.state.flashed == true) {
                        netcon.send(`say I'm not blind anymore! `);
                    }

                    if (post.player.state.burning == true && postDataArray[1].player.state.burning == false) {
                        netcon.send(`say I'm on fire! `);
                    } else if (post.player.state.burning == false && postDataArray[1].player.state.burning == true) {
                        netcon.send(`say I'm not on fire anymore! `);
                    }

                    if (post.player.match_stats.kills > postDataArray[1].player.match_stats.kills) {
                        netcon.send(`say K.I.A `);
                    }
                    if (post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths) {
                        netcon.send(`say R.I.P `);
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