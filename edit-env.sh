#!/bin/bash

# UncleSense Environment Editor
# Helps you edit the .env.local file with your API keys

echo "🔧 UncleSense Environment Editor"
echo "================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Run ./setup-env.sh first to create it."
    exit 1
fi

echo "📋 Current .env.local contents:"
echo "-------------------------------"
cat .env.local
echo ""
echo "-------------------------------"
echo ""

echo "🔑 Ready to edit your API keys!"
echo ""
echo "Choose your editor:"
echo "1) nano (simple)"
echo "2) vim (advanced)"
echo "3) code (VS Code)"
echo "4) open (default system editor)"
echo "5) Show instructions only"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        nano .env.local
        ;;
    2)
        vim .env.local
        ;;
    3)
        code .env.local
        ;;
    4)
        open .env.local
        ;;
    5)
        echo ""
        echo "📝 Instructions:"
        echo "1. Replace 'your_cloudflare_token_here' with your actual Cloudflare API token"
        echo "2. Replace 'hf_your_huggingface_key_here' with your actual HuggingFace API key"
        echo "3. Save the file"
        echo ""
        echo "🔗 Get your API keys:"
        echo "- Cloudflare: https://dash.cloudflare.com/profile/api-tokens"
        echo "- HuggingFace: https://huggingface.co/settings/tokens"
        ;;
    *)
        echo "Invalid choice. Opening with nano..."
        nano .env.local
        ;;
esac

echo ""
echo "✅ Done! You can now run:"
echo "   ./deploy.sh"
