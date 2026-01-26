/**
 * @file bootstrapApp.js
 * @description
 * responsable for bootstrapping the main components of the
 * StreamChatRelay according to the provided configuration.
 *
 * This bootstrap can initialize:
 *  - WebSocket
 *  - HTTP Server (Express)
 *  - External Connections
 *  - Database (SQLite on disk/memory)
 *  - Spam Generator (in development mode)
 *
 * @author Michael Mello
 * @module src.app.bootstrapApp
 * @see https://github.com/drakomichael
 */

/** @Imports **/
import liveChatSpam from "../spamGenerator/liveChatSpam.js";
import express_bootstrap from "../webmanager/express_bootstrap.js";
import sqlite3_bootstrap from "../dataBase/sqlite3_bootstrap.js";
import sqlite3_bootstrap_memory from "../dataBase/sqlite3_bootstrap_memory.js";
import websocket_bootstrap from "../websocket/websocket_bootstrap.js";
import debugBootstrap from "./debugBootstrap.js";
import logManager from "./logManager.js";


/**
 *
 * @async
 * @function bootstrapApp
 *
 * @param {Object} config Global application configuration
 * @param {"dev"|"prod"} config.type_ambience Execution environment
 * @param {Object} [config.dev_config] Development-specific configurations
 * @param {boolean} [config.dev_config.enable_spam] Enables spam generator
 * @param {boolean} config.use_websocket Enables WebSocket server
 * @param {boolean} config.use_webserver Enables HTTP server (Express)
 * @param {boolean} config.debbug Enables debug connection with Twitch
 * @param {Object} [config.database] Database configuration
 * @param {boolean} [config.database.enable_database] Enables database
 * @param {boolean} [config.database.enable_in_disk_db] Uses SQLite on disk
 * @param {boolean} [config.database.enable_in_memory_db] Uses SQLite in memory
 *
 * @returns {Promise<void>} Does not return a value
 *
 * @throws {Error} Throws error if any service fails critically in initialization
 */


class bootstrapApp {

  static initializedModules = [];

  /**
   * @param {string} moduleName - Nome do módulo para logs
   * @param {Function} initFunction - Função de inicialização do módulo
   * @param {Object} config - Configuração da aplicação
   * @returns {Promise<boolean>} true se inicializou com sucesso
   */
  static async safeInit(moduleName, initFunction, config) {
    try {
      await initFunction(config);
      this.initializedModules.push(moduleName);
      return true;
    } catch (error) {
      logManager.error(`[BOOTSTRAP] ✗ Error initializing ${moduleName}: ${error.message}`, error);
    }
  }

  /**
   * Initializes all modules sequentially and validated
   * @param {Object} config - Global application configuration
   * @returns {Promise<void>}
   * @throws {Error} Throws error if any critical module fails
   */
  static async ignite(config) {
    logManager.info('\n[BOOTSTRAP] Starting StreamChatRelay application...');
    
    try {
      if (config.database?.enable_database) {
        if (config.database.enable_in_disk_db) {
          await this.safeInit('SQLite Database (Disk)', sqlite3_bootstrap, config);
        }
        if (config.database.enable_in_memory_db) {
          await this.safeInit('SQLite Database (Memory)', sqlite3_bootstrap_memory, config);
        }
      }

      if (config.use_websocket) {
        await this.safeInit('WebSocket Server', websocket_bootstrap.init, config);
      }

      if (config.use_webserver) {
        await this.safeInit('Express Web Server', express_bootstrap, config);
      }

      if (config.debbug) {
        await this.safeInit('Debug Connection', debugBootstrap.init, config);
      }

      if (config.type_ambience === "dev" && config.dev_config?.enable_spam) {
        await this.safeInit('Spam Generator', liveChatSpam, config);
      }

      logManager.info(`[BOOTSTRAP] SUCCESS STARTER \n Activated modules: ${this.initializedModules.join(', ')}\n`);
      
    } catch (error) {
      logManager.error('\n[BOOTSTRAP] ✗ APPLICATION INITIALIZATION FAILURE');
      logManager.error(`[BOOTSTRAP] Error: ${error.message}`);
      logManager.error(`[BOOTSTRAP] MModules that were initialized: ${this.initializedModules.join(', ') || 'none'}\n`);
      
      // trow the error to be handled by the caller
      throw error;
    }
  }
};

export default bootstrapApp;