import startSettingsService from "../settings/app.js";
import startLogService from "../log/app.js";
import startSpamGeneratorService from "../utils/spamGenerator-service/app.js";

export default class AppBootstrap {
    
    static async safeInit(service) {
        try {
            await service();
        } catch (error) {
            console.error('Error during app initialization:', error);
        }
    }

    static async ignite() {
        await this.safeInit(startSettingsService);
        await this.safeInit(startLogService);
        await this.safeInit(startSpamGeneratorService);
    }
}