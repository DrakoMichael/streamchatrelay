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
 * Carregador de configurações da aplicação.
 */
import loadSettings from "./services/settings/loadSettings.js";

/**
 * @module src.index
 * @description bootstrapApp - app igniter
 */
import bootstrapApp from "./services/app/bootstrapApp.js";

/**
 * @example
 * Exemplo de uso de argumentos via linha de comando.
 * 
 * $ node index.js --debug
 * 
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