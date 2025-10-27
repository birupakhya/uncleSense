#!/bin/bash

# Quick API Token Update Script

echo "🔑 Cloudflare API Token Update"
echo "=============================="
echo ""

echo "📋 Current token: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo ""

echo "🔧 To fix the authentication issue:"
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Edit your existing token or create a new one"
echo "3. Add these permissions:"
echo "   ✅ Account: Cloudflare D1:Edit"
echo "   ✅ Account: Cloudflare Workers:Edit"
echo "   ✅ Account: Account Settings:Read"
echo "   ✅ User: User Details:Read"
echo "   ✅ Zone: Zone:Read"
echo "   ✅ Zone: Zone Settings:Edit"
echo ""
echo "4. Copy the new token and run:"
echo "   export CLOUDFLARE_API_TOKEN='your_new_token'"
echo ""
echo "5. Then run deployment again:"
echo "   ./deploy.sh"
echo ""

# Check if token is set
if [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "💡 Current token permissions might be insufficient."
    echo "   The error suggests missing 'User Details:Read' permission."
fi
