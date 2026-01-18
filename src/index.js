/**
 * @file index.js
 * @description
 * Arquivo principal de bootstrap da aplicação StreamChatRelay.
 * Responsável por:
 *  - Carregar configurações
 *  - Inicializar serviços essenciais
 *  - Dar start na aplicação
 *
 * @author
 * Michael Mello (drakomichael)
 *
 * @since 2025-12-20
 * @version 1.0.1
 */

/**
 * Imports
 */

/**
 * WebSocket bootstrap.
 * Inicializa o servidor WebSocket para comunicação em tempo real.
 */
//import websocket_bootstrap from "./services/webSocket/websocket_bootstrap.js";

/**
 * Carregador de configurações da aplicação.
 */
import loadSettings from "./services/settings/loadsettings.js";

/**
 * Bootstrap principal da aplicação.
 * Responsável por iniciar todos os módulos essenciais.
 * @module src.index
 * @description bootstrapApp
 */
import bootstrapApp from "./services/app/bootstrapApp.js";

/**
 * Exemplos
 */

/**
 * Exemplo de uso de argumentos via linha de comando.
 *
 * @example
 * node index.js --debug
 *
 * @example
 * if (process.argv.includes('--debug')) {
 *   console.log('Debug mode enabled');
 * }
 */

 /**
  * Classes
  */

/**
 * Classe principal da aplicação.
 * Responsável por orquestrar o processo de bootstrap.
 *
 * @class Main
 */
class Main {
  /**
   * Executa o bootstrap da aplicação.
   * Fluxo:
   *  1. Carrega as configurações
   *  2. Inicializa a aplicação com base nessas configurações
   *
   * @async
   * @method bootstrap
   * @returns {null} Não retorna nada
   * @throws {null} Não executa nenhum módulo e não interrompe a aplicação
   */
  async bootstrap() {
    /**
     * Configurações carregadas do ambiente.
     * @type {Object}
     */
    const settings = loadSettings();

    await bootstrapApp(settings);
  }
}

/**
 * Inicialização
 */

/**
 * Instância principal da aplicação.
 * @type {Main}
 */
const app = new Main();

/**
 * Inicia a aplicação.
 */
app.bootstrap();
