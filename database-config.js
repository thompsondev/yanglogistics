// Database Configuration for Different Environments
const path = require('path');

const config = {
    // Development (local)
    development: {
        databasePath: path.join(__dirname, 'database.json'),
        description: 'Local development database'
    },
    
    // Production (Railway/Heroku/etc)
    production: {
        // Use environment variable for production database path
        databasePath: process.env.DATABASE_PATH || '/app/data/database.json',
        description: 'Production database (persistent storage)'
    }
};

// Get current environment
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.RAILWAY_ENVIRONMENT === 'production' ||
                     process.env.HEROKU_APP_NAME;

const currentConfig = isProduction ? config.production : config.development;

console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`📁 Database Path: ${currentConfig.databasePath}`);
console.log(`📝 Description: ${currentConfig.description}`);

module.exports = {
    DATABASE_PATH: currentConfig.databasePath,
    isProduction,
    config: currentConfig
}; 