// Configuration for different environments
const config = {
    // Development (local)
    development: {
        API_BASE_URL: 'http://localhost:3000/api'
    },
    
    // Production (Railway/Heroku/etc)
    production: {
        // Replace this with your actual Railway URL once deployed
        API_BASE_URL: 'https://yanglogistics-production.up.railway.app/api'
    }
};

// Get current environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = isProduction ? config.production : config.development;

// Export the current API base URL
window.API_BASE_URL = currentConfig.API_BASE_URL;

console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('API Base URL:', window.API_BASE_URL); 