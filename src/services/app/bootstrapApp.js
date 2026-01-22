/**
 * @file bootstrapApp.js
 * @description
 * Responsável por inicializar todos os módulos principais da aplicação
 * StreamChatRelay de acordo com a configuração fornecida.
 *
 * Este bootstrap pode inicializar:
 *  - WebSocket
 *  - Servidor HTTP (Express)
 *  - Conexão com Twitch
 *  - Banco de dados (SQLite em disco ou memória)
 *  - Gerador de spam (modo desenvolvimento)
 *
 * @author Michael Mello
 * @module src.app.bootstrapApp
 * @see https://github.com/drakomichael
 */

/**
 * Imports
 */
import liveChatSpam from "../spamGenerator/liveChatSpam.js";
import express_bootstrap from "../webManager/express_bootstrap.js";
import TwitchConnectionWS from "../externalConnections/twitch/connectionWS.js";
import sqlite3_bootstrap from "../dataBase/sqlite3_bootstrap.js";
import sqlite3_bootstrap_memory from "../dataBase/sqlite3_bootstrap_memory.js";
import websocket_bootstrap from "../webSocket/websocket_bootstrap.js";

/**
 * bootstrap
 */
/**
 * Inicializa os serviços principais da aplicação com base na configuração.
 *
 * @async
 * @function bootstrapApp
 *
 * @param {Object} config Configuração global da aplicação
 * @param {"dev"|"prod"} config.type_ambience Ambiente de execução
 * @param {Object} [config.dev_config] Configurações específicas de desenvolvimento
 * @param {boolean} [config.dev_config.enable_spam] Ativa gerador de spam
 * @param {boolean} config.use_websocket Ativa servidor WebSocket
 * @param {boolean} config.use_webserver Ativa servidor HTTP (Express)
 * @param {boolean} config.debbug Ativa conexão de debug com Twitch
 * @param {Object} [config.database] Configuração do banco de dados
 * @param {boolean} [config.database.enable_database] Ativa banco de dados
 * @param {boolean} [config.database.enable_in_disk_db] Usa SQLite em disco
 * @param {boolean} [config.database.enable_in_memory_db] Usa SQLite em memória
 *
 * @returns {Promise<void>} Não retorna valor
 *
 * @throws {Error} Pode lançar erro caso algum serviço falhe ao inicializar
 */
export default async function bootstrapApp(config) {
  if (config.type_ambience === "dev") {
    if (config.dev_config?.enable_spam) {
      liveChatSpam();
    }
  }

  if (config.use_websocket) {
    websocket_bootstrap(config);
  }

  if (config.use_webserver) {
    await express_bootstrap(config);
  }

  // if (config.debbug) {
  //   const twitchConnection = new TwitchConnectionWS(config);
  //   twitchConnection.connect();
  // }

  if (config.database?.enable_database) {
    if (config.database.enable_in_disk_db) {
      await sqlite3_bootstrap();
    }

    if (config.database.enable_in_memory_db) {
      await sqlite3_bootstrap_memory();
    }
  }

  /**
   * @todo Implementar inicialização do dataControl
   */
}
