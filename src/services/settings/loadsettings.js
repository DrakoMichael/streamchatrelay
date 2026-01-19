import config_backup from "./config_backup.json" with { type: "json" };;
import config from "../../config.json" with { type: "json" };

/**
 * @module src.services.settings.loadsettings
 */

export default function loadConfig() {
  if (!config || !config.type_ambience) {
    console.log("Invalid config, using backup.");
    return config_backup;
  }
  return config;
}
