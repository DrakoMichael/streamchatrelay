import config_backup from "../etc/config_backup.json";
import config from "../../config.json" with { type: "json" };

export default function loadConfig() {
  if (!config || !config.type_ambience) {
    console.log("Invalid config, using backup.");
    return config_backup;
  }
  return config;
}
