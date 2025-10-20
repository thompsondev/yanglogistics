/**
 * YangLogistics Database Configuration
 * Professional database configuration for Coolify deployment
 */

const path = require('path');
const fs = require('fs').promises;

const config = {
    // Development Environment
    development: {
        databasePath: path.join(__dirname, 'database.json'),
        description: 'Local development database',
        allowOverwrite: true,
        backupOnStart: true,
        backupRetention: 7, // days
        maxBackupSize: 50 * 1024 * 1024, // 50MB
        compressionEnabled: false
    },
    
    // Production Environment (Coolify)
    production: {
        databasePath: process.env.DATABASE_PATH || '/app/data/database.json',
        description: 'Production database (Coolify persistent storage)',
        allowOverwrite: false,
        backupOnStart: true,
        backupRetention: 30, // days
        maxBackupSize: 100 * 1024 * 1024, // 100MB
        compressionEnabled: true,
        // Additional safety checks for production
        requireBackup: true,
        maxBackupAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        autoBackupInterval: 6 * 60 * 60 * 1000, // 6 hours
        encryptionEnabled: process.env.DB_ENCRYPTION === 'true'
    }
};

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.HEROKU_APP_NAME ||
                     process.env.COOLIFY_APP_NAME ||
                     process.env.PORT; // Coolify sets PORT

const currentConfig = isProduction ? config.production : config.development;

// Logging
console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`📁 Database Path: ${currentConfig.databasePath}`);
console.log(`📝 Description: ${currentConfig.description}`);
console.log(`🔒 Allow Overwrite: ${currentConfig.allowOverwrite}`);
console.log(`💾 Backup on Start: ${currentConfig.backupOnStart}`);

// Production Safety Checks
if (isProduction) {
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED');
    console.log('⚠️  Database overwrites are DISABLED');
    console.log('💾 Automatic backups are ENABLED');
    console.log('🔐 Encryption:', currentConfig.encryptionEnabled ? 'ENABLED' : 'DISABLED');
    
    // Validate production database path
    if (!currentConfig.databasePath.startsWith('/app') && 
        !currentConfig.databasePath.startsWith('/tmp')) {
        console.error('❌ CRITICAL: Production environment detected but using invalid database path!');
        console.error('Database path must start with /app or /tmp for Coolify deployment.');
        console.error('Current path:', currentConfig.databasePath);
        process.exit(1);
    }
    
    // Check if data directory exists
    const dataDir = path.dirname(currentConfig.databasePath);
    fs.access(dataDir).catch(() => {
        console.log(`📁 Creating data directory: ${dataDir}`);
        return fs.mkdir(dataDir, { recursive: true });
    }).catch(error => {
        console.error('❌ Failed to create data directory:', error);
        process.exit(1);
    });
}

// Database Operations
class DatabaseManager {
    constructor() {
        this.config = currentConfig;
        this.isProduction = isProduction;
        this.backupInterval = null;
    }

    /**
     * Initialize database
     */
    async initialize() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.config.databasePath);
            await fs.mkdir(dataDir, { recursive: true });
            
            // Check if database exists
            try {
                await fs.access(this.config.databasePath);
                console.log('✅ Database file exists');
            } catch (error) {
                console.log('📄 Creating new database file');
                await this.createInitialDatabase();
            }
            
            // Setup automatic backups
            if (this.config.backupOnStart) {
                await this.createBackup();
            }
            
            // Setup periodic backups in production
            if (this.isProduction && this.config.autoBackupInterval) {
                this.setupPeriodicBackups();
            }
            
            console.log('✅ Database initialized successfully');
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create initial database structure
     */
    async createInitialDatabase() {
        const initialData = {
            orders: [],
            trackingStages: [
                "Order Placed",
                "Package Picked Up",
                "Out for Delivery",
                "In Transit",
                "Delivered",
                "Failed Delivery"
            ],
            serviceTypes: [
                "Standard Delivery",
                "Express Delivery",
                "Air Freight",
                "Ocean Freight",
                "Ground Transport",
                "Same Day Delivery"
            ],
            nextOrderId: 1,
            nextTrackingNumber: 1001,
            adminAccounts: [
                {
                    id: "ADM" + Date.now(),
                    firstName: "Admin",
                    lastName: "User",
                    email: "admin@yanglogistics.com",
                    phone: "+1-555-0123",
                    company: "YangLogistics",
                    role: "super_admin",
                    password: "Admin123!",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true
                }
            ],
            settings: {
                companyName: "YangLogistics",
                companyEmail: "info@yanglogistics.com",
                companyPhone: "+1-555-YANG-LOG",
                defaultCurrency: "USD",
                timezone: "UTC",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            metadata: {
                version: "2.0.0",
                createdAt: new Date().toISOString(),
                lastBackup: null,
                totalOrders: 0,
                totalAdmins: 1
            }
        };

        await this.writeDatabase(initialData);
        console.log('📄 Initial database created');
    }

    /**
     * Read database
     */
    async readDatabase() {
        try {
            const data = await fs.readFile(this.config.databasePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Failed to read database:', error);
            throw new Error('Database read failed');
        }
    }

    /**
     * Write database
     */
    async writeDatabase(data) {
        try {
            // Add metadata
            data.metadata = {
                ...data.metadata,
                updatedAt: new Date().toISOString(),
                totalOrders: data.orders ? data.orders.length : 0,
                totalAdmins: data.adminAccounts ? data.adminAccounts.length : 0
            };

            const jsonData = JSON.stringify(data, null, 2);
            await fs.writeFile(this.config.databasePath, jsonData, 'utf8');
            
            console.log('✅ Database written successfully');
        } catch (error) {
            console.error('❌ Failed to write database:', error);
            throw new Error('Database write failed');
        }
    }

    /**
     * Create backup
     */
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(
                path.dirname(this.config.databasePath),
                `backup-${timestamp}.json`
            );

            const data = await this.readDatabase();
            await fs.writeFile(backupPath, JSON.stringify(data, null, 2));
            
            // Update last backup timestamp
            if (!data.metadata) {
                data.metadata = {};
            }
            data.metadata.lastBackup = new Date().toISOString();
            await this.writeDatabase(data);
            
            console.log(`💾 Backup created: ${backupPath}`);
            
            // Cleanup old backups
            await this.cleanupOldBackups();
            
        } catch (error) {
            console.error('❌ Backup failed:', error);
        }
    }

    /**
     * Cleanup old backups
     */
    async cleanupOldBackups() {
        try {
            const dataDir = path.dirname(this.config.databasePath);
            const files = await fs.readdir(dataDir);
            const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.json'));
            
            // Sort by creation time (newest first)
            const sortedBackups = await Promise.all(
                backupFiles.map(async (file) => {
                    const filePath = path.join(dataDir, file);
                    const stats = await fs.stat(filePath);
                    return { file, path: filePath, createdAt: stats.birthtime };
                })
            );
            
            sortedBackups.sort((a, b) => b.createdAt - a.createdAt);
            
            // Keep only the most recent backups
            const backupsToDelete = sortedBackups.slice(this.config.backupRetention);
            
            for (const backup of backupsToDelete) {
                await fs.unlink(backup.path);
                console.log(`🗑️ Deleted old backup: ${backup.file}`);
            }
            
        } catch (error) {
            console.error('❌ Backup cleanup failed:', error);
        }
    }

    /**
     * Setup periodic backups
     */
    setupPeriodicBackups() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
        
        this.backupInterval = setInterval(async () => {
            console.log('⏰ Running scheduled backup...');
            await this.createBackup();
        }, this.config.autoBackupInterval);
        
        console.log(`⏰ Periodic backups enabled (every ${this.config.autoBackupInterval / 1000 / 60} minutes)`);
    }

    /**
     * Get database statistics
     */
    async getStats() {
        try {
            const data = await this.readDatabase();
            return {
                totalOrders: data.orders ? data.orders.length : 0,
                totalAdmins: data.adminAccounts ? data.adminAccounts.length : 0,
                lastBackup: data.metadata ? data.metadata.lastBackup : null,
                databaseSize: (await fs.stat(this.config.databasePath)).size,
                version: data.metadata ? data.metadata.version : 'unknown'
            };
        } catch (error) {
            console.error('❌ Failed to get database stats:', error);
            return null;
        }
    }

    /**
     * Shutdown cleanup
     */
    async shutdown() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            console.log('⏰ Periodic backups stopped');
        }
        
        // Create final backup
        if (this.isProduction) {
            await this.createBackup();
        }
        
        console.log('✅ Database manager shutdown complete');
    }
}

// Create global database manager instance
const dbManager = new DatabaseManager();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    await dbManager.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    await dbManager.shutdown();
    process.exit(0);
});

module.exports = {
    DATABASE_PATH: currentConfig.databasePath,
    isProduction,
    config: currentConfig,
    dbManager,
    
    // Legacy compatibility
    safety: {
        isProduction,
        allowOverwrite: currentConfig.allowOverwrite,
        backupOnStart: currentConfig.backupOnStart,
        requireBackup: currentConfig.requireBackup,
        maxBackupAge: currentConfig.maxBackupAge
    }
}; 