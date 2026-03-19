import amqp from 'amqplib';
import SpamChatBotWebSocketServer from '../../spamChatBot_WebSocketServer.js';

class SpamTransportRepository {
  constructor(options = {}) {
    this.rabbitmqUrl = options.rabbitmqUrl || 'amqp://localhost';
    this.queueName = options.queueName || 'spam-chat-messages';
    this.retryInterval = Number(options.retryInterval || 5000);
    this.maxRetries = Number(options.maxRetries || 10);
    this.enableWebSocket = options.enableWebSocket !== false;
    this.websocketPort = Number(options.websocketPort || 8081);
    this.websocketPingInterval = Number(options.websocketPingInterval || 2000);

    this.connection = null;
    this.channel = null;
    this.retryCount = 0;
    this.isConnecting = false;
    this.retryTimeout = null;
    this.websocketServer = null;
  }

  async initialize() {
    await this.connectRabbitMQ();

    if (this.enableWebSocket) {
      try {
        this.websocketServer = await SpamChatBotWebSocketServer.start({
          port: this.websocketPort,
          pingInterval: this.websocketPingInterval
        });
        console.log(`✓ WebSocket iniciado na porta ${this.websocketPort}`);
      } catch (error) {
        console.error('Erro ao iniciar WebSocket:', error.message);
      }
    }
  }

  async connectRabbitMQ() {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });

      this.retryCount = 0;
      this.isConnecting = false;

      console.log(`✓ Conectado ao RabbitMQ na fila: ${this.queueName}`);

      this.connection.on('error', (err) => {
        console.error('Erro na conexão RabbitMQ:', err.message);
        this.channel = null;
        this.scheduleRetry();
      });

      this.connection.on('close', () => {
        console.warn('Conexão RabbitMQ fechada');
        this.channel = null;
        this.scheduleRetry();
      });
    } catch (error) {
      this.isConnecting = false;
      console.error(
        `Erro ao conectar RabbitMQ (tentativa ${this.retryCount + 1}/${this.maxRetries}):`,
        error.message
      );
      this.scheduleRetry();
    }
  }

  scheduleRetry() {
    if (this.retryCount >= this.maxRetries) {
      console.error(`✗ Falha ao conectar ao RabbitMQ após ${this.maxRetries} tentativas`);
      console.log('A aplicação continuará rodando, mas sem enviar mensagens ao RabbitMQ');
      return;
    }

    this.retryCount += 1;
    const delay = this.retryInterval * this.retryCount;

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    console.log(`Tentando reconectar em ${delay}ms... (${this.retryCount}/${this.maxRetries})`);

    this.retryTimeout = setTimeout(() => {
      this.connectRabbitMQ();
    }, delay);
  }

  sendToRabbitMQ(payload) {
    if (!this.channel) {
      return false;
    }

    try {
      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(payload)), {
        persistent: true
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem para RabbitMQ:', error.message);
      this.channel = null;
      this.scheduleRetry();
      return false;
    }
  }

  sendToWebSocket(payload) {
    if (!this.websocketServer) {
      return false;
    }

    try {
      this.websocketServer.broadcast(payload);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem para WebSocket:', error.message);
      return false;
    }
  }

  send(payload, transports = { rabbitmq: true, websocket: true }) {
    const sent = {
      rabbitmq: false,
      websocket: false
    };

    if (transports.rabbitmq) {
      sent.rabbitmq = this.sendToRabbitMQ(payload);
    }

    if (transports.websocket) {
      sent.websocket = this.sendToWebSocket(payload);
    }

    return sent;
  }

  getStatus() {
    return {
      rabbitmq: {
        url: this.rabbitmqUrl,
        queue: this.queueName,
        connected: !!this.channel,
        retryCount: this.retryCount
      },
      websocket: {
        enabled: this.enableWebSocket,
        connected: !!this.websocketServer,
        port: this.websocketPort,
        clients: this.websocketServer ? this.websocketServer.getClientCount() : 0
      }
    };
  }

  async close() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    if (this.channel) {
      try {
        await this.channel.close();
      } catch (_) {}
      this.channel = null;
    }

    if (this.connection) {
      try {
        await this.connection.close();
      } catch (_) {}
      this.connection = null;
    }

    if (this.websocketServer) {
      try {
        await this.websocketServer.close();
      } catch (_) {}
      this.websocketServer = null;
    }
  }
}

export default SpamTransportRepository;