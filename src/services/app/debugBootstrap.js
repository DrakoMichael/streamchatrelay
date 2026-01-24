import websocket_bootstrap from '../webSocket/websocket_bootstrap.js';''

class debugBootstrap {
    static async init() {
        console.log("Debug Bootstrap initialized."); 
        await websocket_bootstrap.ignite_test();
    }
}

export default debugBootstrap;