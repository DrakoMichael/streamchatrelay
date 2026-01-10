import websocket_bootstrap from "./services/websocket/websocket_bootstrap.js";
import config from "./config.json" with { type: "json" };
import express_bootstrap from "./services/webmanager/express_bootstrap.js";
import startUtilities from "./services/etc/startUtilities.js";
import loadSettings from "./services/etc/loadsettings.js";


class main{
    async bootstrap(){
        const settings = loadSettings(config); // try load conf, invalid -> load backup
        await websocket_bootstrap(settings);
        await express_bootstrap(settings);
        startUtilities(settings); // Call ChatSpam if in dev mode
    };   
};
 
const app = new main()

;app.bootstrap();
// this ; it's a semicolon to prevent possible ASI issues - idk just my mania