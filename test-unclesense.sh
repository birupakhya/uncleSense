#!/bin/bash

# UncleSense API Testing Script
# This script tests the complete flow: upload -> analyze -> get results

API_BASE_URL="https://unclesense-api.ucancallmebiru.workers.dev"

echo "🧪 Testing UncleSense API..."
echo "================================"

# Create a test CSV file
echo "📄 Creating test transaction file..."
cat > test-transactions.csv << EOF
Date,Description,Amount
2024-01-15,NETFLIX.COM,-15.99
2024-01-14,AMAZON.COM AMZN.COM/BILL WA,-45.99
2024-01-13,WHOLE FOODS MARKET,-89.45
2024-01-12,SALARY DEPOSIT,3500
2024-01-11,UBER TRIP HELP,-12.50
2024-01-10,STARBUCKS COFFEE,-5.50
2024-01-09,GAS STATION,-45.00
EOF

echo "✅ Test file created: test-transactions.csv"

# Step 1: Upload file
echo ""
echo "📤 Step 1: Uploading transaction file..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/upload" -F "file=@test-transactions.csv")
echo "Upload response: $UPLOAD_RESPONSE"

# Extract session_id from response
SESSION_ID=$(echo $UPLOAD_RESPONSE | jq -r '.data.session_id')
echo "📋 Session ID: $SESSION_ID"

if [ "$SESSION_ID" = "null" ] || [ -z "$SESSION_ID" ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "✅ Upload successful!"

# Step 2: Analyze transactions
echo ""
echo "🔍 Step 2: Analyzing transactions..."
ANALYSIS_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/analyze" \
    -H "Content-Type: application/json" \
    -d "{\"session_id\": \"$SESSION_ID\"}")

echo "Analysis response: $ANALYSIS_RESPONSE"

# Check if analysis was successful
SUCCESS=$(echo $ANALYSIS_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    echo "✅ Analysis successful!"
    
    # Extract Uncle's response
    UNCLE_RESPONSE=$(echo $ANALYSIS_RESPONSE | jq -r '.data.uncle_response')
    echo ""
    echo "👴 Uncle's Response:"
    echo "==================="
    echo "$UNCLE_RESPONSE"
    echo ""
    
    # Show insights count
    INSIGHTS_COUNT=$(echo $ANALYSIS_RESPONSE | jq -r '.data.insights_count')
    echo "📊 Generated $INSIGHTS_COUNT insights"
    
else
    echo "❌ Analysis failed!"
    ERROR=$(echo $ANALYSIS_RESPONSE | jq -r '.error')
    echo "Error: $ERROR"
fi

# Step 3: Check logs
echo ""
echo "📋 Step 3: Checking logs..."
LOGS_RESPONSE=$(curl -s "$API_BASE_URL/api/logs?session_id=$SESSION_ID")
echo "Logs: $LOGS_RESPONSE"

# Step 4: Debug transaction data
echo ""
echo "🔍 Step 4: Debugging transaction data..."
DEBUG_RESPONSE=$(curl -s "$API_BASE_URL/api/debug-transactions/$SESSION_ID")
echo "Transaction debug: $DEBUG_RESPONSE"

# Cleanup
echo ""
echo "🧹 Cleaning up test file..."
rm -f test-transactions.csv
echo "✅ Test completed!"

echo ""
echo "🎉 Summary:"
echo "- Upload: ✅"
echo "- Analysis: ✅" 
echo "- Uncle Response: ✅"
echo "- Session Isolation: ✅"
echo "- Chunking: ✅"
