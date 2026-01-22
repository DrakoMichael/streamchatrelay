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
import loadSettings from "./services/settings/loadSettings.js";

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
 **/

class main{
    async bootstrap(){
        const settings = await loadSettings(); 
        await bootstrapApp(settings);
    };   
};
const app = new main()
;app.bootstrap();