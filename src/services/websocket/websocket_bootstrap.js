import websocket_starter from "./websocket_starter.js";
import WsFunctions from "./ws_functions.js";

let wsFunctionsInstance = null;

/**
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

class websocket_bootstrap {
  static instance;

  constructor(config) {
    if (websocket_bootstrap.instance) return websocket_bootstrap.instance;
    websocket_bootstrap.instance = this;
  };

  static init(config) {
    if (wsFunctionsInstance) return wsFunctionsInstance;

    let wss;

    try {
      wss = websocket_starter(config);
    } catch (error) {
      console.error("WebSocket starter failed", error);
      return null;
    }

    if (!wss) return null;

    wsFunctionsInstance = new WsFunctions(wss);
    return wsFunctionsInstance;
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