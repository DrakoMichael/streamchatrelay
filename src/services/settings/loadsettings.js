import backup_config from "./config_backup.js";
import config from "../../config.json" with { type: "json" };

/**
 * @module src.services.settings.loadSettings
 */

export default async function loadSettings() {
  if (!config || !config.type_ambience) {
    console.log("Invalid config, using backup.");
    return backup_config;
  }
  return config;
}
