// client.ts
import { Socket } from 'net';

export class Client {
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

// translate.ts
import * as https from 'https';
import { Translation, LanguageIso } from './types.mjs';

const translationCache: any = {};
export async function translate(
    language: string,
    message: string
): Promise<Translation> {
    return new Promise<Translation>((resolve, reject) => {
        const cacheResult = translationCache[message] as Translation | undefined;
        if (cacheResult) {
            resolve(cacheResult);
            return;
        }

        const encodedMessage = encodeURIComponent(message);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language}&dt=t&q=${encodedMessage}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                const response = (JSON.parse(data) as [[[string, string]],null, string, null]);
                const [translation, _, language, __] = response;
                const [engText, originalText] = translation[0];
                const result = new Translation(language as LanguageIso, engText);
                translationCache[message] = result;
                resolve(result);
            });
            res.on('error', () => {
                console.log('failed to translate', message);
                reject()
            });
        });
    });
}
