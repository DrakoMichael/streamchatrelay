/**
 * @author Michael Mello
 * @description Defines connection rules and event handling for Twitch EventSub WebSocket connections
 * @module src.services.externalConnections.twitch.connectionRules
 */

import connectionHUB from '../connectionHUB.js';

class connectionRules {

    /**
     * Sets up event handlers for WebSocket connection
     * @param {WebSocket} ws - WebSocket instance
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static setupEventHandlers(ws, instance) {
        ws.on('open', () => {
            console.log('[Twitch WS] WebSocket connection established');
            connectionHUB.redirectConnection('twitch', { status: 'connected' });
        });

        ws.on('message', (data) => {
            connectionRules.handleMessage(data, instance);
        });

        ws.on('error', (error) => {
            console.error('[Twitch WS] WebSocket error:', error.message);
            connectionHUB.redirectConnection('twitch', { 
                status: 'error', 
                message: error.message 
            });
        });

        ws.on('close', (code, reason) => {
            console.log(`[Twitch WS] Connection closed. Code: ${code}, Reason: ${reason}`);
            connectionRules.clearKeepaliveTimeout(instance);
            
            if (instance.reconnectAttempts < instance.maxReconnectAttempts) {
                instance.reconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, instance.reconnectAttempts), 30000);
                console.log(`[Twitch WS] Reconnecting in ${delay}ms (attempt ${instance.reconnectAttempts}/${instance.maxReconnectAttempts})...`);
                setTimeout(() => instance.connect(), delay);
            } else {
                console.error('[Twitch WS] Max reconnection attempts reached');
                connectionHUB.redirectConnection('twitch', { 
                    status: 'disconnected', 
                    message: 'Max reconnection attempts reached' 
                });
            }
        });
    }

    /**
     * Handles incoming WebSocket messages from Twitch
     * Implements EventSub message protocol
     * 
     * @param {Buffer|string} data - Raw message data
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static handleMessage(data, instance) {
        try {
            const message = JSON.parse(data.toString());
            const messageType = message.metadata?.message_type;

            console.log(`[Twitch WS] Received message type: ${messageType}`);

            switch (messageType) {
                case 'session_welcome':
                    connectionRules.handleWelcome(message, instance);
                    break;
                case 'session_keepalive':
                    connectionRules.handleKeepalive(message, instance);
                    break;
                case 'notification':
                    connectionRules.handleNotification(message, instance);
                    break;
                case 'session_reconnect':
                    connectionRules.handleReconnect(message, instance);
                    break;
                case 'revocation':
                    connectionRules.handleRevocation(message, instance);
                    break;
                default:
                    console.log(`[Twitch WS] Unknown message type: ${messageType}`);
            }
        } catch (error) {
            console.error('[Twitch WS] Error parsing message:', error.message);
        }
    }

    /**
     * Handles the welcome message containing session information
     * This is the first message received after connecting
     * 
     * @param {Object} message - Welcome message from Twitch
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static handleWelcome(message, instance) {
        instance.sessionId = message.payload?.session?.id;
        const keepaliveTimeoutSeconds = message.payload?.session?.keepalive_timeout_seconds;

        console.log(`[Twitch WS] Welcome received. Session ID: ${instance.sessionId}`);
        console.log(`[Twitch WS] Keepalive timeout: ${keepaliveTimeoutSeconds}s`);

        // Reset reconnection counter on successful welcome
        instance.reconnectAttempts = 0;

        // Store and setup keepalive timeout monitoring
        if (keepaliveTimeoutSeconds) {
            instance.keepaliveTimeoutSeconds = keepaliveTimeoutSeconds;
            connectionRules.setupKeepaliveTimeout(keepaliveTimeoutSeconds, instance);
        }

        // Notify that OAuth2 handshake is complete
        connectionHUB.redirectConnection('twitch', { 
            status: 'authenticated', 
            sessionId: instance.sessionId,
            message: 'OAuth2 handshake completed successfully'
        });
    }

    /**
     * Handles keepalive messages to maintain connection
     * 
     * @param {Object} _message - Keepalive message (unused)
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static handleKeepalive(_message, instance) {
        console.log('[Twitch WS] Keepalive received');
        
        // Reset the keepalive timeout using the same timeout value
        // The timeout was already set in the welcome message
        if (instance.keepaliveTimeoutHandle) {
            connectionRules.clearKeepaliveTimeout(instance);
            // Use the stored timeout from welcome message, default to 10 if not set
            const timeoutSeconds = instance.keepaliveTimeoutSeconds || 10;
            connectionRules.setupKeepaliveTimeout(timeoutSeconds, instance);
        }
    }

    /**
     * Handles notification messages (events from subscriptions)
     * 
     * @param {Object} message - Notification message with event data
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static handleNotification(message, instance) {
        const subscriptionType = message.payload?.subscription?.type;
        const event = message.payload?.event;

        console.log(`[Twitch WS] Notification received: ${subscriptionType}`);
        
        // Forward the event to connectionHUB for processing
        connectionHUB.redirectConnection('twitch', { 
            status: 'notification',
            subscriptionType,
            event
        });
    }

    /**
     * Handles reconnect messages - server wants us to reconnect
     * 
     * @param {Object} message - Reconnect message with new URL
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static handleReconnect(message, instance) {
        const reconnectUrl = message.payload?.session?.reconnect_url;
        
        console.log(`[Twitch WS] Reconnect requested to: ${reconnectUrl}`);
        
        if (reconnectUrl) {
            // Close current connection
            instance.ws.close();
            // Connect to new URL
            instance.url = reconnectUrl;
            instance.connect();
        }
    }

    /**
     * Handles revocation messages - subscription was revoked
     * 
     * @param {Object} message - Revocation message
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static handleRevocation(message, instance) {
        const subscriptionType = message.payload?.subscription?.type;
        console.log(`[Twitch WS] Subscription revoked: ${subscriptionType}`);
        
        connectionHUB.redirectConnection('twitch', { 
            status: 'revocation',
            subscriptionType
        });
    }

    /**
     * Sets up keepalive timeout monitoring
     * If no keepalive is received within the timeout period, connection may be dead
     * 
     * @param {number} timeoutSeconds - Timeout in seconds
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static setupKeepaliveTimeout(timeoutSeconds, instance) {
        connectionRules.clearKeepaliveTimeout(instance);
        
        // Add a buffer of a few seconds to the timeout
        const timeoutMs = (timeoutSeconds + 5) * 1000;
        
        instance.keepaliveTimeoutHandle = setTimeout(() => {
            console.warn('[Twitch WS] Keepalive timeout - connection may be dead');
            instance.ws.close();
        }, timeoutMs);
    }

    /**
     * Clears the keepalive timeout
     * @param {TwitchConnectionWS} instance - TwitchConnectionWS instance
     */
    static clearKeepaliveTimeout(instance) {
        if (instance.keepaliveTimeoutHandle) {
            clearTimeout(instance.keepaliveTimeoutHandle);
            instance.keepaliveTimeoutHandle = null;
        }
    }
}

export default connectionRules;