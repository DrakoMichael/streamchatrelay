/**
 * @module src.services.externalConnections.connectionHUB
 */

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
                console.log(`[ConnectionHUB] Unknown service: ${params}`);
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
                console.log('[ConnectionHUB] ✓ Twitch WebSocket connected');
                break;
            
            case 'authenticated':
                console.log(`[ConnectionHUB] ✓ Twitch OAuth2 authenticated - Session: ${sessionId}`);
                if (message) console.log(`[ConnectionHUB] ${message}`);
                break;
            
            case 'notification':
                console.log(`[ConnectionHUB] → Twitch notification: ${subscriptionType}`);
                if (event) {
                    console.log('[ConnectionHUB] Event data:', JSON.stringify(event, null, 2));
                }
                break;
            
            case 'revocation':
                console.log(`[ConnectionHUB] ⚠ Twitch subscription revoked: ${subscriptionType}`);
                break;
            
            case 'error':
                console.error(`[ConnectionHUB] ✗ Twitch error: ${message || 'Unknown error'}`);
                break;
            
            case 'disconnected':
                console.log(`[ConnectionHUB] ✗ Twitch disconnected: ${message || 'Connection closed'}`);
                break;
            
            default:
                console.log(`[ConnectionHUB] Twitch connection: ${status}`, data);
        }
    }
};