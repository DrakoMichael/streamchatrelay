import fakeMessageData from "./fakeMessageData.js";

let loopIntervalId = null;

class Spammer {
  constructor(config = {}) {
    this.config = config;
    this.sendMessage = config.send_message || (() => {});
  }

  async start(config = this.config, mode) {
    this.config = config || this.config;
    if (!this.config || !this.config.dev_config || !this.config.dev_config.enable_spam) return;

    this.startSpamLoop(this.config);
  }

  stop() {
    if (loopIntervalId) {
      clearTimeout(loopIntervalId);
      loopIntervalId = null;
      console.log('Spam loop parado');
    }
  }

  generateRandomMessage() {
    const indice = Math.floor(Math.random() * fakeMessageData.nome.length);

    return {
      plataforma: fakeMessageData.plataforms[Math.floor(Math.random() * fakeMessageData.plataforms.length)],
      usuario: fakeMessageData.nome[indice],
      mensagem: fakeMessageData.frases[indice],
      timestamp: new Date().toISOString()
    };
  }

  formatMessage(messageData) {
    const { plataforma, usuario, mensagem } = messageData;
    return `[${plataforma}] ${usuario}: ${mensagem}`;
  }

  startSpamLoop(config, minMs = 0, maxMs = 500) {
    const shouldPrint = config.dev_config.print_spam_chats;

    const loop = () => {
      const messageData = this.generateRandomMessage();
      const formattedMessage = this.formatMessage(messageData);

      if (shouldPrint) console.log(formattedMessage);

      // Enviar para RabbitMQ
      this.sendMessage({
        formatted: formattedMessage,
        data: messageData
      });

      const nextTime = this.generateRandomTime(minMs, maxMs);
      loopIntervalId = setTimeout(loop, nextTime);
    };

    loop();
  }

  generateRandomTime(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }
}

export default Spammer;