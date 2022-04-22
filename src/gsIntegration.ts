import * as http from "http";
import * as fs from 'fs';
import {Socket} from "net";
import {parseGameState, parseGlobalEvent, parseMatchEvent} from "./netcon/parsers.mjs";
import {GameState, GlobalEvent, MatchEvent} from "./netcon/types.mjs";
import {Mutex, MutexInterface, Semaphore, SemaphoreInterface, withTimeout} from "async-mutex";

let port = process.env.PORT || 3000;
let host: string = process.env.HOST || '0.0.0.0';

const mutex = new Mutex();

class Client {
    socket: Socket;
    connectionOpen: boolean;
    cmdQueue: string[] = [];

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

    send(...messages: string[] ): void {
        for (const message of messages) {
            this.socket.write(`${message}\r\n`);
        }
    }

    addListener(handler: (message: string[]) => void): void {
        this.socket.addListener('data', (data: Buffer) => {
            const message = data.toString('utf8').trimEnd().split(/\r?\n/);
            handler(message);
        });
    }


}


let gameState = GameState.Match;
const netcon = new Client(2323, '10.66.11.1');
netcon.addListener(async (message: string[]) => {
    switch (typeof message) {
        case 'string':
            const globalEvent = parseGlobalEvent(message);
            switch (globalEvent.event) {
                case GlobalEvent.GameStateChanged:
                    gameState = parseGameState(globalEvent.value as string);
                    break;
                case GlobalEvent.Message:
                    const [player, msg] = (globalEvent.value as string[]);
                    break;
                default:
                    switch (gameState) {
                        case GameState.LoadingScreen:
                            netcon.send(
                                `echo "Loading..."`,
                            )
                            await new Promise(resolve => setTimeout(resolve, 1000));
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
            break;
        case 'object':
            for (const line of message) {
                const globalEvent = parseGlobalEvent(line);
                switch (globalEvent.event) {
                    case GlobalEvent.GameStateChanged:
                        gameState = parseGameState(globalEvent.value as string);
                        break;
                    case GlobalEvent.Message:
                        const [player, msg] = (globalEvent.value as string[]);
                        break;
                    default:
                        switch (gameState) {
                            case GameState.LoadingScreen:
                                netcon.send(
                                    `echo "Loading..."`,
                                )
                                break;
                            case GameState.Match:
                                const matchEvent = parseMatchEvent(line);
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
                                    case MatchEvent.DamageGiven:
                                        if (postDataArray[0].round.phase === "over") {
                                            netcon.send(`echo Not sending DMG messages in chat.`)
                                        } else {
                                            netcon.send(
                                                `say_team DMG Dealt: ${matchEvent.value[0]} - ${matchEvent.value[1]} in ${matchEvent.value[2]}`
                                            )
                                            await new Promise(resolve => setTimeout(resolve, 1100));
                                        }
                                        break;
                                    case MatchEvent.DamageTaken:
                                        // netcon.send(
                                        //     `say_team DMG Taken: ${matchEvent.value[0]} - ${matchEvent.value[1]} in ${matchEvent.value[2]}`
                                        // )
                                        // await new Promise(resolve => setTimeout(resolve, 1000));
                                        break;
                                    default:
                                        break;
                                }
                                break;
                        }
                        break;
                }
            }
    }
});

// A rainbow crosshair function that cycles through the rainbow (R,G,B format) at a given rate.
async function rainbowCrosshair(rate: number) {
    // The colours array should have 27 intervals (3^3), evenly spaced.
    const colors = [
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
    const lowRangeColors = [
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
    ]
    // The current colour index
    do {
        for(let i = 0; i < lowRangeColors.length; i++) {
            // Apply the colours individually to the crosshair with the format:
            // `cl_crosshaircolor_r cl_crosshaircolor_g cl_crosshaircolor_b`
            // And wait for max console send rate between each colour change.
            netcon.send(`cl_crosshaircolor_r ${lowRangeColors[i][0]}`);
            await new Promise(resolve => setTimeout(resolve, rate));
            netcon.send(`cl_crosshaircolor_g ${lowRangeColors[i][1]}`);
            await new Promise(resolve => setTimeout(resolve, rate));
            netcon.send(`cl_crosshaircolor_b ${lowRangeColors[i][2]}`);
            await new Promise(resolve => setTimeout(resolve, rate));
        }
    } while(netcon.connectionOpen === true);
}

// A function that fits a number within the 0-255 inside a given range.
function fitNumberIn(number: number) {
    // let oldRange = (255)
    // let newRange = (100)
    // return (((number) * newRange) / oldRange);
    return number;
}

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
        req.on('end', async function () {
            var post = JSON.parse(body);
            if (post.player.activity === 'playing' && post.player.name === "Jayonics") {
                // Keep adding post data to the array until it's full.
                if (postDataArray.length <= 10) {
                    postDataArray.unshift(post);
                } else {
                    postDataArray.pop();
                    postDataArray.unshift(post);
                }

                // Only run functions if there is a previous post to compare to.
                if (postDataArray.length > 1) {
                    // if (post.player.state.health < postDataArray[1].player.state.health && post.player.state.health !== 0) {
                    //     let fighting = true;
                    //     let lastHealth = post.player.state.health;
                    //     netcon.send(`say_team ${post.player.name} lost  -${(postDataArray[1].player.state.health - post.player.state.health)} health`);
                    //     await new Promise(resolve => setTimeout(resolve, 1000));
                    // }

                    if (post.player.state.smoked == true && postDataArray[1].player.state.smoked == false) {
                        netcon.send(`say_team ${post.player.name} ${fitNumberIn(post.player.state.smoked)}% smoked `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.smoked > postDataArray[1].player.state.smoked) {
                        netcon.send(`say_team ${post.player.name} ${fitNumberIn(post.player.state.smoked)}% smoked `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.smoked == false && postDataArray[1].player.state.smoked == true) {
                        netcon.send(`say_team ${post.player.name} not smoked anymore! `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    if (post.player.state.flashed == true && postDataArray[1].player.state.flashed == false) {
                        netcon.send(`say_team ${post.player.name} ${fitNumberIn(post.player.state.flashed)}% flashed `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.flashed > postDataArray[1].player.state.flashed) {
                        netcon.send(`say_team ${post.player.name} ${fitNumberIn(post.player.state.flashed)}% flashed `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.flashed == false && postDataArray[1].player.state.flashed == true) {
                        netcon.send(`say_team ${post.player.name} not blind anymore! `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    if (post.player.state.burning == true && postDataArray[1].player.state.burning == false) {
                        netcon.send(`say_team ${post.player.name} ${fitNumberIn(post.player.state.burning)}% burning `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.burning > postDataArray[1].player.state.burning) {
                        netcon.send(`say_team ${post.player.name} ${fitNumberIn(post.player.state.burning)}% burning `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.burning == false && postDataArray[1].player.state.burning == true) {
                        netcon.send(`say_team ${post.player.name} not burning anymore! `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    if (post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths) {
                        netcon.send(`say R.I.P `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    if (post.player.state.round_killhs > postDataArray[1].player.state.round_kills) {
                        netcon.send(`say Ez Hs `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.round_kills > postDataArray[1].player.state.round_kills) {
                        netcon.send(`say Ez killz `);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    // Game phase messages
                    // Warmup to live
                    if (post.map.phase == 'live' && postDataArray[1].map.phase == 'warmup') {
                        netcon.send(`say Gl Hf`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    // live to halftime
                    else if (post.map.phase == 'intermission' && postDataArray[1].map.phase == 'live') {
                        netcon.send(`say Good half.`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    // end of match
                    else if (post.map.phase == 'gameover' && postDataArray[1].map.phase == 'live') {
                        netcon.send(`say Game over!`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            res.end("Received POST request: " + post);
        });
    } else {
        console.log("Not expecting a " + req.method + " request");
        res.writeHead(200, {'Content-Type': 'text/html'});
        let html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
        res.end(html);
    }
});

netcon.connect()
server.listen(port, '0.0.0.0');
console.log('Server running at http://' + host + ':' + port + '/');

// do {
//     rainbowCrosshair(100);
// } while (netcon.connectionOpen === true);