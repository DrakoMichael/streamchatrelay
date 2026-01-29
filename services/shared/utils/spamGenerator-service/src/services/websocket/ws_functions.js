import { WebSocket } from "ws";

/**
 * @author Michael Mello
 * @module src.services.webSocket.ws_functions
 */
export default class WsFunctions {
  constructor(wss, config) {
    this.wss = wss;
    this.config = config;
    this.register();
  }

  register() {
    this.wss.on("connection", (ws) => this.onConnection(ws));
  }

  onConnection(ws) {
    if (this.config.dev_config.connected_chat_notify) {
      console.log("Cliente conectado");
      ws.send("conectado");
    }

    ws.on("message", (msg) => this.onMessage(ws, msg));
    ws.on("close", () => this.onClose(ws));
  }

  onClose() {
    if (this.config.dev_config.connected_chat_notify) {
      console.log("Cliente desconectado");
    }
  }

  broadcast(payload) {
    let sentCount = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
        sentCount++;
      }
    });
    
    if (this.config.dev_config?.print_spam_chats) {
      console.log(`[WEBSOCKET] Broadcast sent to ${sentCount} client(s)`);
    }
  }

  run(type, payload) {
    switch (type) {
      case "broadcast":
        this.broadcast(payload);
        return true;

      default:
        return false;
    }
  }
}
