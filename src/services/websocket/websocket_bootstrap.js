import websocket_starter from "./websocket_starter.js";
import WsFunctions from "./ws_functions.js";

let wsFunctionsInstance = null;

/**
 * @module src.services.webSocket.websocket_bootstrap
 */

/**
 * @typedef {Function} websocket_bootstrap
 * @property {config} config - Configuração global da aplicação
 * @returns {WsFunctions|null} Instância de WsFunctions ou null em caso de falha
 **/ 

export default function websocket_bootstrap(config) {
  
  if (wsFunctionsInstance) {
    return wsFunctionsInstance;
  }

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
 