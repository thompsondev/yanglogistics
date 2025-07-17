#!/bin/bash

# Deployment script for YangLogistics
# This script handles database backup and deployment

set -e  # Exit on any error

echo "🚚 YangLogistics Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup before deployment
print_status "Creating database backup..."
node scripts/backup-database.js backup

# Check if backup was successful
if [ $? -eq 0 ]; then
    print_status "Database backup completed successfully"
else
    print_error "Database backup failed"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run tests (if any)
if [ -f "test" ] || [ -f "tests" ]; then
    print_status "Running tests..."
    npm test
fi

# Build frontend (if needed)
if [ -d "public" ]; then
    print_status "Frontend files ready for deployment"
fi

print_status "Deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Push your code to your deployment platform"
echo "2. Set up environment variables for production"
echo "3. Configure persistent storage for database"
echo ""
echo "For Railway deployment:"
echo "  railway up"
echo ""
echo "For Heroku deployment:"
echo "  git push heroku main"
echo ""
echo "For manual deployment:"
echo "  node server.js" 