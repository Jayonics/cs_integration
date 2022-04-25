import * as http from "http";
import {Socket} from "net";
import {parseGameState, parseGlobalEvent, parseMatchEvent} from "./netcon/parsers.mjs";
import {GameState, GlobalEvent, MatchEvent} from "./netcon/types.mjs";
import {Mutex} from "async-mutex";
import {ColorMap, RadialCommandType, RadialMessage, RadioStatus} from "./modules/radioStatus.js"
import { ChatConfiguration } from "./modules/chatConfiguration.js"

let port = process.env.PORT || 3000;
let host: string = process.env.HOST || '0.0.0.0';
let username: string = process.env.USERNAME || 'Jayonics';
let verbose: string = process.env.VERBOSE || 'false';
// Converts the environment variable VERBOSE to a boolean (originally string).
verbose = JSON.parse(verbose);

new ChatConfiguration();


const mutex = new Mutex();

export class Client {
    socket: Socket;
    connectionOpen: boolean;
    cmdQueue: string[] = [];
    buffer: any[] = [];

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

    sendAllChatMessage(delay?: number, verbose?: boolean, ...messages: string[]): void {
        for (const message of messages) {
            this.socket.write(`say ${message}\r\n`);
        }
    }

    sendTeamChatMessage(delay?: number, verbose?: boolean, ...messages: string[]): void {
        for (const message of messages) {
            this.socket.write(`say_team ${message}\r\n`);
        }
    }

    // An extension with the radial command types and functions
    // Sends a radial message to the netcon
    async sendRadialMessage(commandType: RadialCommandType, message: string, color?: ColorMap) {
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
            } else {
                throw new Error("Radio buffer is full and no commands have timed out");
            }
        } else {
            this.buffer.push({
                radialMessage: {commandType, message},
                timeStamp: new Date()
            });
            this.send(RadioStatus.radialCommandParser(commandType, message, color));
            return (RadioStatus.radialCommandParser(commandType, message, color));
        }

    }

    static radialCommandParser(commandType: RadialCommandType, message: string, color?: ColorMap): string {
        // Start forming the string
        let command = `playerchatwheel cw.${commandType}`;
        if (color === undefined) {
            color = ColorMap.white;
        }

        // Add the message and color
        command += `"${color}${message}"`;
        return command;
    }

}

let gameState = GameState.Match;
export let netcon = new Client(2323, '10.66.11.1');
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
                        if (msg.match(/\/(.*)/)) {
                            ChatConfiguration.ParseChatCommand(msg);
                        }
                        if (msg.match(/\/saysomethingnice$/)) {
                            // Some random compliments for whoever asked.
                            const nicewords = [
                                `${player} I hope you're having a good day!`,
                                `you're doing great ${player}!`,
                                `${player} looking good!`,
                                `you could play with the pros ${player}.`,
                            ]
                            // Wait a second before sending the message.
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            netcon.send(`say ${getRandomArrayEllement(nicewords)}`);
                            console.log(`${getRandomArrayEllement(nicewords)}`);
                        } else if (msg.match(/\/saysomethingnice\(.*\)$/)) {
                            // Some random compliments for whoever is mentioned within the parentheses.
                            // Capture the player name within the parentheses.
                            let mention = msg.match(/\/(?:saysomethingnice)\((?<argument>.*)\)/);
                            const nicewords = [
                                `${mention} I hope you're having a good day!`,
                                `you're doing great ${mention}!`,
                                `${mention} looking good!`,
                                `you could play with the pros ${mention}.`,
                            ]
                            // Wait a second before sending the message.
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            netcon.send(`say ${getRandomArrayEllement(nicewords)}`);
                            console.log(`${getRandomArrayEllement(nicewords)}`);
                        }
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
                                        console.log(
                                            `Player connected: ${matchEvent.value}`
                                        );
                                        knownPlayers.push(matchEvent.value)
                                        console.log(knownPlayers);
                                        break;
                                    case MatchEvent.PlayerDisconnected:
                                        // todo: Do something fun with this.
                                        console.log(
                                            `Player disconnected: ${matchEvent.value}`
                                        );
                                        break;
                                    case MatchEvent.DamageGiven:
                                        // TODO: Handle dealing with an undefined phase.
                                        if (postDataArray[0].round.phase === "live") {
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
    do {
        for (let i = 0; i < colors.length; i++) {
            // Apply the colours individually to the crosshair with the format:
            // `cl_crosshaircolor_r; cl_crosshaircolor_g; cl_crosshaircolor_b`
            // And wait for the max console send rate between each colour change.
            netcon.send(`cl_crosshaircolor_r ${colors[i][0]}; cl_crosshaircolor_g ${colors[i][1]}; cl_crosshaircolor_b ${colors[i][2]}`);
            await new Promise(resolve => setTimeout(resolve, rate));
        }
    } while (netcon.connectionOpen === true);
}

// A function that fits a number within the 0-255 inside a given range.
// TODO: Make this useful in some way.
// FIXME:
// - Figure out why POST data for 0-255 ranges (Flashed, smoked, burning) returns either 255, 1, or 0.
// but not a value in between as you would expect proportional to the scale.
function fitNumberIn(number: number) {
    // let oldRange = (255)
    // let newRange = (100)
    // return (((number) * newRange) / oldRange);
    return number;
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomArrayEllement(array: any[]) {
    return array[getRandomInt(array.length)];
}

// Create an array that hold the last 10 POST messages, pushing and popping
// elements as necessary.
let postDataArray = [];
let knownPlayers = [];
let refreshPlayers = null;

// @ts-ignore
let server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        let body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', async function () {
            var post = JSON.parse(body);
            // A temporary way of populating the known players by joining spectators.
            if (post.allplayers !== null && refreshPlayers == true) {
                knownPlayers = Object.keys(post.allplayers).map(function (key: PropertyKey, index) {
                    return post.allplayers[key].name
                })
                refreshPlayers = false;
                console.log(knownPlayers)
            }
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
                    if (post.player.state.health < postDataArray[1].player.state.health && post.player.state.health !== 0) {
                        netcon.send(`takingfire`)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    if ( ChatConfiguration.SmokedStateMessages === true ) {
                        if (post.player.state.smoked == true && postDataArray[1].player.state.smoked == false) {
                            netcon.send(`say_team ${post.player.name} is smoked! `);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else if (post.player.state.smoked == false && postDataArray[1].player.state.smoked == true) {
                            netcon.send(`say_team ${post.player.name} not smoked anymore! `);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if ( ChatConfiguration.FlashStateMessages === true ) {
                        if (post.player.state.flashed == true && postDataArray[1].player.state.flashed == false) {
                            netcon.send(`say_team ${post.player.name} is flashed! `);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else if (post.player.state.flashed == false && postDataArray[1].player.state.flashed == true) {
                            netcon.send(`say_team ${post.player.name} not blind anymore! `);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if ( ChatConfiguration.BurningStateMessages === true ) {
                        if (post.player.state.burning == true && postDataArray[1].player.state.burning == false) {
                            netcon.send(`say_team ${post.player.name} is burning! `);
                            netcon.send()
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else if (post.player.state.burning == false && postDataArray[1].player.state.burning == true) {
                            netcon.send(`say_team ${post.player.name} not burning anymore! `);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if ( ChatConfiguration.DeathTalk === true ) {
                        if (post.player.match_stats.deaths > postDataArray[1].player.match_stats.deaths) {
                            netcon.send(`say R.I.P `);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if ( post.player.state.money < postDataArray[1].player.state.money && post.player.state.money <= 2000 && post.round.phase !== "live") {
                        netcon.send(`needrop`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    if (post.player.state.round_killhs > postDataArray[1].player.state.round_killhs && ChatConfiguration.HeadshotKillTalk === true) {
                        let randomHeadshotMessages = [
                            `${post.player.name} is a headshot machine!`,
                            `Boom Headshot!`,
                            `Ez pz, Lemon Headshot.`,
                            `Heads will roll!`,
                            `${getRandomArrayEllement(knownPlayers)} grab the shovel...`
                        ]
                        let randomHeadshotMessage = getRandomArrayEllement(randomHeadshotMessages);
                        netcon.send(`enemydown`);
                        netcon.send(`say ${randomHeadshotMessage}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.round_kills > postDataArray[1].player.state.round_kills && ChatConfiguration.StandardKillTalk === true) {
                        let randomKillMessages = [
                            `${post.player.name} is a kill machine!`,
                            `${getRandomArrayEllement(knownPlayers)} get the body bag!`,
                            `☠️`,
                            `Looks like it's bin day today.`,
                            `Don't worry, it'll all be over soon...`,
                            `Better luck next round.`
                        ]
                        let randomKillMessage = getRandomArrayEllement(randomKillMessages);
                        netcon.send(`enemydown`);
                        netcon.send(`say ${randomKillMessage}`);

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
                        netcon.send(`say Good Game!`);
                        // Clear the known players at the end of the match.
                        knownPlayers = [];
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }


                    // If player is on winning round team and alive, send a cheer message.
                    if (post.round.phase === "over" && post.round.win_team === post.player.team && post.player.state.health > 0) {
                        netcon.send(`cheer`);
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
server.listen(3000, '0.0.0.0');
console.log('Server running at http://' + host + ':' + port + '/');

// do {
//     rainbowCrosshair(50);
// } while (netcon.connectionOpen === true);