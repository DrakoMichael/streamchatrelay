import websocket_starter from "./websocket_starter.js";
import WsFunctions from "./ws_functions.js";

let wsFunctionsInstance = null;

class websocket_bootstrap {
  static instance;

  constructor(config) {
    this.config = config;
  };

  static init(config) {
    if (wsFunctionsInstance) {
      console.log("[WEBSOCKET] WebSocket já inicializado, retornando instância existente");
      return wsFunctionsInstance;
    }

    try {
      console.log("[WEBSOCKET] Iniciando WebSocket server...");
      const wss = websocket_starter(config);

      //WsFunctions IS INJECTED HERE VVVV
      wsFunctionsInstance = new WsFunctions(wss, config);
      
      console.log("[WEBSOCKET] ✓ WebSocket inicializado com sucesso");
      return wsFunctionsInstance;
    } catch (error) {
      console.error("[WEBSOCKET] ✗ Falha ao inicializar WebSocket:", error);
      return null;
    }
  }

  static getInstance() {
    if (!wsFunctionsInstance) return null;
    return wsFunctionsInstance;
  }

};

export default websocket_bootstrap;