/**
 * @typedef {Object} TwitchConnectionWS
 * @property {string} url - WebSocket URL for the Twitch connection
 * @property {WebSocket} ws - WebSocket connection for the Twitch connection
 **/

import webSocket from "ws";
import connectionHUB from "../connectionHUB.js";

const twitchWebSocketURL = "wss://eventsub.wss.twitch.tv/ws";

export default class TwitchConnectionWS {
  constructor(url = twitchWebSocketURL) {
    this.url = url;
    this.ws = new webSocket(this.url);
  }

  connect() {
    this.ws = new webSocket(this.url);
    this.ws.on("open", () => {
      connectionHUB.redirectConnection("twitch", { status: "connected" });
    });
    this.ws.on("close", () => {
      connectionHUB.redirectConnection("twitch", {
        status: "disconnected {timeouted}",
      });
    });
  }
}
