import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import backupConfig from './config_backup.js';
import logManager from '../app/logManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG_PATH = path.join(__dirname, '../../config.json');

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function mergeConfig(baseConfig, overrideConfig) {
  if (Array.isArray(baseConfig) || Array.isArray(overrideConfig)) {
    return cloneConfig(overrideConfig ?? baseConfig);
  }

  if (baseConfig && typeof baseConfig === 'object' && overrideConfig && typeof overrideConfig === 'object') {
    const result = { ...baseConfig };

    for (const [key, value] of Object.entries(overrideConfig)) {
      result[key] = key in baseConfig ? mergeConfig(baseConfig[key], value) : value;
    }

    return result;
  }

  return overrideConfig ?? baseConfig;
}

function validateConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Configuração inválida: esperado um objeto JSON.');
  }

  const requiredFields = ['type_ambience', 'use_webserver', 'use_websocket'];
  for (const field of requiredFields) {
    if (!(field in config)) {
      throw new Error(`Configuração inválida: campo obrigatório ausente (${field}).`);
    }
  }

  if (config.type_ambience === 'dev' && !config.dev_config) {
    throw new Error('Configuração inválida: dev_config é obrigatório no modo dev.');
  }
}

async function readConfigFile() {
  const rawConfig = await fs.readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(rawConfig);
}

export async function loadConfig() {
  try {
    const fileConfig = await readConfigFile();
    const mergedConfig = mergeConfig(backupConfig, fileConfig);
    validateConfig(mergedConfig);
    return mergedConfig;
  } catch (error) {
    logManager.warn('Config file not found or invalid, using backup.');
    logManager.error(error);

    const fallbackConfig = cloneConfig(backupConfig);
    validateConfig(fallbackConfig);
    return fallbackConfig;
  }
}

export async function saveConfig(config) {
  const normalizedConfig = mergeConfig(backupConfig, config);
  validateConfig(normalizedConfig);

  await fs.writeFile(CONFIG_PATH, `${JSON.stringify(normalizedConfig, null, 2)}\n`, 'utf-8');

  return normalizedConfig;
}

export function getExpressPort(config) {
  return config.type_ambience === 'dev' ? config.dev_config.dev_express_port : config.express_port;
}