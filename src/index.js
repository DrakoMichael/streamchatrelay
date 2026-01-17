/**  
 * @file index.js
 * @description streamchatrelay application main bootstrap file
 * @author Michael Mello - drakomichael in github
 * @since 2025-12-20
 * @version 1.0.1
 **/

// WebSocket modules import - webSocket server for real time data
import websocket_bootstrap from "./services/webSocket/websocket_bootstrap.js";
// Config import
import loadSettings from "./services/settings/loadsettings.js";
// bootstrap app import - LOAD MODULES
import bootstrapApp from "./services/app/bootstrapApp.js";

/**
 * @example_args_use
 * if(process.argv && process.argv.includes('--debug')){
 *  console.log("Debug mode enabled");
 * }
 **/

class main{
    async bootstrap(){
        const settings = await loadSettings(); 
        await bootstrapApp(settings);
    };   
};
const app = new main()
;app.bootstrap();