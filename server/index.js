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


let tmpPath = join(__dirname, 'tmp');


try {
    const stats = fs.statSync(tmpPath);
    if (!stats.isDirectory()) {
        console.error('Error checking tmp folder: not a directory');
    }
} catch (err) {
    if (err.code === 'ENOENT') {
        fs.mkdirSync(tmpPath);
    } else {
        console.error('Error checking tmp folder:', err);
    }
}

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
        let child;
        let command;

        switch (data.type) {
            case 'code':
                sessions++;
                const codeFilePath = join(tmpPath, `session${sessions}.js`);
                fs.writeFileSync(codeFilePath, data.content);
                command = [runtime, codeFilePath];
                break;
            case 'timeCode':
                sessions++;
                const timeCodeFilePath = join(tmpPath, `session${sessions}.js`);
                fs.writeFileSync(timeCodeFilePath, data.content);
                command = ['time', runtime, timeCodeFilePath];
                break;
            default:
                break;
        }

        if (command) {
            let runtime = command[0];
            let args = command.slice(1);

            try {
                child = spawn(runtime, args);
            } catch (err) {
                ws.send(JSON.stringify({ 'type': 'error', 'content': err.toString() }));
            }

            child.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ 'type': 'output', 'content': data.toString() }));
            });
            child.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ 'type': 'error', 'content': data.toString() }));
            });

            child.on('error', (err) => {
                ws.send(JSON.stringify({ 'type': 'error', 'content': err.toString() }));
                ws.send(JSON.stringify({ 'type': 'error', 'content': 'This might indicate that the runtime (node or bun) might not be installed on the server.' }));
            });

            child.on('close', () => {
                ws.send(JSON.stringify({ 'type': 'close' }));
                ws.close();
            });
        }
    });

    ws.send(JSON.stringify({ 'type': 'connected' }));
});