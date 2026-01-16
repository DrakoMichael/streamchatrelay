/** 
 * @description streamchatrelay application main bootstrap file
 * @author Michael Mello - drakomichael in github
 * @since 2025-12-20
 * @lastUpdate 2026-01-16
 * @version 1.0.0
 **/

/**
 * @main bootstrap file
 * Initializes web server, WebSocket connections, and database.
 * Loads configuration and settings and insert in modules.
 */

// Web server modules import - express server for API and web interface 
//import express_bootstrap from "./services/webManager/express_bootstrap.js";

// WebSocket modules import - webSocket server for real time data
import websocket_bootstrap from "./services/webSocket/websocket_bootstrap.js";

// Config import
//import config from "./config.json" with { type: "json" };
//import startUtilities from "./services/etc/startUtilities.js";
import loadSettings from "./services/etc/loadsettings.js";

// External connections import - twitch WS connection
import TwitchConnectionWS from "./services/externalConnections/twitch/connectionWS.js";

// Database import - sqlite3 bootstrap in memory
import sqlite3_bootstrap from "./services/dataBase/sqlite3_bootstrap.js";
import sqlite3_bootstrap_memory from "./services/dataBase/sqlite3_bootstrap_memory.js";


class main{
    async bootstrap(){

        // Load settings and check ambient type (prod/dev)
        const settings = await loadSettings(); // try, invalid -> load backup

        await websocket_bootstrap(settings);
        await sqlite3_bootstrap();
        await sqlite3_bootstrap_memory();
    };   
};
 
const app = new main()

;app.bootstrap();
// this ; to prevent possible ASI issues - idk just my mania 