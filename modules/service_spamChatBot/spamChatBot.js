import { WebSocketServer } from 'ws';
import Spammer from './spammer.js';

class spamChatBot {
  // singleton instance
  static instance = null;

  /**
   * Start the singleton WebSocket server.
   * Usage: await spamChatBot.start({ port: 8081, pingInterval: 10000 })
   */
  static async start(conf = {}) {
    if (!spamChatBot.instance) {
      spamChatBot.instance = new spamChatBot(conf);
      await spamChatBot.instance._ignite(conf.port);
    }
    return spamChatBot.instance;
  }

  static getInstance() {
    return spamChatBot.instance;
  }

  constructor(conf = {}) {
    this.port = conf.port || 8081;
    this.pingInterval = conf.pingInterval || 2000; // default 5 seconds
    this.wss = null;
    this.clients = new Set(); // set of ws
    this.pingTimers = new WeakMap(); // ws -> interval id
  }

  async _ignite(port = this.port) {
    if (this.wss) return this.port;

    this.port = port;
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws) => {
      this._handleConnection(ws);
    });

    return new Promise((resolve, reject) => {
      this.wss.on('listening', () => resolve(this.port));
      this.wss.on('error', reject);
    });
  }

  _handleConnection(ws) {
    this.clients.add(ws);

    // start periodic ping for this connection
    this.globalPing = setInterval(() => {
    for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
    }
    }, this.pingInterval);

    ws.on('message', (message) => {
      // broadcast incoming message to all connected clients
      for (const client of this.clients) {
        if (client.readyState === ws.OPEN) {
          try { client.send(message); } catch (_) {}
        }
      }
    });

    const cleanup = () => {
      this.clients.delete(ws);
      const t = this.pingTimers.get(ws);
      if (t) {
        clearInterval(t);
        this.pingTimers.delete(ws);
      }
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);
  }

  async close() {
    if (!this.wss) return;
    for (const client of this.clients) {
      try { client.close(); } catch (_) {}
    }
    this.clients.clear();
    return new Promise((resolve) => {
      this.wss.close(() => {
        this.wss = null;
        spamChatBot.instance = null;
        resolve();
      });
    });
  }
}

export default spamChatBot;
