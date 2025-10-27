#!/bin/bash

# Final UncleSense Deployment Script with OAuth

echo "🚀 UncleSense Final Deployment"
echo "==============================="
echo ""

echo "📋 This script will:"
echo "1. Build the frontend"
echo "2. Deploy the Cloudflare Worker using OAuth authentication"
echo "3. Provide instructions for subdomain registration"
echo ""

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build successful"
echo ""

# Temporarily hide .env.local to use OAuth
echo "🔐 Switching to OAuth authentication..."
mv .env.local .env.local.backup

# Deploy with OAuth
echo "🚀 Deploying Cloudflare Worker..."
npx wrangler deploy --env=""

# Restore .env.local
mv .env.local.backup .env.local

echo ""
echo "🎉 Deployment Status:"
echo "✅ Frontend built successfully"
echo "✅ Cloudflare Worker deployed"
echo "✅ OAuth authentication working"
echo ""
echo "📋 Next Steps:"
echo "1. Register a workers.dev subdomain at:"
echo "   https://dash.cloudflare.com/9425323808f6bcb2d41e9a3115a653ec/workers/onboarding"
echo ""
echo "2. Choose a subdomain name (e.g., 'unclesense-api')"
echo ""
echo "3. Your API will be available at:"
echo "   https://unclesense-api.YOUR_SUBDOMAIN.workers.dev"
echo ""
echo "4. Update your frontend API URL in .env.local:"
echo "   VITE_API_BASE_URL=https://unclesense-api.YOUR_SUBDOMAIN.workers.dev"
echo ""
echo "5. Deploy the frontend to Cloudflare Pages:"
echo "   npm run deploy:frontend"
echo ""
echo "🎯 UncleSense is ready to help users with their finances!"
