import websocket_starter from "./websocket_starter.js";
import WsFunctions from "./ws_functions.js";

/**
 * @author Michael Mello 
 * @module src.services.webSocket.websocket_bootstrap
*/

/**
 * @typedef {class} websocket_bootstrap
 * @property {config} config - Configuração global da aplicação
 * @returns {WsFunctions|null} Instância de WsFunctions ou null em caso de falha
 * @property {function} init - Inicializa o WebSocket com a configuração fornecida
 * @property {function} getInstance - Retorna a instância atual de WsFunctions
 * @property {function} ignite_test - Método de teste para verificar a funcionalidade do bootstrap
 * @property {static websocket_bootstrap} instance - Instância singleton da classe websocket_bootstrap
**/


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

  static async ignite_test() {
    if (this.getInstance()) return console.log("WebSocket Bootstrap is operational.");
  }

};

export default websocket_bootstrap;