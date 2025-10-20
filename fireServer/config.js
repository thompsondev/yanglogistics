/**
 * YangLogistics Frontend Configuration
 * Professional configuration for Coolify deployment
 */

const config = {
    // Development Environment
    development: {
        API_BASE_URL: 'http://localhost:3000/api',
        ENVIRONMENT: 'development',
        DEBUG: true,
        LOG_LEVEL: 'debug'
    },
    
    // Production Environment (Coolify)
    production: {
        API_BASE_URL: 'https://logistics.digitalcoresystem.com/api',
        ENVIRONMENT: 'production',
        DEBUG: false,
        LOG_LEVEL: 'error'
    }
};

// Environment Detection
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' &&
                    !window.location.hostname.includes('192.168') &&
                    !window.location.hostname.includes('10.0');

const currentConfig = isProduction ? config.production : config.development;

// Global Configuration
window.YANGLOGISTICS_CONFIG = {
    ...currentConfig,
    VERSION: '2.0.0',
    APP_NAME: 'YangLogistics',
    SUPPORT_EMAIL: 'support@yanglogistics.com',
    PHONE: '+1-555-YANG-LOG',
    
    // API Configuration
    API_TIMEOUT: 30000, // 30 seconds
    API_RETRY_ATTEMPTS: 3,
    API_RETRY_DELAY: 1000, // 1 second
    
    // UI Configuration
    NOTIFICATION_DURATION: 5000, // 5 seconds
    LOADING_TIMEOUT: 30000, // 30 seconds
    
    // Feature Flags
    FEATURES: {
        TRACKING: true,
        ORDER_MANAGEMENT: true,
        ADMIN_PANEL: true,
        PASSWORD_RESET: true,
        EXPORT_ORDERS: true
    }
};

// Legacy compatibility
window.API_BASE_URL = currentConfig.API_BASE_URL;

// Logging
if (currentConfig.DEBUG) {
    console.log('🚀 YangLogistics Frontend Initialized');
    console.log('🌍 Environment:', currentConfig.ENVIRONMENT);
    console.log('🔗 API Base URL:', currentConfig.API_BASE_URL);
    console.log('📱 App Version:', window.YANGLOGISTICS_CONFIG.VERSION);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.YANGLOGISTICS_CONFIG;
}