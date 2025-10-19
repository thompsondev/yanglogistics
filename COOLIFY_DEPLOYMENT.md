# YangLogistics Backend - Coolify Deployment Guide

## Overview
This guide will help you deploy the YangLogistics backend API to Coolify with the domain `logistics.digitalcoresystem.com`.

## Prerequisites
- Coolify account and access to your Coolify instance
- Git repository access (GitHub/GitLab)
- Domain `logistics.digitalcoresystem.com` configured to point to your Coolify instance

## Files Created for Deployment

### 1. Dockerfile
- Uses Node.js 18 Alpine for lightweight container
- Sets up persistent storage at `/app/data`
- Includes health checks
- Optimized for production

### 2. coolify.json
- Coolify-specific configuration
- Defines volumes for persistent storage
- Sets up health checks and domain configuration

### 3. env.example
- Template for environment variables
- Copy to `.env` and customize for your setup

## Deployment Steps

### Step 1: Prepare Your Repository
1. Commit all the new files to your repository:
   ```bash
   git add .
   git commit -m "Add Coolify deployment configuration"
   git push origin main
   ```

### Step 2: Create Application in Coolify
1. Log into your Coolify dashboard
2. Click "New Application"
3. Choose "Git Repository" as source
4. Connect your repository (yanglogistics)
5. Select the main branch

### Step 3: Configure Application Settings
1. **Application Name**: `yanglogistics-backend`
2. **Domain**: `logistics.digitalcoresystem.com`
3. **Build Type**: Dockerfile
4. **Dockerfile Path**: `./Dockerfile`

### Step 4: Set Environment Variables
In Coolify, add these environment variables:

```
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/database.json
JWT_SECRET=your-super-secret-jwt-key-change-in-production
COOLIFY_APP_NAME=yanglogistics-backend
COOLIFY_DOMAIN=logistics.digitalcoresystem.com
```

**Important**: Change the `JWT_SECRET` to a strong, unique value!

### Step 5: Configure Persistent Storage
1. In Coolify, go to the "Volumes" section
2. Add a new volume:
   - **Name**: `database-storage`
   - **Mount Path**: `/app/data`
   - **Size**: `1Gi` (or more if needed)

### Step 6: Deploy
1. Click "Deploy" in Coolify
2. Monitor the build logs
3. Wait for deployment to complete

### Step 7: Verify Deployment
1. Check health endpoint: `https://logistics.digitalcoresystem.com/api/health`
2. Test API endpoints:
   - `GET https://logistics.digitalcoresystem.com/api/orders`
   - `POST https://logistics.digitalcoresystem.com/api/orders`

## API Endpoints

Your backend will be available at `https://logistics.digitalcoresystem.com` with these endpoints:

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/signup` - Admin registration
- `POST /api/auth/change-password` - Change password

### Orders
- `GET /api/orders` - Get all orders (with pagination)
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/status` - Update order status

### Tracking
- `GET /api/track/:trackingNumber` - Track order by tracking number

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - Health check endpoint

## Frontend Configuration

Update your Firebase frontend to use the new backend URL:

```javascript
// In your frontend config
const API_BASE_URL = 'https://logistics.digitalcoresystem.com';
```

## Database Persistence

The database is stored in `/app/data/database.json` which is mounted as a persistent volume. This ensures your data survives container restarts and deployments.

## Monitoring and Logs

- View logs in Coolify dashboard
- Health checks run every 30 seconds
- Monitor the `/api/health` endpoint for uptime

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend domain is added to the CORS origins in `server.js`

2. **Database Not Persisting**: Check that the volume is properly mounted at `/app/data`

3. **Health Check Failing**: Verify the application is running on port 3000

4. **Domain Not Working**: Ensure DNS is properly configured to point to your Coolify instance

### Logs
Check Coolify logs for detailed error information:
- Build logs: Shows Docker build process
- Runtime logs: Shows application output and errors

## Security Notes

1. **Change JWT Secret**: Use a strong, unique JWT secret in production
2. **Environment Variables**: Never commit sensitive data to your repository
3. **CORS**: Only allow trusted domains in CORS configuration
4. **Rate Limiting**: The API includes rate limiting (100 requests per 15 minutes per IP)

## Backup Strategy

The application automatically creates backups of the database. Backups are stored in the `/app/data` directory and can be downloaded from Coolify's file manager.

## Support

If you encounter issues:
1. Check the Coolify logs
2. Verify all environment variables are set correctly
3. Ensure the domain DNS is properly configured
4. Test the health endpoint: `https://logistics.digitalcoresystem.com/api/health`
