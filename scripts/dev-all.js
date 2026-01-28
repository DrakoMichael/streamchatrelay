/**
* @author Michael Mello (drakomichael)
* @since 2025-12-27 at @branch refactor/microservices
* @version 1.0.0
**/

import AppBootstrap from '../services/shared/bootstrap/app.js';

class Main {
    async bootstrap() {
        await AppBootstrap.ignite();
    }
}

new Main().bootstrap();