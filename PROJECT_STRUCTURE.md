# YangLogistics Project Structure

## 📁 Project Overview
This is a logistics management system with a clean separation between frontend and backend.

## 🏗️ Directory Structure

### **Backend Files (Root Directory)**
- `server.js` - Main Express.js backend server
- `package.json` - Node.js dependencies and scripts
- `database-config.js` - Database configuration
- `Dockerfile` - Docker configuration for Coolify deployment
- `coolify.json` - Coolify deployment configuration
- `env.example` - Environment variables template
- `scripts/` - Database management scripts

### **Frontend Files (fireServer/)**
- `index.html` - Main landing page
- `admin.html` - Admin dashboard
- `login.html` - Admin login page
- `tracking.html` - Package tracking page
- `order.html` - Order creation page
- `styles.css` - Main stylesheet
- `config.js` - Frontend configuration
- `api.js` - API service class
- `components/` - Reusable components
- `sample/` - Images and assets

## 🚀 Deployment

### **Backend (Coolify)**
- Domain: `https://logistics.digitalcoresystem.com`
- Deploy using: `coolify.json` configuration

### **Frontend (Firebase)**
- Domain: `https://yang-logistics.web.app`
- Deploy using: `firebase deploy`

## 🔧 Development

### **Backend Development**
```bash
npm install
npm start
```

### **Frontend Development**
- All frontend files are in `fireServer/` folder
- Deploy to Firebase for testing

## 📋 API Endpoints

- Health: `https://logistics.digitalcoresystem.com/api/health`
- Orders: `https://logistics.digitalcoresystem.com/api/orders`
- Tracking: `https://logistics.digitalcoresystem.com/api/track/:trackingNumber`

## 🎯 Clean Architecture

- **No Railway references** - Completely removed
- **No duplicate files** - Cleaned up
- **Proper image paths** - All images in fireServer/sample/
- **Clear separation** - Frontend vs Backend
