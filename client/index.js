import chalk from 'chalk';
import { WebSocket } from 'ws';
import { clientConfig } from '../config.js';

let config = clientConfig;

let protocol = config.secure ? 'wss://' : 'ws://';

const ws = new WebSocket(`${protocol}${config.address}`);

ws.on('error', console.error);

ws.on('message', (rawData) => {
    let data = JSON.parse(rawData);
    let content = data.content;
    switch (data.type) {
        case 'connected':
            console.log(chalk.green('Connected to the server!'));
            break;
        case 'output':
            content = data.content.split('\n').join('\n[Output] ');
            console.log(`[Output] ${content}`);
            break;
        case 'error':
            content = data.content.split('\n').join('\n[Error] ');
            console.log(chalk.red(`[Error] ${content}`));
            break;
        case 'close':
            console.log(chalk.blue('The server disconnected and must\'ve finished executing code!'));
            break;
        default:
            break;
    }
});

import * as fs from 'fs';

let code = fs.readFileSync(config.inputFile, { encoding: 'utf8' });

ws.on('open', () => {
    ws.send(JSON.stringify({ 'type': config.time ? 'timeCode' : 'code', 'content': code }));
});
