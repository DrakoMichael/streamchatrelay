/**
 * @author Michael Mello
 * @module src.services.app.logManager
 * @description Sistema de logging robusto com suporte a múltiplos níveis e persistência em arquivo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Níveis de log com prioridade
 */
const LogLevel = {
    DEBUG: { value: 0, label: 'DEBUG', color: '\x1b[36m' },    // Cyan
    INFO: { value: 1, label: 'INFO', color: '\x1b[32m' },      // Green
    WARN: { value: 2, label: 'WARN', color: '\x1b[33m' },      // Yellow
    ERROR: { value: 3, label: 'ERROR', color: '\x1b[31m' },    // Red
    CRITICAL: { value: 4, label: 'CRITICAL', color: '\x1b[41m' } // Red Background
};

class logManager {
    /**
     * Diretório base de logs
     * @private
     */
    static logsDir = path.join(__dirname, '../../logs');

    /**
     * Nível mínimo de log a ser registrado
     * @private
     */
    static minLogLevel = LogLevel.DEBUG;

    /**
     * Inicializa o sistema de logging (cria diretório se necessário)
     * @static
     * @returns {void}
     */
    static init() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    /**
     * Gera timestamp formatado
     * @private
     * @returns {string} Timestamp no formato YYYY-MM-DD HH:mm:ss.ms
     */
    static getTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').replace('Z', '');
    }

    /**
     * Gera nome do arquivo de log baseado na data
     * @private
     * @returns {string} Nome do arquivo (ex: log_2025-01-24.txt)
     */
    static getLogFileName() {
        const today = new Date().toISOString().split('T')[0];
        return `log_${today}.txt`;
    }

    /**
     * Retorna caminho completo do arquivo de log
     * @private
     * @returns {string} Caminho absoluto do arquivo
     */
    static getLogFilePath() {
        return path.join(this.logsDir, this.getLogFileName());
    }

    /**
     * Escreve log no console e arquivo
     * @private
     * @param {string} level - Nível de log
     * @param {string} message - Mensagem de log
     * @param {*} data - Dados adicionais opcionais
     */
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

    /**
     * Escreve mensagem no arquivo de log
     * @private
     * @param {string} message - Mensagem formatada
     */
    static writeToFile(message) {
        try {
            const logFile = this.getLogFilePath();
            fs.appendFileSync(logFile, message + '\n', 'utf-8');
        } catch (error) {
            console.error('Erro ao escrever log em arquivo:', error.message);
        }
    }

    /**
     * Log de nível DEBUG
     * @static
     * @param {string} message - Mensagem de debug
     * @param {*} data - Dados adicionais
     */
    static debug(message, data = null) {
        if (LogLevel.DEBUG.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.DEBUG, message, data);
        }
    }

    /**
     * Log de nível INFO
     * @static
     * @param {string} message - Mensagem informativa
     * @param {*} data - Dados adicionais
     */
    static info(message, data = null) {
        if (LogLevel.INFO.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.INFO, message, data);
        }
    }

    /**
     * Log de nível WARN
     * @static
     * @param {string} message - Mensagem de aviso
     * @param {*} data - Dados adicionais
     */
    static warn(message, data = null) {
        if (LogLevel.WARN.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.WARN, message, data);
        }
    }

    /**
     * Log de nível ERROR
     * @static
     * @param {string} message - Mensagem de erro
     * @param {*} data - Dados adicionais ou erro
     */
    static error(message, data = null) {
        if (LogLevel.ERROR.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.ERROR, message, data);
        }
    }

    /**
     * Log de nível CRITICAL
     * @static
     * @param {string} message - Mensagem crítica
     * @param {*} data - Dados adicionais
     */
    static critical(message, data = null) {
        if (LogLevel.CRITICAL.value >= this.minLogLevel.value) {
            this.writeLog(LogLevel.CRITICAL, message, data);
        }
    }

    /**
     * Alias para info() (compatibilidade com código antigo)
     * @static
     * @deprecated Use info() em vez disso
     */
    static addlog(message, data = null) {
        this.info(message, data);
    }

    /**
     * Define o nível mínimo de log a ser registrado
     * @static
     * @param {Object} level - Nível mínimo (ex: LogLevel.INFO)
     */
    static setMinLevel(level) {
        this.minLogLevel = level;
    }

    /**
     * Retorna os níveis de log disponíveis
     * @static
     * @returns {Object} Objeto com todos os níveis
     */
    static getLevels() {
        return LogLevel;
    }
}

// Inicializa o sistema na importação
logManager.init();

export default logManager;
