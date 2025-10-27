#!/bin/bash

# Alternative Deployment with Custom Route

echo "🚀 Alternative Deployment Approach"
echo "==================================="
echo ""

echo "📋 If subdomain registration doesn't work, we can try:"
echo ""
echo "1. Deploy to a custom domain you own"
echo "2. Use Cloudflare Pages for the frontend"
echo "3. Deploy the API as a Cloudflare Function"
echo ""
echo "💡 Let's try deploying the frontend to Cloudflare Pages first:"
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

echo "🌐 Frontend Deployment Options:"
echo ""
echo "Option 1: Deploy to Cloudflare Pages"
echo "  1. Go to: https://dash.cloudflare.com/pages"
echo "  2. Click 'Create a project'"
echo "  3. Connect your GitHub repository"
echo "  4. Deploy from the dist/ folder"
echo ""
echo "Option 2: Deploy to Vercel (free tier)"
echo "  1. Go to: https://vercel.com"
echo "  2. Import your project"
echo "  3. Deploy automatically"
echo ""
echo "Option 3: Deploy to Netlify (free tier)"
echo "  1. Go to: https://netlify.com"
echo "  2. Drag and drop the dist/ folder"
echo "  3. Get instant deployment"
echo ""
echo "🎯 Once frontend is deployed, we can:"
echo "  1. Update the API URL in the frontend"
echo "  2. Test the full application"
echo "  3. Register the workers.dev subdomain later"
echo ""
echo "Would you like to try one of these options?"
