#!/bin/bash

# Test specific Cloudflare API endpoints to identify missing permissions

echo "🔍 Testing Cloudflare API Endpoints"
echo "===================================="
echo ""

# Load token from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep CLOUDFLARE_API_TOKEN | cut -d '=' -f2- | tr -d '"')
    echo "✅ Loaded token from .env.local"
    echo "Token: ${CLOUDFLARE_API_TOKEN:0:10}..."
else
    echo "❌ .env.local not found"
    exit 1
fi

echo ""
echo "🧪 Testing various Cloudflare API endpoints..."
echo ""

# Test /user endpoint
echo "1. Testing /user endpoint..."
user_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$user_response" | grep -q '"success":true'; then
    echo "✅ /user endpoint works"
else
    echo "❌ /user endpoint failed"
    echo "$user_response"
fi

# Test /memberships endpoint
echo ""
echo "2. Testing /memberships endpoint..."
memberships_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/memberships" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$memberships_response" | grep -q '"success":true'; then
    echo "✅ /memberships endpoint works"
else
    echo "❌ /memberships endpoint failed"
    echo "$memberships_response"
fi

# Test /accounts endpoint
echo ""
echo "3. Testing /accounts endpoint..."
accounts_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$accounts_response" | grep -q '"success":true'; then
    echo "✅ /accounts endpoint works"
else
    echo "❌ /accounts endpoint failed"
    echo "$accounts_response"
fi

# Test /zones endpoint
echo ""
echo "4. Testing /zones endpoint..."
zones_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$zones_response" | grep -q '"success":true'; then
    echo "✅ /zones endpoint works"
else
    echo "❌ /zones endpoint failed"
    echo "$zones_response"
fi

echo ""
echo "💡 Analysis:"
echo "If /memberships fails but others work, the token might need:"
echo "- Account: Account Settings:Read (you have this)"
echo "- User: User Details:Read (you have this)"
echo "- Or there might be an account-level restriction"
echo ""
echo "🔧 Try creating a token with ALL permissions temporarily to test:"
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Create token with 'Edit zone DNS' template"
echo "3. This gives broader permissions for testing"
