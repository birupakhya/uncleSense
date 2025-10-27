#!/bin/bash

# UncleSense Deployment Script
# This script automates the deployment process to Cloudflare

set -e

echo "🚀 Starting UncleSense deployment..."

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📋 Loading environment variables from .env.local..."
    # Load only the essential variables manually to avoid syntax issues
    export CLOUDFLARE_API_TOKEN=$(grep "^CLOUDFLARE_API_TOKEN=" .env.local | cut -d'=' -f2)
    export HUGGINGFACE_API_KEY=$(grep "^HUGGINGFACE_API_KEY=" .env.local | cut -d'=' -f2)
fi

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set"
    echo "Please set your Cloudflare API token:"
    echo "export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo "Or edit .env.local file"
    exit 1
fi

# Check if HuggingFace API key is set
if [ -z "$HUGGINGFACE_API_KEY" ]; then
    echo "❌ Error: HUGGINGFACE_API_KEY environment variable is not set"
    echo "Please set your HuggingFace API key:"
    echo "export HUGGINGFACE_API_KEY='your_key_here'"
    echo "Or edit .env.local file"
    exit 1
fi

echo "✅ Environment variables are set"

# Build the frontend
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Deploy the worker
echo "🔧 Deploying Cloudflare Worker..."
npm run worker:deploy

if [ $? -eq 0 ]; then
    echo "✅ Worker deployment successful"
else
    echo "❌ Worker deployment failed"
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate:prod

if [ $? -eq 0 ]; then
    echo "✅ Database migrations successful"
else
    echo "❌ Database migrations failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy the frontend to Cloudflare Pages:"
echo "   - Go to https://dash.cloudflare.com/pages"
echo "   - Create a new project"
echo "   - Upload the 'dist' folder"
echo ""
echo "2. Set environment variables in Cloudflare Pages:"
echo "   - VITE_API_BASE_URL: https://unclesense-api.your-subdomain.workers.dev"
echo "   - VITE_HUGGINGFACE_API_KEY: $HUGGINGFACE_API_KEY"
echo ""
echo "3. Test your deployment!"
echo ""
echo "Your API is now available at: https://unclesense-api.your-subdomain.workers.dev"
