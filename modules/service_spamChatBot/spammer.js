import quotes from "./fakeMessageData.js";
import spamChatBot_WebSocketServer from "./spamChatBot_WebSocketServer.js";

let loopIntervalId = null;

class Spammer {
  constructor(config = {}) {
    this.config = config;
    this.bot = null;
  }

  async start(config = this.config, mode) {
    this.config = config || this.config;
    if (!this.config || !this.config.dev_config || !this.config.dev_config.enable_spam) return;

    if (mode === "test") return this.testLiveChatSpam();

    // ensure bot is running (start if not)
    let bot = spamChatBot_WebSocketServer.getInstance();
    if (!bot) {
      bot = await spamChatBot_WebSocketServer.start({ port: this.config.spam_port || 8081, pingInterval: this.config.pingInterval });
    }
    this.bot = bot;

    this.startSpamLoop(this.config);
  }

  stop() {
    if (loopIntervalId) {
      clearTimeout(loopIntervalId);
      loopIntervalId = null;
    }
  }

  generateRandomMessage() {
    const indice = Math.floor(Math.random() * quotes.nome.length);

    return {
      plataforma: quotes.plataforms[Math.floor(Math.random() * quotes.plataforms.length)],
      usuario: quotes.nome[indice],
      mensagem: quotes.frases[indice]
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

      // send via spamChatBot if available
      if (this.bot && this.bot.clients) {
        for (const client of this.bot.clients) {
          if (client.readyState === 1) {
            try { client.send(formattedMessage); } catch (_) {}
          }
        }
      } else {
        // fallback to existing websocket bootstrap if present
        const wsFunctions = websocket_bootstrap.getInstance();
        if (wsFunctions && typeof wsFunctions.sendNewChat === 'function') {
          try { wsFunctions.sendNewChat(formattedMessage); } catch (_) {}
        }
      }

      const nextTime = this.generateRandomTime(minMs, maxMs);
      loopIntervalId = setTimeout(loop, nextTime);
    };

    loop();
  }

  generateRandomTime(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  testLiveChatSpam() {
    const messagesGenerated = [];

    async function mockSendNewChat() {
      setTimeout(() => messagesGenerated.push("teste"), 100)
    }

    mockSendNewChat();

    return {
      messages: messagesGenerated,
      stop: () => this.stop()
    };
  }
}

export default Spammer;