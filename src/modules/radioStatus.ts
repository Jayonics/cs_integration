// A class for interfacing with the "playerchatwheel CW.*" radio commands.
// Rate limit rules: A maximum of 3 commands issued in a 10-second window.
// The rate limit is based in a first in, first out basis.
// I.E: If radio command 1 is issued at 0 seconds, radio command 2 is issued at 5 seconds, and radio command 3 is
// issued at 9 seconds. You could send radio command 4 command at 10 seconds, as radio command 1 in the queue would
// have timed out. However, if you tried to send radio command 5 before 15 seconds, it would not be accepted.
// Additionally, sending radio commands successively before it's n-3 command has timed out will continuously
// prevent any radio command from being sent. It simply extends the rate limit by an additional 10 seconds.

// The best implementation of this involves a buffer that contains 0-3 active radio commands
// with a 10-second timer for each command. As the command at index 0 is the oldest, and the command at index 2 is the newest
// the buffer is implemented as a FIFO queue, shifting the oldest command out of the buffer at the
// 10-second mark, allowing the next command to be pushed on the buffer. Any attempt to push a new command
// on the buffer when the buffer has 3 active commands should throw an error. Expired commands are removed automatically.

// playerchatwheel console commands also offer the ability to colorise the chat output using the following format:
import {Client} from "../netcon/services.mjs";


export enum ColorMap {
    white = "",
    green = "",
    blue = "",
    darkblue = "",
    darkred = "",
    gold = "",
    grey = "",
    lightgreen = "",
    lightred = "",
    lime = "",
    orchid = "",
    yellow = "	",
    palered = ""
}

export interface RadialMessage {
    Name: string
    HasVoiceLine: boolean
}

export class RadialCommandType {
    public static readonly request: RadialMessage = {
        Name: "request",
        HasVoiceLine: false
    }
    public static readonly respond: RadialMessage = {
        Name: "respond",
        HasVoiceLine: false
    }
    public static readonly followme: RadialMessage = {
        Name: "followme",
        HasVoiceLine: true
    }
    public static readonly gogogo: RadialMessage = {
        Name: "gogogo",
        HasVoiceLine: true
    }


}

export class RadioStatus {
    buffer = [];
    public static readonly rateLimit = {
        timeWindow: 10,
        maxCommands: 3
    }

    constructor() {
        this.buffer = [];
    }

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
            return (RadioStatus.radialCommandParser(commandType, message, color));
        }

    }

    static radialCommandParser(commandType: RadialCommandType, message: string, color?: ColorMap): string {
        // Start forming the string
        let command = `playerchatwheel CW.${commandType}`;
        if (color === undefined) {
            color = ColorMap.white;
        }

        // Add the message and color
        command += ` "${color}${message}"`;
        return command;
    }
}

