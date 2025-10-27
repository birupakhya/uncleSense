#!/bin/bash

# Update Cloudflare API Token Script

echo "🔑 Update Cloudflare API Token"
echo "=============================="
echo ""

echo "Current token in .env.local:"
grep CLOUDFLARE_API_TOKEN .env.local
echo ""

echo "📋 To update your token:"
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Copy your NEW token"
echo "3. Run this command:"
echo "   sed -i '' 's/CLOUDFLARE_API_TOKEN=.*/CLOUDFLARE_API_TOKEN=YOUR_NEW_TOKEN_HERE/' .env.local"
echo ""
echo "4. Or edit the file manually:"
echo "   nano .env.local"
echo ""
echo "5. Then run deployment again:"
echo "   ./deploy.sh"
echo ""

# Show current token (first 10 characters for security)
current_token=$(grep CLOUDFLARE_API_TOKEN .env.local | cut -d'=' -f2)
echo "Current token: ${current_token:0:10}..."
echo ""

read -p "Do you want to edit the file now? (y/N): " edit_choice
if [[ "$edit_choice" =~ ^[Yy]$ ]]; then
    nano .env.local
    echo ""
    echo "✅ File updated! Now run: ./deploy.sh"
fi
