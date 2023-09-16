import { WebSocketServer } from 'ws';
import { serverConfig } from '../config.js';
import * as fs from 'fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let config = serverConfig;

const wss = new WebSocketServer({
    port: config.port
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let runtime = config.runtime;

console.log('Listening on port ' + config.port + ' now!');

let tmpPath = __dirname + "/tmp/";

fs.readdir(tmpPath, (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        return;
    }

    files.forEach(file => {
        const filePath = join(tmpPath, file);
        fs.unlink(filePath, err => {
            if (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            }
        });
    });
});

let sessions = 0;

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(rawData) {
        const data = JSON.parse(rawData);
        if(data.type === "code") {
            sessions++;
            fs.writeFileSync(`${tmpPath}/session${sessions}.js`, data.content);
            let child = spawn(runtime, [`${tmpPath}/session${sessions}.js`]);
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
            fs.writeFileSync(`${tmpPath}/session${sessions}.js`, data.content);
            let child = spawn(`time`, [runtime, `${tmpPath}/session${sessions}.js`]);
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
