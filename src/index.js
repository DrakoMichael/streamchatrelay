/**
* @file index.js
* @description
* Initial file to start the application.
* Responsible for:
*  - Loading configurations
*  - Initializing essential services
*  - Starting the application
*
* @author Michael Mello (drakomichael)
*
* @since 2025-12-20
* @version 1.0.1
**/

/** @imports **/
import loadSettings from "./services/settings/loadsettings.js";
import bootstrapApp from "./services/app/bootstrapApp.js";

class Main{
    async bootstrap(){
        const settings = await loadSettings();    
        await bootstrapApp.ignite(settings);
    };   
};
const app = new Main()
;app.bootstrap();