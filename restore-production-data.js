const fs = require('fs').promises;
const path = require('path');

// Database configuration
const { DATABASE_PATH } = require('./database-config');

async function restoreProductionData() {
    try {
        console.log('🔄 Starting production data restoration...');
        
        // Path to the backup file
        const backupPath = path.join(__dirname, 'backups', 'public-database-backup-2025-07-19T10-20-34-747Z.json');
        
        // Read the backup file
        console.log('📖 Reading backup file...');
        const backupData = await fs.readFile(backupPath, 'utf8');
        const backup = JSON.parse(backupData);
        
        console.log(`📊 Found ${backup.orders.length} orders in backup`);
        console.log(`👥 Found ${backup.adminAccounts.length} admin accounts`);
        
        // Write to the current database
        console.log('💾 Writing to production database...');
        await fs.writeFile(DATABASE_PATH, JSON.stringify(backup, null, 2), 'utf8');
        
        console.log('✅ Production data restored successfully!');
        console.log(`📁 Database location: ${DATABASE_PATH}`);
        
        // Verify the restoration
        const restoredData = await fs.readFile(DATABASE_PATH, 'utf8');
        const restored = JSON.parse(restoredData);
        
        console.log(`✅ Verification: ${restored.orders.length} orders restored`);
        console.log(`✅ Verification: ${restored.adminAccounts.length} admin accounts restored`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error restoring production data:', error);
        return false;
    }
}

// Run the restoration
if (require.main === module) {
    restoreProductionData()
        .then(success => {
            if (success) {
                console.log('🎉 Data restoration completed successfully!');
                process.exit(0);
            } else {
                console.log('💥 Data restoration failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { restoreProductionData }; 