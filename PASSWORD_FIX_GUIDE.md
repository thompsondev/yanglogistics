# 🔐 Password Fix Guide

## Problem
Admin passwords were stored as plain text in the database, but the login endpoint uses `bcrypt.compare()` which expects hashed passwords. This causes login failures.

## ✅ Solution

### Option 1: Run Script Locally (Recommended for Local Development)

```bash
npm run fix-passwords
```

Or directly:
```bash
node scripts/fix-all-admin-passwords.js
```

This script will:
- ✅ Automatically detect the database path (local or production)
- ✅ Find all admin accounts with plain text passwords
- ✅ Hash them using bcrypt (same as signup)
- ✅ Skip accounts that are already hashed
- ✅ Update the database

### Option 2: Use API Endpoint (For Production)

If you need to fix passwords on a deployed server (Coolify):

```bash
curl -X POST https://logistics.digitalcoresystem.com/api/admin/fix-passwords
```

**⚠️ WARNING:** This endpoint should be removed or protected after use in production!

## 📋 What Gets Fixed

The script/endpoint will:
1. ✅ Check all admin accounts
2. ✅ Identify accounts with plain text passwords (not starting with `$2`)
3. ✅ Hash plain text passwords using bcrypt (salt rounds: 12)
4. ✅ Skip accounts that are already hashed
5. ✅ Skip inactive accounts
6. ✅ Update the database

## 🔄 After Running

1. **Restart your server** for changes to take effect:
   ```bash
   # Local
   npm start
   
   # Production (Coolify)
   # Restart the container/application
   ```

2. **Test login** with your credentials:
   - Email: `admin@yanglogistics.com`
   - Password: `Admin123!`

## 📊 Current Status

After running, you'll see a summary:
```
✅ Fixed (hashed): X
✅ Already hashed: Y
⏭️  Skipped: Z
📋 Total accounts: N
```

## 🔒 Security Notes

- ✅ Passwords are hashed with bcrypt (12 salt rounds)
- ✅ Plain text passwords are never stored after fixing
- ✅ Already hashed passwords are not modified
- ✅ Inactive accounts are skipped

## 🚨 Production Deployment

For **Coolify deployment**, you have two options:

### A. Run Script Before Deployment
1. Run `npm run fix-passwords` locally
2. Commit the updated `database.json`
3. Deploy to Coolify

### B. Run Script on Production Server
1. SSH into your Coolify server
2. Navigate to the app directory
3. Run: `node scripts/fix-all-admin-passwords.js`
4. Restart the application

### C. Use API Endpoint (Temporary)
1. Call the endpoint: `POST /api/admin/fix-passwords`
2. **IMPORTANT:** Remove or protect this endpoint after use!

## 📝 Notes

- The script uses the same database configuration as your server
- It automatically detects if you're in development or production
- Production database path: `/app/data/database.json`
- Local database path: `./database.json`

## ❓ Troubleshooting

**Q: Script says "No admin accounts found"**
- Check that your database.json file exists
- Verify the adminAccounts array exists in the database

**Q: Login still doesn't work after fixing**
- Make sure you restarted the server
- Check that the correct database file is being used
- Verify the password hash format (should start with `$2a$`)

**Q: Production database not updating**
- Check file permissions on `/app/data/database.json`
- Verify the volume mount in Coolify
- Check server logs for errors

