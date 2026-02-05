/**
* Handles Twitch connection events
* 
* @param {Object} data - Event data from Twitch connection
*/

import logManager from "../../app/logManager.js";

export function handleTwitchConnection(data) {
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
    };

export default handleTwitchConnection;