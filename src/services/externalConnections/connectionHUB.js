/**
 * @module src.services.externalConnections.connectionHUB
 */

import logManager from "../app/logManager.js";

export default class connectionHUB {    
    constructor() {
        this.connections = {};
    }

    /**
     * Redirects and handles connection events from external services
     * 
     * @param {string} params - Service name (e.g., 'twitch')
     * @param {Object} data - Event data
     * @param {string} data.status - Connection status
     * @param {string} [data.message] - Optional message
     * @param {string} [data.sessionId] - Session ID for authenticated connections
     * @param {string} [data.subscriptionType] - Type of subscription for notifications
     * @param {Object} [data.event] - Event data for notifications
     */
    static redirectConnection(params, data) {
        switch (params) {
            case 'twitch':
                this.handleTwitchConnection(data);
                break;
            default:
                logManager.error(`[ConnectionHUB] Unknown service: ${params}`);
        }
    }

    /**
     * Handles Twitch connection events
     * 
     * @param {Object} data - Event data from Twitch connection
     */
    static handleTwitchConnection(data) {
        const { status, message, sessionId, subscriptionType, event } = data;

        switch (status) {
            case 'connected':
                logManager.info('[ConnectionHUB] ✓ Twitch WebSocket connected');
                break;
            
            case 'authenticated':
                logManager.info(`[ConnectionHUB] ✓ Twitch OAuth2 authenticated - Session: ${sessionId}`);
                if (message) logManager.info(`[ConnectionHUB] ${message}`);
                break;
            
            case 'notification':
                logManager.info(`[ConnectionHUB] → Twitch notification: ${subscriptionType}`);
                if (event) {
                    logManager.info(`[ConnectionHUB] Event data: ${JSON.stringify(event, null, 2)}`);
                }
                break;
            
            case 'revocation':
                logManager.warn(`[ConnectionHUB] ⚠ Twitch subscription revoked: ${subscriptionType}`);
                break;
            
            case 'error':
                logManager.error(`[ConnectionHUB] ✗ Twitch error: ${message || 'Unknown error'}`);
                break;
            
            case 'disconnected':
                logManager.warn(`[ConnectionHUB] ✗ Twitch disconnected: ${message || 'Connection closed'}`);
                break;
            
            default:
                logManager.info(`[ConnectionHUB] Twitch connection: ${status}`, data);
        }
    }
};