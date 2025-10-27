#!/bin/bash

# Test Cloudflare API Token Script

echo "🔍 Testing Cloudflare API Token"
echo "==============================="
echo ""

# Load the token from .env.local
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Loaded token from .env.local"
else
    echo "❌ .env.local file not found"
    exit 1
fi

echo "Token: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo ""

# Test the token with Cloudflare API
echo "🧪 Testing token with Cloudflare API..."
response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

echo "Response: $response"
echo ""

# Check if successful
if echo "$response" | grep -q '"success":true'; then
    echo "✅ Token is working!"
    echo ""
    echo "🚀 Ready to deploy! Run:"
    echo "   ./deploy.sh"
else
    echo "❌ Token test failed"
    echo ""
    echo "🔧 Possible issues:"
    echo "1. Token permissions are still incorrect"
    echo "2. Token is expired or invalid"
    echo "3. Network connectivity issues"
    echo ""
    echo "💡 Try:"
    echo "1. Check token permissions at: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Create a new token with these permissions:"
    echo "   - Account: Cloudflare D1:Edit"
    echo "   - Account: Cloudflare Workers:Edit"
    echo "   - Account: Account Settings:Read"
    echo "   - User: User Details:Read"
    echo "   - Zone: Zone:Read"
    echo "   - Zone: Zone Settings:Edit"
fi
