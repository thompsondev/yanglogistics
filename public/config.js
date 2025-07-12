// Environment Configuration
const config = {
    development: {
        API_BASE_URL: 'http://localhost:3000/api'
    },
    production: {
        API_BASE_URL: 'https://yanglogistics-production.up.railway.app/api' // Railway deployment URL
    }
};

// Detect environment
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1';

const currentConfig = config[isProduction ? 'production' : 'development'];

// Export configuration
window.APP_CONFIG = currentConfig; 