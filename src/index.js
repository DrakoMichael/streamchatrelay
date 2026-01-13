import websocket_bootstrap from "./services/webSocket/websocket_bootstrap.js";
import config from "./config.json" with { type: "json" };
import express_bootstrap from "./services/webManager/express_bootstrap.js";
import startUtilities from "./services/etc/startUtilities.js";
import loadSettings from "./services/etc/loadsettings.js";
import TwitchConnectionWS from "./services/externalConnections/twitch/connectionWS.js";


class main{
    async bootstrap(){
        const settings = loadSettings(config); // try load conf, invalid -> load backup
        await websocket_bootstrap(settings);

        if(config.use_webserver){
            await express_bootstrap(settings);
        }

        if(config.debbug){ // use in specific cases for debbuging twitch WS or like this
            const twitchWS = new TwitchConnectionWS();
            twitchWS.connect();
        }

        //startUtilities(settings); // Call utils in etc if in dev mode
    };   
};
 
const app = new main()

;app.bootstrap();
// this ; it's a semicolon to prevent possible ASI issues - idk just my mania