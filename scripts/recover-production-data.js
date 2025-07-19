#!/usr/bin/env node

/**
 * Production Data Recovery Script
 * Helps recover production data from backups
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔄 Production Data Recovery Script');
console.log('==================================');

async function recoverProductionData() {
    try {
        // 1. Check available backups
        console.log('\n📁 Checking available backups...');
        const backupsDir = path.join(__dirname, '..', 'backups');
        
        let backupFiles = [];
        try {
            const files = await fs.readdir(backupsDir);
            backupFiles = files.filter(file => file.endsWith('.json'));
        } catch (error) {
            console.log('❌ No backups directory found');
            return;
        }
        
        if (backupFiles.length === 0) {
            console.log('❌ No backup files found');
            return;
        }
        
        console.log(`✅ Found ${backupFiles.length} backup files:`);
        backupFiles.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
        });
        
        // 2. Find the most recent backup with production data
        console.log('\n🔍 Analyzing backup files...');
        let bestBackup = null;
        let maxOrders = 0;
        
        for (const file of backupFiles) {
            try {
                const filePath = path.join(backupsDir, file);
                const content = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(content);
                
                const orderCount = data.orders ? data.orders.length : 0;
                console.log(`  📊 ${file}: ${orderCount} orders`);
                
                if (orderCount > maxOrders) {
                    maxOrders = orderCount;
                    bestBackup = { file, data, orderCount };
                }
            } catch (error) {
                console.log(`  ❌ Error reading ${file}: ${error.message}`);
            }
        }
        
        if (!bestBackup) {
            console.log('❌ No valid backup files found');
            return;
        }
        
        console.log(`\n🎯 Best backup found: ${bestBackup.file} (${bestBackup.orderCount} orders)`);
        
        // 3. Show backup details
        console.log('\n📋 Backup Details:');
        console.log(`  📁 File: ${bestBackup.file}`);
        console.log(`  📦 Orders: ${bestBackup.orderCount}`);
        console.log(`  👥 Admins: ${bestBackup.data.adminAccounts ? bestBackup.data.adminAccounts.length : 0}`);
        console.log(`  🔢 Next Order ID: ${bestBackup.data.nextOrderId || 1}`);
        console.log(`  🔢 Next Tracking: ${bestBackup.data.nextTrackingNumber || 1001}`);
        
        // 4. Show sample orders
        if (bestBackup.data.orders && bestBackup.data.orders.length > 0) {
            console.log('\n📦 Sample Orders:');
            bestBackup.data.orders.slice(0, 3).forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.customerName} - ${order.trackingNumber} (${order.status})`);
            });
            
            if (bestBackup.data.orders.length > 3) {
                console.log(`  ... and ${bestBackup.data.orders.length - 3} more orders`);
            }
        }
        
        // 5. Create recovery instructions
        console.log('\n🛠️ Recovery Instructions:');
        console.log('========================');
        console.log('\n1. MANUAL RECOVERY (Recommended):');
        console.log('   - Copy the backup file content');
        console.log('   - Go to your Railway dashboard');
        console.log('   - Navigate to your app\'s persistent storage');
        console.log('   - Replace the database.json content with the backup');
        console.log('   - Restart your Railway app');
        
        console.log('\n2. AUTOMATIC RECOVERY (If you have Railway CLI):');
        console.log('   - Install Railway CLI: npm install -g @railway/cli');
        console.log('   - Login: railway login');
        console.log('   - Upload backup: railway up --file backups/' + bestBackup.file);
        
        console.log('\n3. PREVENT FUTURE ISSUES:');
        console.log('   - Run: npm run fix-database');
        console.log('   - Always run: npm run check-deployment before deploying');
        console.log('   - Set up automatic backups in Railway');
        
        // 6. Create a Railway-compatible backup
        console.log('\n💾 Creating Railway-compatible backup...');
        const railwayBackupPath = path.join(__dirname, '..', 'railway-recovery-backup.json');
        await fs.writeFile(railwayBackupPath, JSON.stringify(bestBackup.data, null, 2), 'utf8');
        console.log(`✅ Created: ${railwayBackupPath}`);
        console.log('   This file can be uploaded directly to Railway');
        
        // 7. Create deployment safety file
        console.log('\n🛡️ Creating deployment safety file...');
        const safetyFile = path.join(__dirname, '..', 'DEPLOYMENT_SAFETY.md');
        const safetyContent = `# Deployment Safety Guide

## 🚨 CRITICAL: Database Overwrite Prevention

Your production database was recently overwritten by local data. To prevent this from happening again:

### Before Every Deployment:
1. Run: \`npm run check-deployment\`
2. Ensure no database.json files are present
3. Verify .gitignore excludes database files

### Recovery Files:
- Railway Recovery Backup: \`railway-recovery-backup.json\`
- Original Backup: \`backups/${bestBackup.file}\`

### Safety Commands:
- \`npm run fix-database\` - Remove local database files
- \`npm run check-deployment\` - Verify deployment safety
- \`npm run backup-database\` - Create backup before changes

### Railway Environment Variables:
Set these in your Railway dashboard:
- \`DATABASE_PATH=/app/database.json\`
- \`NODE_ENV=production\`

### Last Updated: ${new Date().toISOString()}
`;
        
        await fs.writeFile(safetyFile, safetyContent, 'utf8');
        console.log(`✅ Created: ${safetyFile}`);
        
        console.log('\n🎉 Recovery script completed!');
        console.log('\n📋 Next Steps:');
        console.log('1. Use the recovery backup to restore your Railway database');
        console.log('2. Run: npm run fix-database to prevent future issues');
        console.log('3. Set up automatic backups in Railway dashboard');
        console.log('4. Always run: npm run check-deployment before deploying');
        
    } catch (error) {
        console.error('❌ Error during recovery:', error);
        process.exit(1);
    }
}

recoverProductionData(); 