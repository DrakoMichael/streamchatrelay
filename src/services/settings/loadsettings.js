import backup_config from "./config_backup.js";
import logManager from "../app/logManager.js";

/**
 * @author Michael Mello
 * @module src.services.settings.loadSettings
 * @description 
 * load the configuration file (config.json) or use backup if not found
 */
async function loadSettings() {
  try {
    const configModule = await pickJsonConfig();
    return configModule.default;
  } catch (error) {
    logManager.warn("Config file not found, using backup.");
    logManager.error(error)
    return backup_config;
  }
}

async function pickJsonConfig() {
  const jsonPath = await import("../../config.json", {
      with: { type: "json" }
    });
  return jsonPath;
}

export default loadSettings;
