# 🚀 Railway Persistent Storage Setup

## **Problem: Database Resets on Every Deploy**

Your database is being reset because Railway creates a new environment on each deployment. This guide will fix this permanently.

## **Solution: Railway Persistent Storage**

### **1. What We've Done:**

✅ **Updated database path** to use `/tmp/database.json` (Railway's persistent storage)  
✅ **Created setup script** to initialize persistent storage  
✅ **Updated server startup** to use persistent storage  
✅ **Added Railway configuration** with proper environment variables  

### **2. Railway Dashboard Setup:**

#### **Step 1: Set Environment Variables**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Add these variables:
   ```
   DATABASE_PATH=/tmp/database.json
   NODE_ENV=production
   ```

#### **Step 2: Enable Persistent Storage**
1. In your Railway service
2. Go to **Settings** tab
3. Enable **Persistent Storage**
4. Set mount path to `/tmp`

### **3. Manual Setup (if needed):**

#### **Option A: Railway Console**
```bash
# Access Railway console
railway login
railway link
railway shell

# Run setup script
npm run setup-railway

# Restore your data
npm run restore-prod
```

#### **Option B: Direct Database Setup**
```bash
# In Railway console
node setup-railway-persistent-storage.js
node restore-production-data.js
```

### **4. Verify Setup:**

#### **Check Database Path:**
```bash
# In Railway console
ls -la /tmp/
cat /tmp/database.json
```

#### **Check Environment:**
```bash
# In Railway console
echo $DATABASE_PATH
echo $NODE_ENV
```

### **5. Test Persistent Storage:**

1. **Create a test order** through your API
2. **Deploy new code** (push to git)
3. **Check if data persists** after deployment

### **6. Backup Strategy:**

#### **Automatic Backups:**
- Backups are created automatically on server startup
- Located in `backups/` directory
- Timestamped for easy identification

#### **Manual Backup:**
```bash
npm run backup
```

#### **Restore from Backup:**
```bash
npm run restore-prod
```

### **7. Troubleshooting:**

#### **Database Still Resetting:**
1. Check if `DATABASE_PATH` is set correctly
2. Verify persistent storage is enabled
3. Check Railway logs for errors

#### **Permission Errors:**
```bash
# In Railway console
chmod 755 /tmp
chmod 644 /tmp/database.json
```

#### **Path Issues:**
- Ensure `DATABASE_PATH` starts with `/tmp/`
- Don't use `/app/` directory (gets reset)

### **8. Monitoring:**

#### **Check Database Status:**
```bash
# In Railway console
node -e "
const fs = require('fs');
const path = require('path');
const dbPath = process.env.DATABASE_PATH || '/tmp/database.json';
try {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log('✅ Database exists');
  console.log('📊 Orders:', data.orders.length);
  console.log('👥 Admins:', data.adminAccounts.length);
} catch (error) {
  console.log('❌ Database error:', error.message);
}
"
```

### **9. Best Practices:**

1. **Always backup** before major deployments
2. **Test locally** before pushing to Railway
3. **Monitor logs** for database errors
4. **Use environment variables** for configuration
5. **Keep backups** in version control

### **10. Emergency Recovery:**

If your database gets reset:

1. **Find latest backup:**
   ```bash
   ls -la backups/
   ```

2. **Restore from backup:**
   ```bash
   npm run restore-prod
   ```

3. **Verify restoration:**
   ```bash
   curl https://your-railway-url.railway.app/api/health
   ```

## **Expected Result:**

✅ **Database persists** across deployments  
✅ **No more data loss** on code pushes  
✅ **Automatic backups** for safety  
✅ **Easy recovery** from backups  

## **Next Steps:**

1. **Set environment variables** in Railway dashboard
2. **Enable persistent storage** in Railway settings
3. **Deploy and test** the setup
4. **Monitor** for any issues

Your database should now persist across all future deployments! 🎉 