import config from "../../config.json" with { type: "json" };
import WebSocket from "ws";

export default class WsFunctions {
  constructor(wss) {
    this.wss = wss;
    this.register();
  }

  register() {
    this.wss.on("connection", (ws) => this.onConnection(ws));
  }

  onConnection(ws) {
    if(config.dev_config.connected_chat_notify === true) {
      console.log("Cliente conectado");
      ws.send("conectado");
    }
    
    ws.on("message", (msg) => this.onMessage(ws, msg));
    ws.on("close", () => this.onClose(ws));
  }

  onMessage(_ws, msg) {
    const text = msg.toString();
    console.log("Mensagem:", text);

    // broadcast da mensagem recebida
    this.sendNewChat(text);
  }

  onClose(ws) {
    if(config.dev_config.connected_chat_notify === true) {
      console.log("Cliente desconectado");
    }
  }

  sendNewChat(text) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  }

}

