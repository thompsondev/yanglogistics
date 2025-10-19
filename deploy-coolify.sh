#!/bin/bash

# YangLogistics Backend - Coolify Deployment Script
# This script helps prepare and deploy the backend to Coolify

echo "🚚 YangLogistics Backend - Coolify Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found. Please ensure all deployment files are created."
    exit 1
fi

echo "✅ Project files found"

# Check git status
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "   Please commit your changes before deploying:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for Coolify deployment'"
    echo "   git push origin main"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo "✅ Git status checked"

# Display deployment checklist
echo ""
echo "📋 Coolify Deployment Checklist:"
echo "================================"
echo "1. ✅ Dockerfile created"
echo "2. ✅ coolify.json created"
echo "3. ✅ Environment variables configured"
echo "4. ✅ CORS settings updated for logistics.digitalcoresystem.com"
echo "5. ✅ Database configuration updated for persistent storage"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Go to your Coolify dashboard"
echo "2. Create a new application from this repository"
echo "3. Set the domain to: logistics.digitalcoresystem.com"
echo "4. Configure persistent storage volume:"
echo "   - Name: database-storage"
echo "   - Mount Path: /app/data"
echo "   - Size: 1Gi"
echo "5. Set environment variables (see env.example)"
echo "6. Deploy the application"
echo ""
echo "🔗 Useful URLs after deployment:"
echo "==============================="
echo "• Health Check: https://logistics.digitalcoresystem.com/api/health"
echo "• API Base: https://logistics.digitalcoresystem.com"
echo "• Orders API: https://logistics.digitalcoresystem.com/api/orders"
echo ""
echo "📚 For detailed instructions, see COOLIFY_DEPLOYMENT.md"
echo ""
echo "🎉 Ready for Coolify deployment!"
