import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';

class spamChatBot_WebSocketServer {
  // singleton instance
  static instance = null;

  /**
   * Start the singleton WebSocket server.
   * Usage: await spamChatBot_WebSocketServer.start({ port: 8081, pingInterval: 10000 })
   */
  static async start(conf = {}) {
    if (!spamChatBot_WebSocketServer.instance) {
      spamChatBot_WebSocketServer.instance = new spamChatBot_WebSocketServer(conf);
      await spamChatBot_WebSocketServer.instance._ignite(conf.port);
    }
    return spamChatBot_WebSocketServer.instance;
  }

  static getInstance() {
    return spamChatBot_WebSocketServer.instance;
  }

  constructor(conf = {}) {
    this.port = conf.port || 8081;
    this.pingInterval = conf.pingInterval || 2000; // default 5 seconds
    this.wss = null;
    this.clients = new Set(); // set of ws
    this.globalPing = null;
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

    if (!this.globalPing) {
      this.globalPing = setInterval(() => {
        for (const client of this.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }
      }, this.pingInterval);
    }

    ws.on('message', (message) => {
      // broadcast incoming message to all connected clients
      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          try { client.send(message); } catch (_) {}
        }
      }
    });

    const cleanup = () => {
      this.clients.delete(ws);

      if (this.clients.size === 0 && this.globalPing) {
        clearInterval(this.globalPing);
        this.globalPing = null;
      }
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);
  }

  async close() {
    if (!this.wss) return;
    if (this.globalPing) {
      clearInterval(this.globalPing);
      this.globalPing = null;
    }
    for (const client of this.clients) {
      try { client.close(); } catch (_) {}
    }
    this.clients.clear();
    return new Promise((resolve) => {
      this.wss.close(() => {
        this.wss = null;
        spamChatBot_WebSocketServer.instance = null;
        resolve();
      });
    });
  }

  broadcast(payload) {
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (_) {}
      }
    }
  }

  getClientCount() {
    return this.clients.size;
  }
}

export default spamChatBot_WebSocketServer;
