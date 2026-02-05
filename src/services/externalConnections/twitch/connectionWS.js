import webSocket from 'ws';
import connectionHUB from '../connectionHUB.js';
import connectionRules from './connectionRules.js';

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
        connectionRules.setupEventHandlers(this.ws, this);
    }

    /**
     * Disconnects from Twitch EventSub WebSocket
     */
    disconnect() {
        console.log('[Twitch WS] Disconnecting...');
        connectionRules.clearKeepaliveTimeout(this);
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