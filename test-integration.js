#!/usr/bin/env node

// Simple test script to verify Hugging Face integration works
import { config } from 'dotenv';
config({ path: '.env.local' });

const API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.error('❌ No HUGGINGFACE_API_KEY found in environment');
  process.exit(1);
}

console.log('🧪 Testing Hugging Face API Integration');
console.log('=' .repeat(50));
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
console.log();

async function testHuggingFaceAPI() {
  const testTexts = [
    "AMAZON.COM AMZN.COM/BILL WA -45.99",
    "SALARY DEPOSIT +3500.00",
    "NETFLIX.COM -15.99",
    "WHOLE FOODS MARKET -89.45"
  ];

  for (const text of testTexts) {
    console.log(`📝 Testing: "${text}"`);
    
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/soleimanian/financial-roberta-large-sentiment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const results = Array.isArray(data[0]) ? data[0] : data;
          if (results.length > 0) {
            const result = results[0];
            console.log(`✅ Sentiment: ${result.label} (confidence: ${(result.score * 100).toFixed(1)}%)`);
          }
        }
      } else {
        console.log(`❌ Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    console.log();
  }
}

// Test the worker API endpoints
async function testWorkerAPI() {
  console.log('🔧 Testing Worker API Endpoints');
  console.log('-'.repeat(30));
  
  // Test health endpoint
  try {
    const healthResponse = await fetch('https://unclesense-api.ucancallmebiru.workers.dev/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`✅ Health endpoint: ${healthData.status}`);
    } else {
      console.log(`❌ Health endpoint failed: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Health endpoint error: ${error.message}`);
  }
  
  // Test logs endpoint
  try {
    const logsResponse = await fetch('https://unclesense-api.ucancallmebiru.workers.dev/api/logs?session_id=test123');
    if (logsResponse.ok) {
      const logsData = await logsResponse.json();
      console.log(`✅ Logs endpoint: ${logsData.logs?.length || 0} logs`);
    } else {
      console.log(`❌ Logs endpoint failed: ${logsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Logs endpoint error: ${error.message}`);
  }
  
  console.log();
}

// Test file upload endpoint
async function testFileUpload() {
  console.log('📁 Testing File Upload Endpoint');
  console.log('-'.repeat(30));
  
  // Create a simple CSV content
  const csvContent = `Date,Description,Amount
2024-01-15,AMAZON.COM AMZN.COM/BILL WA,-45.99
2024-01-15,NETFLIX.COM,-15.99
2024-01-14,SALARY DEPOSIT,3500.00`;
  
  const formData = new FormData();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  formData.append('file', blob, 'test-transactions.csv');
  
  try {
    const uploadResponse = await fetch('https://unclesense-api.ucancallmebiru.workers.dev/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log(`✅ File upload successful: ${uploadData.session_id}`);
      
      // Test analysis endpoint
      if (uploadData.session_id) {
        console.log(`🔍 Testing analysis with session: ${uploadData.session_id}`);
        
        const analysisResponse = await fetch('https://unclesense-api.ucancallmebiru.workers.dev/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: uploadData.session_id,
          }),
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          console.log(`✅ Analysis successful: ${analysisData.insights?.length || 0} insights`);
        } else {
          console.log(`❌ Analysis failed: ${analysisResponse.status}`);
        }
      }
    } else {
      console.log(`❌ File upload failed: ${uploadResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ File upload error: ${error.message}`);
  }
  
  console.log();
}

// Run all tests
async function runTests() {
  await testHuggingFaceAPI();
  await testWorkerAPI();
  await testFileUpload();
  
  console.log('🎉 Testing Complete!');
  console.log('=' .repeat(50));
}

runTests().catch(console.error);
