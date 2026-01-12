import config_backup from "./config_backup.json" with { type: "json" };
import liveChatSpam from "../spamGenerator/liveChatSpam.js"

export default function loadSettings(config) {
  if (!config || !config.type_ambience || Object.keys(config).length === 0 ) {
    console.log("Config is missing or invalid. Loading backup configuration.");
    return config_backup;
  }
  if(config.type_ambience === "dev") {
    console.log("Development ambience detected. Applying development settings.");
    liveChatSpam();
  }

  return config;
}   