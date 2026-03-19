import 'dotenv/config';
import express from 'express';
import StartSpamDTO from './src/DTO/StartSpamDTO.js';
import SpamTransportRepository from './src/Repository/SpamTransportRepository.js';
import SpamGeneratorService from './src/services/SpamGeneratorService.js';
import SpamOrchestratorService from './src/services/SpamOrchestratorService.js';
import SpamController from './src/Controller/SpamController.js';
import createAuthMiddleware from './src/middlewares/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'spam-chat-messages';
const RETRY_INTERVAL = process.env.RETRY_INTERVAL || 5000; // 5 segundos
const MAX_RETRIES = process.env.MAX_RETRIES || 10;
const ENABLE_WEBSOCKET = process.env.ENABLE_WEBSOCKET !== 'false';
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8081;
const WEBSOCKET_PING_INTERVAL = process.env.WEBSOCKET_PING_INTERVAL || 2000;
const API_TOKEN = process.env.API_TOKEN || 'change-me';

let transportRepository = null;
let spamController = null;
const authMiddleware = createAuthMiddleware(API_TOKEN);

// Inicializar o serviço
async function initialize() {
  transportRepository = new SpamTransportRepository({
    rabbitmqUrl: RABBITMQ_URL,
    queueName: QUEUE_NAME,
    retryInterval: RETRY_INTERVAL,
    maxRetries: MAX_RETRIES,
    enableWebSocket: ENABLE_WEBSOCKET,
    websocketPort: WEBSOCKET_PORT,
    websocketPingInterval: WEBSOCKET_PING_INTERVAL
  });

  await transportRepository.initialize();

  const spamGeneratorService = new SpamGeneratorService();
  const spamOrchestratorService = new SpamOrchestratorService({
    generatorService: spamGeneratorService,
    transportRepository
  });

  spamController = new SpamController({
    spamService: spamOrchestratorService,
    startSpamDTO: StartSpamDTO,
    transportRepository
  });
}

app.use(express.json());

app.get('/start', authMiddleware, async (req, res) => {
  return spamController.start(req, res);
});

app.post('/start', authMiddleware, async (req, res) => {
  return spamController.start(req, res);
});

app.get('/stop', authMiddleware, (req, res) => {
  return spamController.stop(req, res);
});

app.post('/stop', authMiddleware, (req, res) => {
  return spamController.stop(req, res);
});

app.get('/status', (req, res) => {
  return spamController.status(req, res);
});

async function gracefulShutdown() {
  console.log('Encerrando serviço...');
  if (transportRepository) {
    await transportRepository.close();
  }
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Microsserviço rodando em http://localhost:${PORT}`);
    console.log('Use o header x-api-key ou Authorization: Bearer <token> para /start e /stop');
  });
});