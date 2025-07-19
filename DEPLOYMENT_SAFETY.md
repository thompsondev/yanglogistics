# Deployment Safety Guide

## 🚨 CRITICAL: Database Overwrite Prevention

Your production database was recently overwritten by local data. To prevent this from happening again:

### Before Every Deployment:
1. Run: `npm run check-deployment`
2. Ensure no database.json files are present
3. Verify .gitignore excludes database files

### Recovery Files:
- Railway Recovery Backup: `railway-recovery-backup.json`
- Original Backup: `backups/database-backup-2025-07-17T11-53-39-040Z.json`

### Safety Commands:
- `npm run fix-database` - Remove local database files
- `npm run check-deployment` - Verify deployment safety
- `npm run backup-database` - Create backup before changes

### Railway Environment Variables:
Set these in your Railway dashboard:
- `DATABASE_PATH=/app/database.json`
- `NODE_ENV=production`

### Last Updated: 2025-07-19T10:20:10.637Z
