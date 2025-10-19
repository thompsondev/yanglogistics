// Database Configuration for Different Environments
const path = require('path');

const config = {
    // Development (local)
    development: {
        databasePath: path.join(__dirname, 'database.json'),
        description: 'Local development database',
        allowOverwrite: true,
        backupOnStart: true
    },
    
    // Production (Coolify/Heroku/etc)
    production: {
        // Use persistent storage directory (Coolify/Heroku)
        databasePath: process.env.DATABASE_PATH || '/app/data/database.json',
        description: 'Production database (persistent storage)',
        allowOverwrite: false,
        backupOnStart: true,
        // Additional safety checks for production
        requireBackup: true,
        maxBackupAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
};

// Get current environment
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.HEROKU_APP_NAME ||
                     process.env.COOLIFY_APP_NAME;

const currentConfig = isProduction ? config.production : config.development;

console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`📁 Database Path: ${currentConfig.databasePath}`);
console.log(`📝 Description: ${currentConfig.description}`);
console.log(`🔒 Allow Overwrite: ${currentConfig.allowOverwrite}`);
console.log(`💾 Backup on Start: ${currentConfig.backupOnStart}`);

// Safety check for production
if (isProduction) {
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED');
    console.log('⚠️  Database overwrites are DISABLED');
    console.log('💾 Automatic backups are ENABLED');
    
    // Check if we're trying to use a local database path
    if (currentConfig.databasePath.includes('database.json') && 
        !currentConfig.databasePath.startsWith('/tmp') && 
        !currentConfig.databasePath.startsWith('/app')) {
        console.error('❌ CRITICAL: Production environment detected but using local database path!');
        console.error('This could cause data loss. Please check your DATABASE_PATH environment variable.');
        process.exit(1);
    }
}

module.exports = {
    DATABASE_PATH: currentConfig.databasePath,
    isProduction,
    config: currentConfig,
    // Export safety functions
    safety: {
        isProduction,
        allowOverwrite: currentConfig.allowOverwrite,
        backupOnStart: currentConfig.backupOnStart,
        requireBackup: currentConfig.requireBackup,
        maxBackupAge: currentConfig.maxBackupAge
    }
}; 