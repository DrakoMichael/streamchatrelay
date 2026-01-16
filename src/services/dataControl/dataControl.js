import fs from 'fs';
import config from '../../config.json' with { type: 'json' };

export default function dataControl(param,data) {
  // setInterval(() => {
  //   addFile(`Data Analyses Log Entry at ${new Date().toISOString()}\n`);
  // }, config.data_analysis.data_analysis_interval_ms);

  switch (param) {
    case 'addMessage': {
      addChatToLog(data);
      break;
    }
    case 'default': {
      // default case
      break;
    }
  };
}

function addChatToLog(params) {
  if (!config.data_control.storage_messages_enabled) return;
  if(!fs.existsSync('../src/logs')){
    fs.mkdirSync('../src/logs');
  }
  const logEntry = `${new Date().toISOString()} - ${params}\n`;
  fs.appendFileSync('../src/logs/chat_log.txt', logEntry);
  healthCheck('chat_log');
}

function addNameToBanFile(params) {
  const logEntry = `${new Date().toISOString()} - ${params}\n`;
  fs.appendFileSync('../src/logs/ban_users.txt', logEntry);
}

function addNameToAdminFile(params) {
  const logEntry = `${new Date().toISOString()} - ${params}\n`;
  fs.appendFileSync('../src/logs/admin_users.txt', logEntry);
}

function addLineToLog(params) {
  fs.appendFileSync('../src/logs/data_analyses_log.txt', params);
}


function healthCheck(typeLog) {
 switch (typeLog) {

   case 'data_analysis':
     fs.appendFileSync('../src/logs/data_analyses_log.txt', `Health Check at ${new Date().toISOString()}\n`);
     break;

   case 'chat_log': {
     const filePath = '../src/logs/chat_log.txt';

     if (fs.existsSync(filePath)) {
       const content = fs.readFileSync(filePath, 'utf-8');
       const lines = content.split('\n').filter(line => line.trim() !== '');
       
       if (lines.length > config.data_control.max_stored_messages) {
         // Mantém apenas as últimas N linhas
         const lastLines = lines.slice(-config.data_control.max_stored_messages);
         fs.writeFileSync(filePath, lastLines.join('\n') + '\n');
       }
       
     }
     break;
   }

   default:
     break;
 }
}