const fs = require('fs').promises;
const path = require('path');

// Database backup and restore utility
class DatabaseManager {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.databasePath = path.join(__dirname, '../database.json');
    }

    // Create backup directory if it doesn't exist
    async ensureBackupDir() {
        try {
            await fs.access(this.backupDir);
        } catch {
            await fs.mkdir(this.backupDir, { recursive: true });
            console.log('📁 Created backup directory');
        }
    }

    // Backup current database
    async backup() {
        try {
            await this.ensureBackupDir();
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `database-backup-${timestamp}.json`);
            
            const data = await fs.readFile(this.databasePath, 'utf8');
            await fs.writeFile(backupPath, data, 'utf8');
            
            console.log(`✅ Database backed up to: ${backupPath}`);
            return backupPath;
        } catch (error) {
            console.error('❌ Backup failed:', error.message);
            throw error;
        }
    }

    // Restore database from backup
    async restore(backupPath) {
        try {
            const data = await fs.readFile(backupPath, 'utf8');
            await fs.writeFile(this.databasePath, data, 'utf8');
            
            console.log(`✅ Database restored from: ${backupPath}`);
        } catch (error) {
            console.error('❌ Restore failed:', error.message);
            throw error;
        }
    }

    // List available backups
    async listBackups() {
        try {
            await this.ensureBackupDir();
            const files = await fs.readdir(this.backupDir);
            const backups = files.filter(file => file.startsWith('database-backup-'));
            
            console.log('📋 Available backups:');
            backups.forEach(backup => {
                console.log(`  - ${backup}`);
            });
            
            return backups;
        } catch (error) {
            console.error('❌ Failed to list backups:', error.message);
            return [];
        }
    }

    // Get latest backup
    async getLatestBackup() {
        const backups = await this.listBackups();
        if (backups.length === 0) {
            return null;
        }
        
        // Sort by timestamp (newest first)
        backups.sort().reverse();
        return path.join(this.backupDir, backups[0]);
    }
}

// CLI interface
async function main() {
    const manager = new DatabaseManager();
    const command = process.argv[2];

    switch (command) {
        case 'backup':
            await manager.backup();
            break;
            
        case 'restore':
            const backupPath = process.argv[3];
            if (!backupPath) {
                const latest = await manager.getLatestBackup();
                if (latest) {
                    console.log(`🔄 Restoring from latest backup: ${latest}`);
                    await manager.restore(latest);
                } else {
                    console.log('❌ No backups found');
                }
            } else {
                await manager.restore(backupPath);
            }
            break;
            
        case 'list':
            await manager.listBackups();
            break;
            
        default:
            console.log(`
📊 Database Management Tool

Usage:
  node scripts/backup-database.js backup    - Create a backup
  node scripts/backup-database.js restore   - Restore from latest backup
  node scripts/backup-database.js restore <path> - Restore from specific backup
  node scripts/backup-database.js list      - List available backups

Examples:
  node scripts/backup-database.js backup
  node scripts/backup-database.js restore
  node scripts/backup-database.js restore backups/database-backup-2025-07-17T11-30-00-000Z.json
            `);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DatabaseManager; 