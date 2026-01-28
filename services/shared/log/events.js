import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LogLevel = {
    DEBUG: { value: 0, label: 'DEBUG', color: '\x1b[36m' },    // Cyan
    INFO: { value: 1, label: 'INFO', color: '\x1b[32m' },      // Green
    WARN: { value: 2, label: 'WARN', color: '\x1b[33m' },      // Yellow
    ERROR: { value: 3, label: 'ERROR', color: '\x1b[31m' },    // Red
    CRITICAL: { value: 4, label: 'CRITICAL', color: '\x1b[41m' } // Red Background
};

class logManager {
    static logsDir = path.join(__dirname, '../../logs');

    static minLogLevel = LogLevel.DEBUG;

    static init() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    static getTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').replace('Z', '');
    }

    static getLogFileName() {
        const today = new Date().toISOString().split('T')[0];
        return `log_${today}.txt`;
    }

    static getLogFilePath() {
        return path.join(this.logsDir, this.getLogFileName());
    }

    static writeLog(level, message, data = null) {
        const timestamp = this.getTimestamp();
        const levelObj = level;

        // Formata mensagem
        let logMessage = `[${timestamp}] [${levelObj.label}] ${message}`;
        if (data) {
            logMessage += ` | ${JSON.stringify(data)}`;
        }

        // Escreve no console com cor
        const resetColor = '\x1b[0m';
        console.log(`${levelObj.color}${logMessage}${resetColor}`);

        // Escreve no arquivo (sem cores ANSI)
        this.writeToFile(logMessage);
    }

    static writeToFile(message) {
        try {
            const logFile = this.getLogFilePath();
            fs.appendFileSync(logFile, message + '\n', 'utf-8');
        } catch (error) {
            console.error('Erro ao escrever log em arquivo:', error.message);
        }
    }

    static debug(message, data = null) {
        if (LogLevel.DEBUG.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.DEBUG, message, data);
        }
    }

    static info(message, data = null) {
        if (LogLevel.INFO.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.INFO, message, data);
        }
    }

    static warn(message, data = null) {
        if (LogLevel.WARN.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.WARN, message, data);
        }
    }

    static error(message, data = null) {
        if (LogLevel.ERROR.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.ERROR, message, data);
        }
    }

    static critical(message, data = null) {
        if (LogLevel.CRITICAL.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.CRITICAL, message, data);
        }
    }

    static addlog(message, data = null) {
        this.info(message, data);
    }

    static setMinLevel(level) {
        this.minLogLevel = level;
    }

    static getLevels() {
        return LogLevel;
    }
}

logManager.init();

export default logManager;
