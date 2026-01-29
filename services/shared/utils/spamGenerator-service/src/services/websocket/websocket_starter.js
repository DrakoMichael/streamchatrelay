import { WebSocketServer } from "ws";

/**
* @module src.services.webSocket.websocket_starter
*/

/** 
 * @typedef {Function} websocket_starter
 * @property {Object} config - Configuração global da aplicação
 * @returns {WebSocketServer|Error} Instância do WebSocketServer ou Error em caso de falha
**/ 

export default function websocket_starter(config) {

    try {
        const wss = new WebSocketServer({port: 3004});
        
        return wss;
    } catch (error) {
        console.error("Erro ao iniciar WebSocket Server:", error);
        throw error;
    }

};