# 🚀 Release Notes - Stream Chat Relay v1.0.1

**Release Date:** January 24, 2026  
**Author:** Michael Mello (@drakomichael)

---

## 📦 Overview

Stream Chat Relay is a real-time application for managing and relaying chat messages across multiple streaming platforms. This release includes major improvements in application bootstrapping, logging, and initialization safety.

---

## ✨ New Features

### 🔄 **Enhanced Bootstrap System**
- **Sequential Module Initialization**: All application modules now initialize in a specific, optimized order
- **Health Check Validation**: Each module is validated before proceeding to the next one
- **Safe Initialization**: New `safeInit()` method wraps each module initialization in error handling
- **Module Tracking**: Maintains a list of successfully initialized modules for debugging
- **Optimized Load Order**:
  1. Database (SQLite - Disk/Memory)
  2. WebSocket Server
  3. Express Web Server
  4. Debug Connection (Twitch)
  5. Spam Generator (Development Mode)

### 📝 **Advanced Logging System**
- **Multi-Level Logging**: Support for 5 log levels (DEBUG, INFO, WARN, ERROR, CRITICAL)
- **Automatic Log Files**: Creates daily log files automatically (`log_YYYY-MM-DD.txt`)
- **Colored Console Output**: Color-coded console logs for easy visual debugging
- **Persistent File Logging**: All logs saved to `src/logs/` directory
- **Structured Data Support**: JSON serialization for complex objects
- **Timestamp Precision**: ISO 8601 format with milliseconds

#### Log Levels:
- 🔵 **DEBUG** - Detailed debugging information
- 🟢 **INFO** - General informational messages  
- 🟡 **WARN** - Warning messages
- 🔴 **ERROR** - Error conditions
- 🔴 **CRITICAL** - Critical errors requiring immediate attention

### ⚙️ **Improved Configuration Loading**
- **JSON Import Fix**: Properly uses `assert: { type: "json" }` for config files
- **Automatic Fallback**: Switches to backup configuration if primary fails
- **Better Error Messages**: Clear warnings when config is missing or invalid

---

## 🛠️ Improvements

### **Stability & Reliability**
- ✅ Fixed class constructor invocation errors
- ✅ Proper error propagation and handling
- ✅ Graceful failure with detailed error reporting
- ✅ Application won't start unless all critical modules are healthy

### **Developer Experience**
- ✅ Comprehensive bootstrap logs showing initialization progress
- ✅ Visual indicators for module success/failure
- ✅ Better debugging with module tracking
- ✅ Detailed error messages with stack traces

### **Code Quality**
- ✅ Removed deprecated TODO comments
- ✅ Improved JSDoc documentation
- ✅ Better separation of concerns
- ✅ Enhanced error messages

---

## 🐛 Bug Fixes

- **Fixed:** Class constructor `bootstrapApp` cannot be invoked without 'new'
  - Changed from `bootstrapApp(settings)` to `bootstrapApp.ignite(settings)`
  
- **Fixed:** Application exits immediately after starting
  - Corrected JSON import to properly load configuration flags
  - Modules now properly stay alive (WebSocket, Express servers)

- **Fixed:** Spam generator starting before critical services
  - Reordered initialization sequence
  - Spam generator now starts LAST, after all services are ready

- **Fixed:** Incomplete configuration loading
  - Now properly extracts `default` export from JSON modules
  - All config flags properly recognized

---

## 📊 Technical Details

### **Bootstrap Process**
```
[BOOTSTRAP] Starting StreamChatRelay application...
[BOOTSTRAP] Initializing SQLite Database (Disk)...
[BOOTSTRAP] ✓ SQLite Database (Disk) initialized successfully
[BOOTSTRAP] Initializing WebSocket Server...
[BOOTSTRAP] ✓ WebSocket Server initialized successfully
[BOOTSTRAP] Initializing Express Web Server...
[BOOTSTRAP] ✓ Express Web Server initialized successfully
[BOOTSTRAP] Initializing Debug Connection...
[BOOTSTRAP] ✓ Debug Connection initialized successfully
[BOOTSTRAP] Initializing Spam Generator...
[BOOTSTRAP] ✓ Spam Generator initialized successfully

[BOOTSTRAP] ✓ All modules initialized successfully!
[BOOTSTRAP] Active modules: SQLite Database (Disk), WebSocket Server, Express Web Server, Debug Connection, Spam Generator
```

### **Log Manager API**
```javascript
import logManager from './services/app/logManager.js';

logManager.debug('Debug information', { key: 'value' });
logManager.info('Application started');
logManager.warn('Warning message');
logManager.error('Error occurred', error);
logManager.critical('Critical failure');
```

---

## 🔧 Configuration

### **Development Mode** (default)
```json
{
  "type_ambience": "dev",
  "use_webserver": true,
  "use_websocket": true,
  "debbug": true,
  "dev_config": {
    "dev_websocket_port": 8181,
    "dev_express_port": 3131,
    "enable_spam": true
  }
}
```

### **Production Mode**
```json
{
  "type_ambience": "prod",
  "use_webserver": true,
  "use_websocket": true,
  "websocket_port": 8080,
  "express_port": 3030
}
```

---

## 📦 Installation & Usage

### **Install Dependencies**
```bash
npm install
```

### **Start Application**
```bash
npm start
```

### **Build for Production**
```bash
npm run build
```

### **Generate Documentation**
```bash
npm run docs
```

---

## 🔍 What's Next

### **Planned for v1.1.0**
- [ ] Graceful shutdown with module cleanup
- [ ] Hot reload configuration
- [ ] Module dependency graph
- [ ] Performance metrics
- [ ] Health check endpoints
- [ ] Rollback mechanism on failure

---

## 📚 Documentation

Full documentation available at: `docs/api/index.html`

Generated with JSDoc - see project documentation for detailed API reference.

---

## 🤝 Contributing

Contributions are welcome! Please read the contribution guidelines before submitting pull requests.

---

## 📄 License

ISC License

---

## 👨‍💻 Author

**Michael Mello** ([@drakomichael](https://github.com/drakomichael))

---

## 🙏 Acknowledgments

Built with ❤️ using Node.js, Express, WebSocket, and SQLite.

---

**Full Changelog**: https://github.com/drakomichael/streamchatrelay2/compare/v1.0.0...v1.0.1
