#!/bin/bash

# UncleSense Environment Setup Script

echo "🔧 UncleSense Environment Setup"
echo "================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    echo "Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.local file"
        exit 0
    fi
fi

# Copy template to .env.local
echo "📋 Creating .env.local from template..."
cp env.template .env.local

echo "✅ Created .env.local file"
echo ""
echo "🔑 Next steps:"
echo "1. Edit .env.local and replace the placeholder values:"
echo "   - CLOUDFLARE_API_TOKEN=your_actual_token"
echo "   - HUGGINGFACE_API_KEY=hf_your_actual_key"
echo ""
echo "2. Get your API keys:"
echo "   - Cloudflare: https://dash.cloudflare.com/profile/api-tokens"
echo "   - HuggingFace: https://huggingface.co/settings/tokens"
echo ""
echo "3. Test your setup:"
echo "   ./setup-keys.sh"
echo ""
echo "4. Deploy UncleSense:"
echo "   ./deploy.sh"
echo ""

# Make the file readable
chmod 600 .env.local

echo "🔒 Set .env.local permissions to 600 (readable only by you)"
