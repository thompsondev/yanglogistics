# 🚀 YangLogistics Deployment Guide

## Recommended: Railway Deployment (Easiest)

### Step 1: Prepare Your Repository
1. Make sure all changes are committed to GitHub
2. Your project is now ready for deployment
3. ✅ **Fixed**: package.json formatting issues resolved

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `yanglogistics` repository
5. Railway will auto-detect it's a Node.js app

### Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

### Step 4: Deploy
1. Railway will automatically build and deploy your app
2. You'll get a URL like: `https://yanglogistics-production.up.railway.app`
3. Your app is now live! 🎉

### Step 5: Custom Domain (Optional)
1. In Railway dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `api.yanglogistics.com`)
3. Update DNS records as instructed
4. Railway provides free SSL certificates

## Railway-Specific Configuration

### Build Process
- Railway uses `npm ci` for clean installs
- Build script: `npm install` (configured in package.json)
- Start script: `npm start` (runs `node server.js`)

### Files Included
- `.railwayignore` - Excludes unnecessary files from deployment
- All source files in `logic/` and `public/` directories
- `server.js` - Main application entry point

## Alternative: Render Deployment

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `yanglogistics-api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 2: Environment Variables
Add in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

## Environment Variables Explained

- `NODE_ENV=production`: Enables production mode
- `JWT_SECRET`: Secret key for JWT token generation (change this!)

## Post-Deployment Checklist

✅ **Test your API endpoints**:
- Health check: `https://your-domain.com/api/health`
- Login: `https://your-domain.com/api/auth/login`

✅ **Update frontend URLs** (if needed):
- Update `public/config.js` with your actual domain
- Update `logic/api.js` with your actual domain

✅ **Test all features**:
- Admin login
- Order creation
- Package tracking
- CSV export

## Troubleshooting

### Common Issues:

1. **"npm ci" error**: 
   - ✅ **FIXED**: package.json formatting issues resolved
   - Ensure all dependencies are properly listed
   - Check for JSON syntax errors

2. **Build fails**: 
   - Check if all dependencies are in `package.json`
   - Verify Node.js version compatibility

3. **App crashes**: 
   - Check logs in Railway/Render dashboard
   - Verify environment variables are set

4. **CORS errors**: 
   - Verify domain is in CORS configuration
   - Check if frontend URLs match backend

5. **Database issues**: 
   - Ensure `logic/database.json` exists
   - Check file permissions

### Getting Help:
- Railway: Built-in chat support
- Render: Documentation and community forum
- Check deployment logs for specific error messages

## Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Railway | $5/month | $20/month | Easiest deployment |
| Render | 750 hrs/month | $7/month | Good free tier |
| Heroku | None | $7/month | Classic choice |

## Security Notes

⚠️ **Important**: 
- Change the default JWT_SECRET in production
- Use strong, unique passwords
- Consider upgrading to a proper database (PostgreSQL) for production
- Enable rate limiting (already configured)
- Use HTTPS (automatic with Railway/Render)

## Quick Fix for Railway

If you encounter the "npm ci" error again:

1. **Check package.json**: Ensure it's valid JSON
2. **Verify dependencies**: All required packages are listed
3. **Clear cache**: Railway will rebuild on next push
4. **Check logs**: Railway dashboard shows detailed error messages

Your YangLogistics system is now ready for stress-free deployment! 🎯 