# Stream Chat Relay - Help

## Overview
Stream Chat Relay is a tool for managing and relaying chat messages across multiple streaming platforms.

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install` -  This will download de node_module with all you need to run
3. Check `config`, don't change the `config_backup` in `./etc`, this backup it's only used in case the `config.json` don't work
3. Run the application: `npm start` 
<!-- ?. Configure your API keys in `.env` -->

## Configuration
Set up the following environment variables:
- `CHAT_API_KEY` - Your chat service API key
- `RELAY_TIMEOUT` - Message relay timeout in milliseconds
- `LOG_LEVEL` - Logging verbosity (debug, info, warn, error)

## Usage
```bash
npm start       # Start the relay service
# npm run test    # Run tests
# npm run build   # Build for production
```

## Troubleshooting
- **Connection issues**: Verify API keys and network connectivity
- **Messages not relaying**: Check the log file for errors
- **Performance**: Adjust `RELAY_TIMEOUT` if experiencing delays

## Support
For issues, create a GitHub issue or contact the maintainers.