const fs = require('fs').promises;
const path = require('path');

// Database configuration
const { DATABASE_PATH, isProduction } = require('./database-config');

async function setupRailwayPersistentStorage() {
    try {
        console.log('🚀 Setting up Railway persistent storage...');
        
        if (!isProduction) {
            console.log('⚠️  This script is designed for Railway production environment');
            console.log('📝 For local development, your database is already configured');
            return true;
        }
        
        console.log(`📁 Database path: ${DATABASE_PATH}`);
        
        // Check if database already exists
        try {
            await fs.access(DATABASE_PATH);
            console.log('✅ Database file already exists');
            
            // Read and display current data
            const data = await fs.readFile(DATABASE_PATH, 'utf8');
            const db = JSON.parse(data);
            console.log(`📊 Current database has ${db.orders.length} orders`);
            console.log(`👥 Current database has ${db.adminAccounts.length} admin accounts`);
            
            return true;
            
        } catch (error) {
            console.log('📝 Database file does not exist, creating new one...');
            
            // Create initial database structure
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
            
            // Write to persistent storage
            await fs.writeFile(DATABASE_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
            console.log('✅ New database created in persistent storage');
            
            return true;
        }
        
    } catch (error) {
        console.error('❌ Error setting up Railway persistent storage:', error);
        return false;
    }
}

// Run the setup
if (require.main === module) {
    setupRailwayPersistentStorage()
        .then(success => {
            if (success) {
                console.log('🎉 Railway persistent storage setup completed!');
                process.exit(0);
            } else {
                console.log('💥 Railway persistent storage setup failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { setupRailwayPersistentStorage }; 