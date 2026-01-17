import websocket_starter from "./websocket_starter.js";
import WsFunctions from "./ws_functions.js";

let wsFunctionsInstance = null;

export default function websocket_bootstrap(config) {
  if (wsFunctionsInstance) {
    return wsFunctionsInstance;
  }

  const wss = websocket_starter(config);

  if (!wss) {
    console.error("WebSocket starter failed");
    return null;
  }

  wsFunctionsInstance = new WsFunctions(wss);

  return wsFunctionsInstance;
}
 