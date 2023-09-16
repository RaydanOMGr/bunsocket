import chalk from 'chalk';
import { WebSocket } from 'ws';
import { clientConfig } from '../config.js';

let config = clientConfig;

let protocol = config.secure ? 'wss://' : 'ws://';

const ws = new WebSocket(`${protocol}${config.address}`);

ws.on('error', console.error);

ws.on('message', (rawData) => {
    let data = JSON.parse(rawData);
    if(data.type === 'connected') {
        console.log(chalk.green('Connected to the server!'));
    } else if(data.type === 'output') {
        let content = data.content.split('\n').join('\n[Output] ');
        console.log(`[Output] ${content}`);
    } else if(data.type === 'error') {
        let content = data.content.split('\n').join('\n[Error] ');
        console.log(chalk.red(`[Error] ${content}`));
    } else if(data.type === 'close') {
        console.log(chalk.blue('The server disconnect and must\'ve finished executing code!'));
    }
});

import * as fs from 'fs';

let code = fs.readFileSync(`./client/input/input.js`, { encoding: 'utf8' });

ws.on('open', () => {
    ws.send(JSON.stringify({ 'type': config.time ? 'timeCode' : 'code', 'content': code }));
});
