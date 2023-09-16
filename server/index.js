import { WebSocketServer } from 'ws';
import { serverConfig } from '../config.js';
import * as fs from 'fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let config = serverConfig;

const wss = new WebSocketServer({
    port: config.port
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let runtime = config.runtime;

console.log('Listening on port ' + config.port + ' now!');

let sessions = 0;

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(rawData) {
        const data = JSON.parse(rawData);
        if(data.type === "code") {
            sessions++;
            fs.writeFileSync(`${__dirname}/tmp/session${sessions}.js`, data.content);
            let child = spawn(runtime, [`${__dirname}/tmp/session${sessions}.js`]);
            child.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ 'type': 'output', 'content': data.toString() }));
            });
            child.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ 'type': 'error', 'content': data.toString() }));
            });
            child.on('close', () => {
                ws.send(JSON.stringify({ 'type': 'close' }));
                ws.close();
            });
        } else if(data.type === 'timeCode') {
            sessions++;
            fs.writeFileSync(`${__dirname}/tmp/session${sessions}.js`, data.content);
            let child = spawn(`time`, [runtime, `${__dirname}/tmp/session${sessions}.js`]);
            child.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ 'type': 'output', 'content': data.toString() }));
            });
            child.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ 'type': 'error', 'content': data.toString() }));
            });
            child.on('close', () => {
                ws.send(JSON.stringify({ 'type': 'close' }));
                ws.close();
            });
        }
    });

    ws.send(JSON.stringify({ 'type': 'connected' }));
});
