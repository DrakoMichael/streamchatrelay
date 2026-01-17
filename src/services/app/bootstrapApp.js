/**
 * @file bootstrapApp.js
 * @description This is doc of STREAMCHATRELAY.
 *
 * @author Michael Mello
 * @see https://github.com/drakomichael
 */
import liveChatSpam from "../spamGenerator/liveChatSpam.js";
import express_bootstrap from "../webManager/express_bootstrap.js";
import TwitchConnectionWS from "../externalConnections/twitch/connectionWS.js";
import sqlite3_bootstrap from "../dataBase/sqlite3_bootstrap.js";
import sqlite3_bootstrap_memory from "../dataBase/sqlite3_bootstrap_memory.js";
import websocket_bootstrap from "../webSocket/websocket_bootstrap.js";

export default async function bootstrapApp(config) {
  if (config.type_ambience === "dev") {
    if(config.dev_config.enable_spam){
      liveChatSpam();
    }
  }

  if(config.use_websocket){
    websocket_bootstrap(config);
  }

  if (config.use_webserver) {
    await express_bootstrap(config);
  }

  if (config.debbug) {
    const twitchWS = new TwitchConnectionWS();
    twitchWS.connect();
  }

  if (config.database?.enable_database) {
    if (config.database.enable_in_disk_db) {
      await sqlite3_bootstrap();
    }
    if (config.database.enable_in_memory_db) {
      await sqlite3_bootstrap_memory();
    }
  }

  /**
  * @todo Add dataControl init
  **/

}
