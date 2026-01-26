import websocket_bootstrap from '../webSocket/websocket_bootstrap.js';
import TwitchConnectionWS from '../externalConnections/twitch/connectionWS.js';

class debugBootstrap {
    /**
     * Initializes debug mode connections
     * - Tests WebSocket bootstrap
     * - Initializes Twitch EventSub WebSocket connection if enabled
     * 
     * @param {Object} config - Application configuration
     */
    static async init(config) {
        console.log("Debug Bootstrap initialized."); 
        await websocket_bootstrap.ignite_test();

        // Initialize Twitch connection if enabled
        if (config.twitch?.enable_twitch_connection) {
            console.log('[Debug Bootstrap] Initializing Twitch EventSub connection...');
            const twitchConnection = new TwitchConnectionWS(undefined, config);
            twitchConnection.connect();
            
            // Store connection instance for later use
            this.twitchConnection = twitchConnection;
        } else {
            console.log('[Debug Bootstrap] Twitch connection disabled in config');
        }
    }

    /**
     * Gets the active Twitch connection instance
     * @returns {TwitchConnectionWS|null}
     */
    static getTwitchConnection() {
        return this.twitchConnection || null;
    }
}

export default debugBootstrap;