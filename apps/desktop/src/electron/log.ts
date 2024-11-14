import * as fs from 'fs';
import * as path from 'path';
import isDev from 'electron-is-dev';

const logFilePath: string = __dirname;

function logToFile(
    message: string | any,
    level: string,
    line: number,
    sourceId: string,
    logFileName: string = 'console.log'
): void {
    const timestamp: string = new Date().toString();
    if (typeof message !== 'string') {
        message = JSON.stringify(message, null, 2);
    }
    const logMessage: string = `[${timestamp}] ${level.toUpperCase()}: ${message} (at ${
        sourceId || ''
    }:${line})\n`;
    fs.appendFile(path.join(logFilePath, logFileName), logMessage, err => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

export function D(...args: any[]) {
    if (!isDev) return;
    logToFile(args, 'DEBUG', 0, '', 'debug.log');
}
