/**
 * @module src.services.settings.argsManager
 * @deprecated Create a you own args manager if needed
 */

export default async function argsManager(args) {
    if (args.length === 0) {
        return null;
    }
    // if(args.includes('--help') || args.includes('-h')) {
    //     console.log("Usage: node index.js [options]");
    //     console.log("Options:");
    //     console.log("  --help, -h       Show help");
    //     console.log("  --debug          Enable debug mode");
    //     console.log("  --config <path>  Specify custom config file path");
    //     process.exit(0);
    // }
    return args;
}