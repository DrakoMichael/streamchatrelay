import express from 'express';
import amqp from 'amqplib';
import Spammer from './spammer.js';

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'spam-chat-messages';
const RETRY_INTERVAL = process.env.RETRY_INTERVAL || 5000; // 5 segundos
const MAX_RETRIES = process.env.MAX_RETRIES || 10;

let channel = true;
let spammer = null;
let retryCount = 0;
let isConnecting = false;

// Conectar ao RabbitMQ com retry
async function connectRabbitMQ() {
  if (isConnecting) return;
  
  isConnecting = true;
  
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`✓ Conectado ao RabbitMQ na fila: ${QUEUE_NAME}`);
    retryCount = 0;
    isConnecting = false;
    
    // Reconectar se a conexão cair
    connection.on('error', (err) => {
      console.error('Erro na conexão RabbitMQ:', err.message);
      channel = null;
      retryConnect();
    });
    
    connection.on('close', () => {
      console.warn('Conexão RabbitMQ fechada');
      channel = null;
      retryConnect();
    });
    
    return connection;
  } catch (error) {
    isConnecting = false;
    console.error(`Erro ao conectar RabbitMQ (tentativa ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    retryConnect();
  }
}

// Tentar reconectar com backoff exponencial
function retryConnect() {
  if (retryCount >= MAX_RETRIES) {
    console.error(`✗ Falha ao conectar ao RabbitMQ após ${MAX_RETRIES} tentativas`);
    console.log('A aplicação continuará rodando, mas sem enviar mensagens ao RabbitMQ');
    return;
  }
  
  retryCount++;
  const delay = RETRY_INTERVAL * retryCount; // backoff exponencial
  console.log(`Tentando reconectar em ${delay}ms... (${retryCount}/${MAX_RETRIES})`);
  
  setTimeout(() => {
    connectRabbitMQ();
  }, delay);
}

// Inicializar o serviço
async function initialize() {
  await connectRabbitMQ();
  
  spammer = new Spammer({
    dev_config: {
      enable_spam: true,
      print_spam_chats: true
    },
    send_message: (message) => {
      if (channel) {
        try {
          channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
        } catch (error) {
          console.error('Erro ao enviar mensagem para RabbitMQ:', error.message);
          channel = null;
          retryConnect();
        }
      } else {
        console.warn('RabbitMQ indisponível - mensagem descartada');
      }
    }
  });
}

app.use(express.json());

app.get('/start', async (req, res) => {
  await spammer.start(); 
  res.json({ status: 'Serviço de spam de chat rodando' });
});

app.post('/start', async (req, res) => {
  try {
    const config = req.body || {};
    await spammer.start(config, 'production');
    res.json({ 
      status: 'Spam iniciado', 
      queue: QUEUE_NAME,
      rabbitmq_connected: channel ? true : false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/stop', (req, res) => {
  spammer.stop();
  res.json({ status: 'Spam parado' });
});

app.post('/stop', (req, res) => {
  spammer.stop();
  res.json({ status: 'Spam parado' });
});

app.get('/status', (req, res) => {
  res.json({ 
    status: 'ativo',
    queue: QUEUE_NAME,
    rabbitmq: RABBITMQ_URL,
    rabbitmq_connected: channel ? true : false,
    retry_count: retryCount
  });
});

initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Microsserviço rodando em http://localhost:${PORT}`);
  });
});