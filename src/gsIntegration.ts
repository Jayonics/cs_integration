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


}

function ConvertDatatypeObjectToPrimitive(key: any, value: any) {
    switch (key) {
        case 'Boolean' :
            return Boolean(value);
            break;
        case 'Number' :
            return Number(value);
            break;
        case 'String' :
            return String(value);
            break;
        case 'Null' :
            return null;
            break;
        default:
            console.error(`Unknown datatype: ${key}`);
            return null;
    }
}

function ChatCommandParser(player: string, message: string) {
    // A "startsWith" check for the command prefix (can be extended with more prefixes).
    let commandPrefix = new RegExp(/^\/|\$|!/, 'u');
    if (message.match(commandPrefix)) {
        message = message.slice(1); // Strip the command prefix from the message.
        /**
         * @constant
         * @type {RegExp}
         * @description A regex to capture the function name and optional parameter(s) from the chat message.
         * The <Function> capture group may be anything that follows the JavaScript function syntax. I.E:
         * - Permitted characters are: Letters, digits, underscores, and dollar signs.
         * - The function name must begin with a letter.
         * - The function name may not contain spaces.
         * This CAN follow by optional whitespace, and HAS to be followed by an opening parenthesis. This is not captured.
         * The <Arguments> capture group contains subgroups representing primitive data types.
         * - <String> capture group: /(?<String>(?:["'`]).*(?:["'`]))/ JS syntax compatible string.
         * - <Boolean> capture group: /(?<Boolean>true|false)/ JS syntax compatible boolean.
         * - <Number> capture group: /(?<Number>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/ JS syntax compatible number.
         * - <Null> capture group: /(?<Null>null)/ JS syntax compatible null.
         * - <Undefined> capture group: /(?<Undefined>undefined)/ JS syntax compatible undefined.
         * - <Object> capture group: /(?<Object>\{.*\})/ JS syntax compatible object.
         * - <Array> capture group: /(?<Array>\[.*\])/ JS syntax compatible array.
         * - <Function> capture group: /(?<Function>[a-zA-Z_$][a-zA-Z_$0-9]*\(.*\))/ JS syntax compatible function.
         * One data type is captured per message argument.
         *
         * Extra arguments MAY be provided in the message string, so an argument separator regex following
         * the syntax described below can occur either:
         * * Never:
         * * - The message contains either 0 or 1 arguments.
         * * - FLOW: The argument separator regex is not matched.
         * * - FLOW: The closing parenthesis SHOULD FOLLOW the previous <Arguments> sub-group.
         * * === 1: In which case another <Arguments> capture group is expected to follow the Separator.
         * * - This implies the message has 2 arguments.
         * * - FLOW: The argument separator regex is matched.
         * * - FLOW: Another <Arguments> capture group SHOULD FOLLOW the argument separator.
         * * - FLOW: The closing parenthesis SHOULD FOLLOW the previous <Arguments> sub-group.
         * * > 1: For any number of arguments greater than 2.
         * * - FLOW: The same flow as === 1 applies, with the exception that the closing parenthesis are NOT EXPECTED until the last argument.
         * * - (Representation of recursive flow) [ <Arguments> -> Separator -> <Arguments> -> ... -> Closing Parenthesis ]
         * The format of the seperator regex is:
         * - May have any number of whitespace characters before it.
         * - A single comma inbetween.
         * - May have any number of whitespace characters after it.
         * - /(\s*,\s*)/
         *
         */

            // const ArgumentsRegex = /(?:\()(?<Arguments>\s*(?<String>(?:["'`]).*(?:["'`]))|(?<Boolean>true|false)|(?<Null>null)|(?<Number>-?\d+))\s*\)/u
        let ArgumentReg = /(?<String>(?:["'`]).*(?:["'`]))|(?<Boolean>true|false)|(?<Null>null)|(?<Number>-?\d+)/u
        let FuncAndArgs = message.match(/^(?<Command>[a-zA-Z_$][a-zA-Z\d_$]*)\s*\((?<Arguments>.*)\)/u).groups;
        let Func = FuncAndArgs.Command;
        let Args = FuncAndArgs.Arguments.split(/,/).map(
            values => {
                return values.match(ArgumentReg).groups
            })
        // Filter out the undefined elements from the objects.
        Args = Args.map(Index => {
            return Object.keys(Index).reduce((acc, key) => {
                if (Index[key] !== undefined) {
                    acc[key] = Index[key];
                }
                return acc;
            }, {})
        })
        // Then replace the objects with their primitive types based on key name using the ConvertDatatypeObjectToPrimitive function.
        Args = Args.map(Index => {
            return Object.keys(Index).reduce((acc, key) => {
                acc[key] = ConvertDatatypeObjectToPrimitive(key, Index[key]);
                return acc;
            }, {})
        })


        console.log(Args);
        // let FuncArgData = message.match(new RegExp(FunctionRegex.source + ArgumentsRegex.source, 'ug'));
        // const MessageHandlerRegex = /^(?<Function>[a-zA-Z_$][a-zA-Z\d_$]+)(?:\s*)\((?<Arguments>(?<String>(?:["'`]).*(?:["'`]))|(?<Boolean>true|false)|(?<Null>null)|(?<Number>-?\d+))(\s*,\s*)/mgu;
    } else {
        return;
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
                        ChatCommandParser(player, msg);
                        // if (msg.match(/\/saysomethingnice$/)) {
                        //     // Some random compliments for whoever asked.
                        //     const nicewords = [
                        //         `${player} I hope you're having a good day!`,
                        //         `you're doing great ${player}!`,
                        //         `${player} looking good!`,
                        //         `you could play with the pros ${player}.`,
                        //     ]
                        //     // Wait a second before sending the message.
                        //     await new Promise(resolve => setTimeout(resolve, 1000));
                        //     netcon.send(`say ${getRandomArrayEllement(nicewords)}`);
                        //     console.log(`${getRandomArrayEllement(nicewords)}`);
                        // } else if (msg.match(/\/saysomethingnice\(.*\)$/)) {
                        //     // Some random compliments for whoever is mentioned within the parentheses.
                        //     // Capture the player name within the parentheses.
                        //     let mention = msg.match(/\/(?:saysomethingnice)\((?<argument>.*)\)/);
                        //     const nicewords = [
                        //         `${mention} I hope you're having a good day!`,
                        //         `you're doing great ${mention}!`,
                        //         `${mention} looking good!`,
                        //         `you could play with the pros ${mention}.`,
                        //     ]
                        //     // Wait a second before sending the message.
                        //     await new Promise(resolve => setTimeout(resolve, 1000));
                        //     netcon.send(`say ${getRandomArrayEllement(nicewords)}`);
                        //     console.log(`${getRandomArrayEllement(nicewords)}`);
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
                                const matchEvent = parseMatchEvent(line);
                                switch (matchEvent.event) {
                                    case MatchEvent.PlayerConnected:
                                        // todo: Do something fun with this.
                                        netcon.send(
                                            `say Player connected: ${matchEvent.value}`
                                        )
                                        knownPlayers.push(matchEvent.value)
                                        console.log(knownPlayers);
                                        break;
                                    case MatchEvent.PlayerDisconnected:
                                        // todo: Do something fun with this.
                                        netcon.send(
                                            `say Player disconnected: ${matchEvent.value}`
                                        )
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
                    if (post.player.state.round_killhs > postDataArray[1].player.state.round_killhs) {
                        let randomHeadshotMessages = [
                            `${post.player.name} is a headshot machine!`,
                            `Boom Headshot!`,
                            `Ez pz, Lemon Headshot.`,
                            `Heads will roll!`,
                            `${getRandomArrayEllement(knownPlayers)} grab the shovel...`
                        ]
                        let randomHeadshotMessage = getRandomArrayEllement(randomHeadshotMessages);
                        netcon.send(`say ${randomHeadshotMessage}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (post.player.state.round_kills > postDataArray[1].player.state.round_kills) {
                        let randomKillMessages = [
                            `${post.player.name} is a kill machine!`,
                            `${getRandomArrayEllement(knownPlayers)} get the body bag!`,
                            `☠️`,
                            `Looks like it's bin day today.`,
                            `Don't worry, it'll all be over soon...`,
                            `Better luck next round.`
                        ]
                        let randomKillMessage = getRandomArrayEllement(randomKillMessages);
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
                        netcon.send(`say Game over!`);
                        // Clear the known players at the end of the match.
                        knownPlayers = [];
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
//     rainbowCrosshair(50);
// } while (netcon.connectionOpen === true);