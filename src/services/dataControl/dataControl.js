import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAT_LOG_PATH = path.join(__dirname, '../../logs/chat_log.txt');
const DATA_ANALYSIS_LOG_PATH = path.join(__dirname, '../../logs/data_analyses_log.txt');
const MAX_STORED_MESSAGES = 200;

export default function dataControl(param, data) {
  switch (param) {
    case 'addMessage':
      addChatToLog(data);
      break;

    default:
      break;
  }
}

function addChatToLog(data) {
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
  fs.appendFileSync(CHAT_LOG_PATH, logEntry);
  healthCheck('chat_log');
}

function healthCheck(typeLog) {
  switch (typeLog) {
    case 'data_analysis':
      fs.appendFileSync(DATA_ANALYSIS_LOG_PATH, `Health Check at ${new Date().toISOString()}\n`);
      break;

    case 'chat_log':
      if (fs.existsSync(CHAT_LOG_PATH)) {
        const content = fs.readFileSync(CHAT_LOG_PATH, 'utf-8');
        const lines = content.split('\n').filter((line) => line.trim() !== '');

        if (lines.length > MAX_STORED_MESSAGES) {
          const lastLines = lines.slice(-MAX_STORED_MESSAGES);
          fs.writeFileSync(CHAT_LOG_PATH, `${lastLines.join('\n')}\n`);
        }
      }
      break;

    default:
      break;
  }
}