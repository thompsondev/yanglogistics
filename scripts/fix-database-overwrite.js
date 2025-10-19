#!/usr/bin/env node

/**
 * Database Overwrite Fix Script
 * This script helps prevent local database from overwriting production database
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 Database Overwrite Fix Script');
console.log('================================');

async function fixDatabaseOverwrite() {
    try {
        // 1. Check if database.json exists in root
        const rootDbPath = path.join(__dirname, '..', 'database.json');
        const publicDbPath = path.join(__dirname, '..', 'public', 'database.json');
        
        console.log('\n📁 Checking database files...');
        
        let rootDbExists = false;
        let publicDbExists = false;
        
        try {
            await fs.access(rootDbPath);
            rootDbExists = true;
            console.log('❌ Found database.json in root directory');
        } catch (error) {
            console.log('✅ No database.json in root directory');
        }
        
        try {
            await fs.access(publicDbPath);
            publicDbExists = true;
            console.log('❌ Found database.json in public directory');
        } catch (error) {
            console.log('✅ No database.json in public directory');
        }
        
        // 2. Create backup of current database if it exists
        if (rootDbExists) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(__dirname, '..', 'backups', `local-database-backup-${timestamp}.json`);
            
            console.log(`\n💾 Creating backup of local database...`);
            const dbContent = await fs.readFile(rootDbPath, 'utf8');
            await fs.writeFile(backupPath, dbContent, 'utf8');
            console.log(`✅ Backup created: ${backupPath}`);
            
            // 3. Remove database.json from root
            console.log('\n🗑️ Removing database.json from root directory...');
            await fs.unlink(rootDbPath);
            console.log('✅ Removed database.json from root');
        }
        
        if (publicDbExists) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(__dirname, '..', 'backups', `public-database-backup-${timestamp}.json`);
            
            console.log(`\n💾 Creating backup of public database...`);
            const dbContent = await fs.readFile(publicDbPath, 'utf8');
            await fs.writeFile(backupPath, dbContent, 'utf8');
            console.log(`✅ Backup created: ${backupPath}`);
            
            // Remove database.json from public
            console.log('\n🗑️ Removing database.json from public directory...');
            await fs.unlink(publicDbPath);
            console.log('✅ Removed database.json from public');
        }
        
        // 4. Create a template database for development
        console.log('\n📝 Creating development database template...');
        const templateDb = {
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
        
        const templatePath = path.join(__dirname, '..', 'database-template.json');
        await fs.writeFile(templatePath, JSON.stringify(templateDb, null, 2), 'utf8');
        console.log('✅ Created database-template.json for development');
        
        // 5. Update .gitignore to ensure database files are excluded
        console.log('\n📋 Updating .gitignore...');
        const gitignorePath = path.join(__dirname, '..', '.gitignore');
        let gitignoreContent = '';
        
        try {
            gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        } catch (error) {
            gitignoreContent = '';
        }
        
        const databaseExclusions = [
            '# Database files (keep production data separate)',
            'database.json',
            'database-template.json',
            '*.db',
            '*.sqlite',
            'public/database.json'
        ];
        
        const lines = gitignoreContent.split('\n');
        const hasDatabaseExclusions = lines.some(line => line.includes('database.json'));
        
        if (!hasDatabaseExclusions) {
            const updatedContent = gitignoreContent + '\n' + databaseExclusions.join('\n');
            await fs.writeFile(gitignorePath, updatedContent, 'utf8');
            console.log('✅ Updated .gitignore with database exclusions');
        } else {
            console.log('✅ .gitignore already has database exclusions');
        }
        
        // 6. Create deployment safety check
        console.log('\n🛡️ Creating deployment safety check...');
        const safetyCheckPath = path.join(__dirname, '..', 'scripts', 'check-deployment-safety.js');
        const safetyCheckContent = `#!/usr/bin/env node

/**
 * Deployment Safety Check
 * Ensures no database files are being deployed
 */

const fs = require('fs').promises;
const path = require('path');

async function checkDeploymentSafety() {
    const problematicFiles = [];
    
    // Check for database files that shouldn't be deployed
    const filesToCheck = [
        'database.json',
        'public/database.json',
        'database-template.json'
    ];
    
    for (const file of filesToCheck) {
        try {
            await fs.access(path.join(__dirname, '..', file));
            problematicFiles.push(file);
        } catch (error) {
            // File doesn't exist, which is good
        }
    }
    
    if (problematicFiles.length > 0) {
        console.error('🚨 DEPLOYMENT BLOCKED: Database files found!');
        console.error('The following files would overwrite your production database:');
        problematicFiles.forEach(file => console.error('  - ' + file));
        console.error('\\nPlease run: npm run fix-database');
        process.exit(1);
    }
    
    console.log('✅ Deployment safety check passed');
}

checkDeploymentSafety();
`;
        
        await fs.writeFile(safetyCheckPath, safetyCheckContent, 'utf8');
        console.log('✅ Created deployment safety check script');
        
        // 7. Update package.json scripts
        console.log('\n📦 Updating package.json scripts...');
        const packagePath = path.join(__dirname, '..', 'package.json');
        const packageContent = await fs.readFile(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        packageJson.scripts['fix-database'] = 'node scripts/fix-database-overwrite.js';
        packageJson.scripts['check-deployment'] = 'node scripts/check-deployment-safety.js';
        packageJson.scripts['predeploy'] = 'npm run check-deployment';
        
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log('✅ Updated package.json with safety scripts');
        
        console.log('\n🎉 Database overwrite fix completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm run check-deployment (before each deployment)');
        console.log('2. Use database-template.json for local development');
        console.log('3. Your production database on Coolify is now safe');
        console.log('4. Consider setting up automatic backups');
        
    } catch (error) {
        console.error('❌ Error fixing database overwrite:', error);
        process.exit(1);
    }
}

fixDatabaseOverwrite(); 