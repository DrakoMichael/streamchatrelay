export default class connectionHUB {    
    constructor() {
        this.connections = {};
    }

    static redirectConnection(params, data) {
        switch (params) {
            case 'twitch':
                console.log('twitch connection established - HUB ' + data.status);
        }
    }
};