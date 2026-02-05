/**
* @author Michael Mello
* @description Handles connection events from various external services
* @module src.services.externalConnections.connectionHUB
**/

import logManager from "../app/logManager.js";
import handleTwitchConnection from "./twitch/handleTwitchConnection.js";

export default class connectionHUB {    
    constructor() {
        this.connections = {};
    }

    /** 
    * @param {string} params - Service name (e.g., 'twitch')
    * @param {Object} data - Event data
    * @param {string} data.status - Connection status
    * @param {string} [data.message] - Optional message
    * @param {string} [data.sessionId] - Session ID for authenticated connections
    * @param {string} [data.subscriptionType] - Type of subscription for notifications
    * @param {Object} [data.event] - Event data for notifications
    **/
    static redirectConnection(params, data) {
        switch (params) {
            case 'twitch':
                handleTwitchConnection(data);
                break;
            default:
                logManager.error(`[ConnectionHUB] Unknown service: ${params}`);
        };
    };
};