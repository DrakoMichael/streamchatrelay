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
import sqlite3_bootstrap from "../dataBase/sqlite3_bootstrap.js";
import sqlite3_bootstrap_memory from "../dataBase/sqlite3_bootstrap_memory.js";
import websocket_bootstrap from "../webSocket/websocket_bootstrap.js";
import debugBootstrap from "./debugBootstrap.js";

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


/**
 * @todo Refatorar para usar um padrão de projeto mais robusto, como Factory ou Builder, para melhor escalabilidade.
 */
class bootstrapApp {
  /**
   * Módulos inicializados com sucesso (para possível rollback)
   * @private
   */
  static initializedModules = [];

  /**
   * Tenta inicializar um módulo e valida se foi bem-sucedido
   * @private
   * @param {string} moduleName - Nome do módulo para logs
   * @param {Function} initFunction - Função de inicialização do módulo
   * @param {Object} config - Configuração da aplicação
   * @returns {Promise<boolean>} true se inicializou com sucesso
   */
  static async safeInit(moduleName, initFunction, config) {
    try {
      console.log(`[BOOTSTRAP] Inicializando ${moduleName}...`);
      await initFunction(config);
      console.log(`[BOOTSTRAP] ✓ ${moduleName} inicializado com sucesso`);
      this.initializedModules.push(moduleName);
      return true;
    } catch (error) {
      console.error(`[BOOTSTRAP] ✗ Erro ao inicializar ${moduleName}:`, error.message);
      throw new Error(`Falha crítica no módulo ${moduleName}: ${error.message}`);
    }
  }

  /**
   * Inicializa todos os módulos de forma sequencial e validada
   * @param {Object} config - Configuração global da aplicação
   * @returns {Promise<void>}
   * @throws {Error} Lança erro se algum módulo crítico falhar
   */
  static async ignite(config) {
    console.log('[BOOTSTRAP] Iniciando aplicação StreamChatRelay...\n');
    
    try {
      // 1. Database (crítico se habilitado) - Inicia primeiro
      if (config.database?.enable_database) {
        if (config.database.enable_in_disk_db) {
          await this.safeInit('SQLite Database (Disk)', sqlite3_bootstrap, config);
        }
        if (config.database.enable_in_memory_db) {
          await this.safeInit('SQLite Database (Memory)', sqlite3_bootstrap_memory, config);
        }
      }

      // 2. WebSocket Server (crítico) - Necessário antes do spam
      if (config.use_websocket) {
        await this.safeInit('WebSocket Server', websocket_bootstrap.init, config);
      }

      // 3. Web Server (crítico) - Necessário antes do spam
      if (config.use_webserver) {
        await this.safeInit('Express Web Server', express_bootstrap, config);
      }

      // 4. Debug Bootstrap (não crítico)
      if (config.debbug) {
        await this.safeInit('Debug Connection', debugBootstrap.init, config);
      }

      // 5. Spam Generator (dev only) - ÚLTIMO, depois de tudo pronto
      if (config.type_ambience === "dev" && config.dev_config?.enable_spam) {
        await this.safeInit('Spam Generator', liveChatSpam, config);
      }

      console.log('\n[BOOTSTRAP] ✓ Todos os módulos foram inicializados com sucesso!');
      console.log(`[BOOTSTRAP] Módulos ativos: ${this.initializedModules.join(', ')}\n`);
      
    } catch (error) {
      console.error('\n[BOOTSTRAP] ✗ FALHA NA INICIALIZAÇÃO DA APLICAÇÃO');
      console.error(`[BOOTSTRAP] Erro: ${error.message}`);
      console.error(`[BOOTSTRAP] Módulos que foram inicializados: ${this.initializedModules.join(', ') || 'nenhum'}\n`);
      
      // Re-lança o erro para que o processo possa tratar (ex: encerrar)
      throw error;
    }
  }
};

export default bootstrapApp;