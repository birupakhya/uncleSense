#!/bin/bash

# Cloudflare Token Permission Checker

echo "🔍 Cloudflare Token Permission Analysis"
echo "======================================="
echo ""

# Load token
export CLOUDFLARE_API_TOKEN=$(grep "^CLOUDFLARE_API_TOKEN=" .env.local | cut -d'=' -f2)

echo "Token: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo ""

# Test user endpoint
echo "🧪 Testing /user endpoint..."
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

# Test memberships endpoint (this is what Wrangler needs)
echo "🧪 Testing /memberships endpoint..."
memberships_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/memberships" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

echo "Memberships response: $memberships_response"
echo ""

if echo "$memberships_response" | grep -q '"success":true'; then
    echo "✅ /memberships endpoint works - token should work for deployment!"
    echo ""
    echo "🚀 Try deployment again:"
    echo "   ./deploy.sh"
else
    echo "❌ /memberships endpoint failed"
    echo ""
    echo "🔧 The token needs additional permissions:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Edit your token"
    echo "3. Add these permissions:"
    echo "   ✅ User: User Details:Read"
    echo "   ✅ Account: Account Settings:Read"
    echo "   ✅ Account: Cloudflare Workers:Edit"
    echo "   ✅ Account: Cloudflare D1:Edit"
    echo ""
    echo "4. Save and try deployment again"
fi
