import webSocket from 'ws';
import connectionHUB from '../connectionHUB.js';

const twitchWebSocketURL = 'wss://eventsub.wss.twitch.tv/ws';

export default class TwitchConnectionWS {
    constructor(url = twitchWebSocketURL) {
        this.url = url;
        this.ws = new webSocket(this.url);
    }

    connect() {
        this.ws = new webSocket(this.url);
        this.ws.on('open', () => {
            connectionHUB.redirectConnection('twitch', { status: 'connected' });
        }
        );
    }
  };