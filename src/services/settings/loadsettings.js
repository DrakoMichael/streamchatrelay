import backup_config from "./config_backup.js";

/**
 * @module src.services.settings.loadSettings
 */
export default async function loadSettings() {
  try {
    const configModule = await import("../../config.json", {
      assert: { type: "json" }
    });

    const config = configModule.default;

    if (!config || !config.type_ambience) {
      console.log("Invalid config, using backup.");
      return backup_config;
    }

    return config;
  } catch (error) {
    console.log("Config file not found, using backup.");
    return backup_config;
  }
}
