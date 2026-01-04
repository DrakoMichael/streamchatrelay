import websocket_bootstrap from "./services/websocket/websocket_bootstrap.js";
import config from "./config.json" with { type: "json" };
import express_bootstrap from "./services/webmanager/express_bootstrap.js";
import liveChatSpam from "./services/spamGenerator/liveChatSpam.js"


class main{
    async bootstrap(){
        
        if(config.type_ambience === "dev") {
            liveChatSpam();
        }

        // await loadSettings();
        await websocket_bootstrap(config);
        await express_bootstrap(config);
        // await startWebhook();
        // await loadAlgumacoisa();
    };   
};
 
const app = new main()

;app.bootstrap();
