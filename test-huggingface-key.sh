#!/bin/bash

echo "🧪 Testing HuggingFace API Key"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "   Run ./setup-env.sh first to create the environment file."
    exit 1
fi

# Get the API key from .env.local
api_key=$(grep "HUGGINGFACE_API_KEY" .env.local | cut -d'=' -f2)

if [ -z "$api_key" ]; then
    echo "❌ No HuggingFace API key found in .env.local!"
    echo "   Run ./setup-huggingface-key.sh to get instructions."
    exit 1
fi

echo "🔍 Testing API key: ${api_key:0:10}..."
echo ""

# Test 1: Check if the key is valid
echo "1. Testing API key validity..."
whoami_response=$(curl -H "Authorization: Bearer $api_key" https://huggingface.co/api/whoami -s 2>/dev/null)

if echo "$whoami_response" | grep -q "error"; then
    echo "❌ API key is invalid!"
    echo "   Response: $whoami_response"
    echo ""
    echo "💡 Run ./setup-huggingface-key.sh to get a new key."
    exit 1
else
    echo "✅ API key is valid!"
    echo "   User: $whoami_response"
fi

echo ""

# Test 2: Test a simple model
echo "2. Testing model access..."
model_response=$(curl -X POST https://api-inference.huggingface.co/models/google/flan-t5-small \
  -H "Authorization: Bearer $api_key" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello, how are you?"}' \
  -s 2>/dev/null)

if echo "$model_response" | grep -q "error"; then
    echo "❌ Model access failed!"
    echo "   Response: $model_response"
    echo ""
    echo "💡 The model might be loading or unavailable. This is normal for free tier."
    echo "   The API key is valid, but models may take time to load."
else
    echo "✅ Model access successful!"
    echo "   Response: $model_response"
fi

echo ""
echo "🎉 HuggingFace API setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Deploy the worker: npm run worker:deploy"
echo "   2. Test the analysis with your new API key"
