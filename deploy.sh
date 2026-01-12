#!/bin/bash

# Deployment script for Digital Ocean Droplet
# Run this script on your server after initial setup

set -e

echo "🚀 Starting deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create logs directory
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and set your JWT_SECRET!"
    echo "   Generate a secure secret: openssl rand -base64 32"
fi

# Stop existing PM2 process if running
pm2 stop jarrar-website 2>/dev/null || true
pm2 delete jarrar-website 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Deployment complete!"
echo ""
echo "Application is running on port 3000"
echo "Check status: pm2 status"
echo "View logs: pm2 logs jarrar-website"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update .env file with your JWT_SECRET"
echo "   2. Configure Nginx (see DEPLOYMENT.md)"
echo "   3. Setup SSL certificate (optional but recommended)"



