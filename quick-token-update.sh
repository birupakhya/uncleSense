#!/bin/bash

# Quick Token Update and Test Script

echo "🔄 Quick Token Update and Test"
echo "==============================="
echo ""

echo "📋 Instructions:"
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Create a NEW token (don't edit the existing one)"
echo "3. Use these EXACT settings:"
echo ""
echo "   Token Name: UncleSense-Deploy-$(date +%s)"
echo "   Permissions:"
echo "   ✅ Account: Cloudflare D1:Edit"
echo "   ✅ Account: Cloudflare Workers:Edit"
echo "   ✅ Account: Account Settings:Read"
echo "   ✅ User: User Details:Read"
echo "   ✅ Zone: Zone:Read"
echo "   ✅ Zone: Zone Settings:Edit"
echo ""
echo "   Account Resources: Include - Ucancallmebiru@gmail.com's Account"
echo "   Zone Resources: Include - All zones"
echo ""
echo "4. Copy the NEW token"
echo ""

read -p "Paste your NEW token here: " NEW_TOKEN

if [ -z "$NEW_TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

echo ""
echo "🔄 Updating .env.local with new token..."

# Update the token in .env.local
sed -i '' "s/CLOUDFLARE_API_TOKEN=.*/CLOUDFLARE_API_TOKEN=$NEW_TOKEN/" .env.local

echo "✅ Token updated in .env.local"
echo ""

# Test the new token
echo "🧪 Testing new token..."
export CLOUDFLARE_API_TOKEN="$NEW_TOKEN"

# Test user endpoint
user_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$user_response" | grep -q '"success":true'; then
    echo "✅ /user endpoint works"
else
    echo "❌ /user endpoint failed"
    echo "$user_response"
    exit 1
fi

# Test memberships endpoint
memberships_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/memberships" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$memberships_response" | grep -q '"success":true'; then
    echo "✅ /memberships endpoint works!"
    echo ""
    echo "🚀 Ready to deploy! Running deployment..."
    echo ""
    ./deploy.sh
else
    echo "❌ /memberships endpoint still failing"
    echo "$memberships_response"
    echo ""
    echo "💡 The token might need additional permissions or there might be an account-level issue."
    echo "   Try contacting Cloudflare support or using a different account."
fi
