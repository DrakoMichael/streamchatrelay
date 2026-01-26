import webSocket from 'ws';
import connectionHUB from '../connectionHUB.js';

const twitchWebSocketURL = 'wss://eventsub.wss.twitch.tv/ws';

/**
 * @module src.services.externalConnections.twitch.connectionWS
 */

/**
 * TwitchConnectionWS - Handles WebSocket connection to Twitch EventSub
 * Implements OAuth2 handshake flow for Twitch's EventSub WebSocket API
 * 
 * @class TwitchConnectionWS
 * @property {string} url - WebSocket URL for Twitch EventSub
 * @property {WebSocket} ws - WebSocket instance
 * @property {string} sessionId - Session ID received from Twitch after welcome
 * @property {string} clientId - Twitch application client ID
 * @property {string} accessToken - OAuth2 access token
 * @property {number} reconnectAttempts - Counter for reconnection attempts
 * @property {number} maxReconnectAttempts - Maximum reconnection attempts allowed
 */
export default class TwitchConnectionWS {
    constructor(url = twitchWebSocketURL, config = {}) {
        this.url = url;
        this.ws = null;
        this.sessionId = null;
        this.clientId = config.twitch?.client_id || '';
        this.accessToken = config.twitch?.access_token || '';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.keepaliveTimeoutHandle = null;
        this.keepaliveTimeoutSeconds = 10; // Default keepalive timeout
        this.config = config;
    }

    /**
     * Establishes WebSocket connection to Twitch EventSub
     * Implements the OAuth2 handshake flow
     */
    connect() {
        if (!this.clientId || !this.accessToken) {
            console.error('[Twitch WS] Missing client_id or access_token in configuration');
            connectionHUB.redirectConnection('twitch', { 
                status: 'error', 
                message: 'Missing OAuth2 credentials' 
            });
            return;
        }

        console.log('[Twitch WS] Connecting to Twitch EventSub WebSocket...');
        this.ws = new webSocket(this.url);

        this.ws.on('open', () => {
            console.log('[Twitch WS] WebSocket connection established');
            connectionHUB.redirectConnection('twitch', { status: 'connected' });
        });

        this.ws.on('message', (data) => {
            this.handleMessage(data);
        });

        this.ws.on('error', (error) => {
            console.error('[Twitch WS] WebSocket error:', error.message);
            connectionHUB.redirectConnection('twitch', { 
                status: 'error', 
                message: error.message 
            });
        });

        this.ws.on('close', (code, reason) => {
            console.log(`[Twitch WS] Connection closed. Code: ${code}, Reason: ${reason}`);
            this.clearKeepaliveTimeout();
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                console.log(`[Twitch WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                setTimeout(() => this.connect(), delay);
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
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            const messageType = message.metadata?.message_type;

            console.log(`[Twitch WS] Received message type: ${messageType}`);

            switch (messageType) {
                case 'session_welcome':
                    this.handleWelcome(message);
                    break;
                case 'session_keepalive':
                    this.handleKeepalive(message);
                    break;
                case 'notification':
                    this.handleNotification(message);
                    break;
                case 'session_reconnect':
                    this.handleReconnect(message);
                    break;
                case 'revocation':
                    this.handleRevocation(message);
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
     */
    handleWelcome(message) {
        this.sessionId = message.payload?.session?.id;
        const keepaliveTimeoutSeconds = message.payload?.session?.keepalive_timeout_seconds;

        console.log(`[Twitch WS] Welcome received. Session ID: ${this.sessionId}`);
        console.log(`[Twitch WS] Keepalive timeout: ${keepaliveTimeoutSeconds}s`);

        // Reset reconnection counter on successful welcome
        this.reconnectAttempts = 0;

        // Store and setup keepalive timeout monitoring
        if (keepaliveTimeoutSeconds) {
            this.keepaliveTimeoutSeconds = keepaliveTimeoutSeconds;
            this.setupKeepaliveTimeout(keepaliveTimeoutSeconds);
        }

        // Notify that OAuth2 handshake is complete
        connectionHUB.redirectConnection('twitch', { 
            status: 'authenticated', 
            sessionId: this.sessionId,
            message: 'OAuth2 handshake completed successfully'
        });
    }

    /**
     * Handles keepalive messages to maintain connection
     * 
     * @param {Object} message - Keepalive message
     */
    handleKeepalive(message) {
        console.log('[Twitch WS] Keepalive received');
        
        // Reset the keepalive timeout using the same timeout value
        // The timeout was already set in the welcome message
        if (this.keepaliveTimeoutHandle) {
            this.clearKeepaliveTimeout();
            // Use the stored timeout from welcome message, default to 10 if not set
            const timeoutSeconds = this.keepaliveTimeoutSeconds || 10;
            this.setupKeepaliveTimeout(timeoutSeconds);
        }
    }

    /**
     * Handles notification messages (events from subscriptions)
     * 
     * @param {Object} message - Notification message with event data
     */
    handleNotification(message) {
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
     */
    handleReconnect(message) {
        const reconnectUrl = message.payload?.session?.reconnect_url;
        
        console.log(`[Twitch WS] Reconnect requested to: ${reconnectUrl}`);
        
        if (reconnectUrl) {
            // Close current connection
            this.ws.close();
            // Connect to new URL
            this.url = reconnectUrl;
            this.connect();
        }
    }

    /**
     * Handles revocation messages - subscription was revoked
     * 
     * @param {Object} message - Revocation message
     */
    handleRevocation(message) {
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
     */
    setupKeepaliveTimeout(timeoutSeconds) {
        this.clearKeepaliveTimeout();
        
        // Add a buffer of a few seconds to the timeout
        const timeoutMs = (timeoutSeconds + 5) * 1000;
        
        this.keepaliveTimeoutHandle = setTimeout(() => {
            console.warn('[Twitch WS] Keepalive timeout - connection may be dead');
            this.ws.close();
        }, timeoutMs);
    }

    /**
     * Clears the keepalive timeout
     */
    clearKeepaliveTimeout() {
        if (this.keepaliveTimeoutHandle) {
            clearTimeout(this.keepaliveTimeoutHandle);
            this.keepaliveTimeoutHandle = null;
        }
    }

    /**
     * Disconnects from Twitch EventSub WebSocket
     */
    disconnect() {
        console.log('[Twitch WS] Disconnecting...');
        this.clearKeepaliveTimeout();
        this.maxReconnectAttempts = 0; // Prevent reconnection
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * Gets the current session ID
     * @returns {string|null} Session ID or null if not connected
     */
    getSessionId() {
        return this.sessionId;
    }
  };