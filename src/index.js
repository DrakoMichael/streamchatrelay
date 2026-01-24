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
        try {
            console.log('Carregando configurações...\n');
            const settings = await loadSettings();
            
            await bootstrapApp.ignite(settings);
            
            console.log('Aplicação iniciada com sucesso! ✓');
        } catch (error) {
            console.error('\n❌ ERRO FATAL: A aplicação não pôde ser iniciada');
            console.error('Motivo:', error.message);
            console.error('\nStack trace:', error.stack);
            process.exit(1);
        }
    };   
};
const app = new main()
;app.bootstrap();