import config_backup from "./config_backup.json" with { type: "json" };
import liveChatSpam from "../spamGenerator/liveChatSpam.js"
import startUtilities from "./startUtilities.js";
import express_bootstrap from "../webManager/express_bootstrap.js";
import TwitchConnectionWS from "../externalConnections/twitch/connectionWS.js";
import sqlite3_bootstrap from "../dataBase/sqlite3_bootstrap.js";
import sqlite3_bootstrap_memory from "../dataBase/sqlite3_bootstrap_memory.js";

//pick up config from main folder
import config from "../../config.json" with { type: "json" };

/**
 * @module src.services.etc.loadSettings
 */

export default async function loadSettings() {
  if (!config || !config.type_ambience || Object.keys(config).length === 0 ) {
    console.log("Config is missing or invalid. Loading backup configuration.");
    return config_backup;
  }
  if(config.type_ambience === "dev") {
    console.log("Development ambience detected. Applying development settings.");
    liveChatSpam();
    startUtilities(config);
  }
  if(config.use_webserver){
    await express_bootstrap(config);
  }
  if(config.debbug){ // use in specific cases for debbuging twitch WS or like this
    const twitchWS = new TwitchConnectionWS();
    twitchWS.connect();
  }
  if(config.database.enable_database){
    if(config.database.enable_in_disk_db){
      sqlite3_bootstrap();
    }
    if(config.database.enable_in_memory_db){
      await sqlite3_bootstrap_memory();
    }
  }

  return config;
}   