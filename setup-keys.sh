#!/bin/bash

# UncleSense API Keys Setup Script

echo "🔑 UncleSense API Keys Setup"
echo "=============================="
echo ""

# Check if tokens are already set
if [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "✅ Cloudflare API Token is already set"
else
    echo "❌ Cloudflare API Token is not set"
fi

if [ ! -z "$HUGGINGFACE_API_KEY" ]; then
    echo "✅ HuggingFace API Key is already set"
else
    echo "❌ HuggingFace API Key is not set"
fi

echo ""
echo "📋 To get your API keys:"
echo ""
echo "🌐 Cloudflare API Token:"
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Click 'Create Token'"
echo "3. Use 'Custom token' template"
echo "4. Set permissions:"
echo "   - Account: Cloudflare D1:Edit"
echo "   - Zone: Zone:Read, Zone Settings:Edit"
echo "   - Account: Account Settings:Read"
echo "5. Copy the token and run:"
echo "   export CLOUDFLARE_API_TOKEN='your_token_here'"
echo ""
echo "🤗 HuggingFace API Key:"
echo "1. Go to: https://huggingface.co/settings/tokens"
echo "2. Click 'New token'"
echo "3. Name: 'UncleSense App'"
echo "4. Type: 'Read'"
echo "5. Copy the token and run:"
echo "   export HUGGINGFACE_API_KEY='hf_your_token_here'"
echo ""
echo "🚀 After setting both tokens, run:"
echo "   ./deploy.sh"
echo ""
echo "💡 Pro tip: Add these to your ~/.bashrc or ~/.zshrc for persistence:"
echo "   echo 'export CLOUDFLARE_API_TOKEN=\"your_token\"' >> ~/.bashrc"
echo "   echo 'export HUGGINGFACE_API_KEY=\"your_key\"' >> ~/.bashrc"
