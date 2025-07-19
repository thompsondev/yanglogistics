#!/usr/bin/env node

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
        console.error('\nPlease run: npm run fix-database');
        process.exit(1);
    }
    
    console.log('✅ Deployment safety check passed');
}

checkDeploymentSafety();
