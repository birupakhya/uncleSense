#!/bin/bash

echo "🔑 Update HuggingFace API Key"
echo "============================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "   Run ./setup-env.sh first to create the environment file."
    exit 1
fi

echo "📝 Enter your new HuggingFace API key (starts with 'hf_'):"
read -p "API Key: " new_key

if [ -z "$new_key" ]; then
    echo "❌ No API key provided!"
    exit 1
fi

if [[ ! $new_key =~ ^hf_ ]]; then
    echo "⚠️  Warning: The key doesn't start with 'hf_' - are you sure it's correct?"
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled."
        exit 1
    fi
fi

# Update the key in .env.local
if grep -q "VITE_HUGGINGFACE_API_KEY" .env.local; then
    # Replace existing key
    sed -i.bak "s/VITE_HUGGINGFACE_API_KEY=.*/VITE_HUGGINGFACE_API_KEY=$new_key/" .env.local
    echo "✅ Updated existing HuggingFace API key in .env.local"
else
    # Add new key
    echo "VITE_HUGGINGFACE_API_KEY=$new_key" >> .env.local
    echo "✅ Added HuggingFace API key to .env.local"
fi

echo ""
echo "🧪 Testing the new API key..."

# Test the API key
test_response=$(curl -H "Authorization: Bearer $new_key" https://huggingface.co/api/whoami -s 2>/dev/null)

if echo "$test_response" | grep -q "error"; then
    echo "❌ API key test failed!"
    echo "   Response: $test_response"
    echo ""
    echo "💡 Make sure:"
    echo "   - The key is correct and complete"
    echo "   - You're logged into the right HuggingFace account"
    echo "   - The key has 'Read' permissions"
    exit 1
else
    echo "✅ API key test successful!"
    echo "   Response: $test_response"
fi

echo ""
echo "🚀 Next steps:"
echo "   1. Deploy the updated worker: npm run worker:deploy"
echo "   2. Test the analysis: curl -X POST https://unclesense-api.ucancallmebiru.workers.dev/api/analyze -H 'Content-Type: application/json' -d '{\"session_id\":\"session-1761546458843\"}'"
echo ""
echo "🎉 HuggingFace API key updated successfully!"
