/**
* @file app.js
* @description
* Initial file to start the application.
* Responsible for:
*  - Loading configurations
*  - Initializing essential services
*  - Starting the logger application
*
* @author Michael Mello (drakomichael)
*
* @since 2026-04-04
* @version 1.0.0
**/

//import loadSettings from "./services/settings/loadsettings.js";
//import bootstrapApp from "./services/app/bootstrapApp.js";

async function loadSettings() {
    const dotenv = await import('dotenv');
    dotenv.config();
    return {
        logLevel: process.env.LOG_LEVEL || 'info',
        logFilePath: process.env.LOG_FILE_PATH || './logs/app.log',
        port: process.env.PORT || 3000
    };
};

async function bootstrapApp(settings) {
    const express = await import('express');
    const app = express();
    app.use(express.json());
    app.listen(settings.port, () => {
        console.log(`Logger app is running on port ${settings.port}`);
    });
}

class app{
    async bootstrap(){
        const settings = await loadSettings();    
        await bootstrapApp(settings);
    };   
};
const app = new app()
;app.bootstrap()
;