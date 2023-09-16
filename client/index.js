import chalk from 'chalk';
import { WebSocket } from 'ws';
import { clientConfig } from '../config.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let config = clientConfig;
let protocol = config.secure ? 'wss://' : 'ws://';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ws = new WebSocket(`${protocol}${config.address}`);

ws.on('error', console.error);

ws.on('message', (rawData) => {
    let data = JSON.parse(rawData);
    let content = data.content;

    let prefix = "";

    switch (data.type) {
        case 'connected':
            console.log(chalk.green('Connected to the server!'));
            break;
        case 'output':
            prefix = config.prefix ? "[Output] " : "";
            content = data.content.split('\n').join(`\n${prefix}`);
            console.log(`${prefix}${content}`);
            break;
        case 'error':
            prefix = config.prefix ? "[Error] " : "";
            content = data.content.split('\n').join(`\n${prefix}`);
            console.log(chalk.red(`${prefix}${content}`));
            break;
        case 'close':
            console.log(chalk.blue('The server disconnected and must\'ve finished executing code!'));
            break;
        default:
            break;
    }
});

import * as fs from 'fs';

let code = fs.readFileSync(join(__dirname ,config.inputFile), { encoding: 'utf8' });

ws.on('open', () => {
    ws.send(JSON.stringify({ 'type': config.time ? 'timeCode' : 'code', 'content': code }));
});
