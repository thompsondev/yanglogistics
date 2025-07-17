const fs = require('fs').promises;
const path = require('path');

// Production environment setup script
class ProductionSetup {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.dataDir = path.join(this.projectRoot, 'data');
        this.productionDbPath = path.join(this.dataDir, 'database.json');
    }

    async setup() {
        console.log('🚀 Setting up production environment...');
        
        try {
            // Create data directory for persistent storage
            await this.createDataDirectory();
            
            // Initialize production database if it doesn't exist
            await this.initializeProductionDatabase();
            
            // Set up environment variables
            await this.setupEnvironmentVariables();
            
            // Create production configuration
            await this.createProductionConfig();
            
            console.log('✅ Production environment setup completed!');
            console.log('');
            console.log('📋 Next steps:');
            console.log('1. Set DATABASE_PATH environment variable to:', this.productionDbPath);
            console.log('2. Ensure your deployment platform has persistent storage');
            console.log('3. Deploy your application');
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            throw error;
        }
    }

    async createDataDirectory() {
        try {
            await fs.access(this.dataDir);
            console.log('📁 Data directory already exists');
        } catch {
            await fs.mkdir(this.dataDir, { recursive: true });
            console.log('📁 Created data directory for persistent storage');
        }
    }

    async initializeProductionDatabase() {
        try {
            await fs.access(this.productionDbPath);
            console.log('📊 Production database already exists');
        } catch {
            // Create initial production database
            const initialDb = {
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
                        id: "ADM1701234567890",
                        firstName: "Admin",
                        lastName: "User",
                        email: "admin@yanglogistics.com",
                        phone: "+1-555-0123",
                        company: "YangLogistics",
                        role: "super_admin",
                        password: "Admin123!",
                        createdAt: "2024-12-01T10:00:00Z",
                        isActive: true
                    }
                ]
            };

            await fs.writeFile(this.productionDbPath, JSON.stringify(initialDb, null, 2), 'utf8');
            console.log('📊 Created initial production database');
        }
    }

    async setupEnvironmentVariables() {
        const envPath = path.join(this.projectRoot, '.env.production');
        const envContent = `# Production Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_PATH=${this.productionDbPath}
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Configuration
DB_TYPE=file
DB_PATH=${this.productionDbPath}

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
`;

        try {
            await fs.writeFile(envPath, envContent, 'utf8');
            console.log('🔧 Created production environment file (.env.production)');
        } catch (error) {
            console.log('⚠️  Could not create .env.production file:', error.message);
        }
    }

    async createProductionConfig() {
        const configPath = path.join(this.projectRoot, 'production-config.json');
        const config = {
            environment: 'production',
            database: {
                path: this.productionDbPath,
                type: 'file',
                backupEnabled: true,
                backupInterval: '24h'
            },
            server: {
                port: process.env.PORT || 3000,
                cors: {
                    origin: process.env.CORS_ORIGIN || '*',
                    credentials: true
                },
                rateLimit: {
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 100 // limit each IP to 100 requests per windowMs
                }
            },
            security: {
                jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
                bcryptRounds: 12
            },
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                format: 'json'
            }
        };

        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
            console.log('⚙️  Created production configuration file');
        } catch (error) {
            console.log('⚠️  Could not create production config file:', error.message);
        }
    }

    async migrateData() {
        const devDbPath = path.join(this.projectRoot, 'database.json');
        
        try {
            // Check if development database exists
            await fs.access(devDbPath);
            
            console.log('🔄 Migrating data from development to production...');
            
            const devData = await fs.readFile(devDbPath, 'utf8');
            const devDb = JSON.parse(devData);
            
            // Read current production database
            const prodData = await fs.readFile(this.productionDbPath, 'utf8');
            const prodDb = JSON.parse(prodData);
            
            // Merge orders (avoid duplicates)
            const existingOrderIds = new Set(prodDb.orders.map(o => o.id));
            const newOrders = devDb.orders.filter(o => !existingOrderIds.has(o.id));
            
            if (newOrders.length > 0) {
                prodDb.orders.push(...newOrders);
                await fs.writeFile(this.productionDbPath, JSON.stringify(prodDb, null, 2), 'utf8');
                console.log(`✅ Migrated ${newOrders.length} orders to production`);
            } else {
                console.log('ℹ️  No new orders to migrate');
            }
            
        } catch (error) {
            console.log('ℹ️  No development database found for migration');
        }
    }
}

// CLI interface
async function main() {
    const setup = new ProductionSetup();
    const command = process.argv[2];

    switch (command) {
        case 'setup':
            await setup.setup();
            break;
            
        case 'migrate':
            await setup.migrateData();
            break;
            
        case 'full':
            await setup.setup();
            await setup.migrateData();
            break;
            
        default:
            console.log(`
🚀 Production Setup Tool

Usage:
  node scripts/setup-production.js setup   - Set up production environment
  node scripts/setup-production.js migrate - Migrate data from development
  node scripts/setup-production.js full    - Complete setup + migration

Examples:
  node scripts/setup-production.js setup
  node scripts/setup-production.js migrate
  node scripts/setup-production.js full
            `);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProductionSetup; 