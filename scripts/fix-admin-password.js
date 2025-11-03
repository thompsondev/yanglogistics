/**
 * Script to hash the admin password and update the database
 * Run with: node scripts/fix-admin-password.js
 */

const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function fixAdminPassword() {
    try {
        const dbPath = path.join(__dirname, '..', 'database.json');
        
        // Read database
        const dbData = await fs.readFile(dbPath, 'utf8');
        const db = JSON.parse(dbData);
        
        // Find admin account
        const adminIndex = db.adminAccounts.findIndex(
            acc => acc.email.toLowerCase() === 'admin@yanglogistics.com'
        );
        
        if (adminIndex === -1) {
            console.error('❌ Admin account not found!');
            process.exit(1);
        }
        
        const admin = db.adminAccounts[adminIndex];
        
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        if (admin.password.startsWith('$2')) {
            console.log('✅ Password is already hashed');
            console.log('Current hash:', admin.password);
            return;
        }
        
        console.log('🔐 Hashing password...');
        const plainPassword = admin.password;
        
        // Hash the password with bcrypt (same as signup uses)
        const hashedPassword = await bcrypt.hash(plainPassword, 12);
        
        // Update the password in the database
        db.adminAccounts[adminIndex].password = hashedPassword;
        db.adminAccounts[adminIndex].updatedAt = new Date().toISOString();
        
        // Write updated database
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
        
        console.log('✅ Password hashed and database updated successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Old password (plain):', plainPassword);
        console.log('🔐 New password (hashed):', hashedPassword);
        console.log('\n✨ You can now login with:');
        console.log('   Email: admin@yanglogistics.com');
        console.log('   Password: Admin123!');
        
    } catch (error) {
        console.error('❌ Error fixing admin password:', error);
        process.exit(1);
    }
}

// Run the script
fixAdminPassword();

