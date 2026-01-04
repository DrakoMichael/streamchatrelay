import { WebSocketServer } from "ws";

export default function websocket_starter(config) {
    try {
        let port = config.websocket_port;
        if(config.type_ambience === "dev"){
            port === config.dev_config.dev_websocket_port;
        }
        const wss = new WebSocketServer({port: port});
        return wss;
    } catch (error) {
        return error;
    }
};