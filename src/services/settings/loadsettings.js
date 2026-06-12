import { loadConfig } from './configStore.js';

/**
 * @author Michael Mello
 * @module src.services.settings.loadSettings
 * @description 
 * load the configuration file (config.json) or use backup if not found
 */
async function loadSettings() {
  return loadConfig();
}

export default loadSettings;
