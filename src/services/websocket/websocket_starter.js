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
        let port = config.websocket_port;

        if(config.type_ambience === "dev"){
            port = config.dev_config.dev_websocket_port;
        }

        const wss = new WebSocketServer({port: port});
        
        return wss;

    } catch (error) {
        console.error("Erro ao iniciar WebSocket Server:", error);
        throw error;
    }

};