/**
 * Script to hash ALL admin passwords that are stored as plain text
 * Works with both local and production databases
 * Run with: node scripts/fix-all-admin-passwords.js
 */

const bcrypt = require('bcryptjs');
const { dbManager } = require('../database-config');

async function fixAllAdminPasswords() {
    try {
        console.log('🔍 Reading database...');
        const db = await dbManager.readDatabase();
        
        if (!db.adminAccounts || db.adminAccounts.length === 0) {
            console.log('⚠️  No admin accounts found in database');
            return;
        }
        
        console.log(`📋 Found ${db.adminAccounts.length} admin account(s)`);
        console.log('');
        
        let fixedCount = 0;
        let alreadyHashedCount = 0;
        let skippedCount = 0;
        
        // Process each admin account
        for (let i = 0; i < db.adminAccounts.length; i++) {
            const admin = db.adminAccounts[i];
            const email = admin.email;
            
            console.log(`\n👤 Processing: ${email}`);
            
            // Check if account is active
            if (!admin.isActive) {
                console.log('   ⏭️  Account is inactive, skipping...');
                skippedCount++;
                continue;
            }
            
            // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
            if (admin.password && admin.password.startsWith('$2')) {
                console.log('   ✅ Password is already hashed');
                alreadyHashedCount++;
                continue;
            }
            
            // Check if password exists
            if (!admin.password || admin.password.trim() === '') {
                console.log('   ⚠️  No password found, skipping...');
                skippedCount++;
                continue;
            }
            
            // Hash the plain text password
            console.log('   🔐 Hashing plain text password...');
            const plainPassword = admin.password;
            const hashedPassword = await bcrypt.hash(plainPassword, 12);
            
            // Update the password
            db.adminAccounts[i].password = hashedPassword;
            db.adminAccounts[i].updatedAt = new Date().toISOString();
            
            console.log(`   ✅ Password hashed successfully`);
            console.log(`   📧 Email: ${email}`);
            console.log(`   🔑 Old (plain): ${plainPassword.substring(0, 8)}...`);
            console.log(`   🔐 New (hashed): ${hashedPassword.substring(0, 20)}...`);
            
            fixedCount++;
        }
        
        // Write updated database if any changes were made
        if (fixedCount > 0) {
            console.log('\n💾 Writing updated database...');
            await dbManager.writeDatabase(db);
            console.log('✅ Database updated successfully!');
        } else {
            console.log('\n✅ No passwords needed to be fixed.');
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Fixed (hashed): ${fixedCount}`);
        console.log(`✅ Already hashed: ${alreadyHashedCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log(`📋 Total accounts: ${db.adminAccounts.length}`);
        console.log('='.repeat(50));
        
        if (fixedCount > 0) {
            console.log('\n✨ All plain text passwords have been hashed!');
            console.log('🔄 Please restart your server for changes to take effect.');
        }
        
    } catch (error) {
        console.error('❌ Error fixing admin passwords:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
fixAllAdminPasswords();

