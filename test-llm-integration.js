#!/usr/bin/env node

/**
 * Test script for UncleSense LLM Integration
 * Tests the enhanced data extraction and spending analysis agents with Hugging Face LLMs
 */

import { DataExtractionAgent } from './src/lib/agents/data-extraction.js';
import { SpendingAnalysisAgent } from './src/lib/agents/spending-analysis.js';
import { AgentOrchestrator } from './src/lib/orchestrator/agent-orchestrator.js';
import { HuggingFaceClient, MODELS } from './src/lib/huggingface/client.js';

// Sample transaction data for testing
const sampleTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'NETFLIX.COM',
    amount: -15.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'AMAZON.COM*123',
    amount: -45.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'STARBUCKS COFFEE',
    amount: -5.75,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'SHELL OIL 12345',
    amount: -52.30,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'WHOLE FOODS MARKET',
    amount: -89.45,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '6',
    date: '2024-01-10',
    description: 'SALARY DEPOSIT',
    amount: 3500.00,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '7',
    date: '2024-01-09',
    description: 'SPOTIFY PREMIUM',
    amount: -9.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '8',
    date: '2024-01-08',
    description: 'UBER RIDE',
    amount: -12.50,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '9',
    date: '2024-01-07',
    description: 'APPLE.COM/BILL',
    amount: -2.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '10',
    date: '2024-01-06',
    description: 'TARGET STORE',
    amount: -67.89,
    category: '',
    merchant: '',
    account: 'checking'
  }
];

async function testHuggingFaceClient() {
  console.log('🧪 Testing HuggingFace Client...');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY || 'test-key';
  const client = new HuggingFaceClient(apiKey);
  
  try {
    // Test basic text generation
    console.log('  📝 Testing basic text generation...');
    const basicResponse = await client.generateText(MODELS.FLAN_T5_BASE, 'What is financial planning?', {
      maxTokens: 100,
      temperature: 0.7
    });
    console.log('  ✅ Basic response:', basicResponse.substring(0, 100) + '...');
    
    // Test financial insight generation
    console.log('  💡 Testing financial insight generation...');
    const insightResponse = await client.generateFinancialInsight('Analyze this spending pattern: $500 groceries, $200 dining, $100 transportation', {
      maxTokens: 150,
      temperature: 0.6
    });
    console.log('  ✅ Insight response:', insightResponse.substring(0, 100) + '...');
    
    // Test financial recommendations
    console.log('  🎯 Testing financial recommendations...');
    const recommendationResponse = await client.generateFinancialRecommendations('Monthly income: $4000, Monthly expenses: $3500', {
      maxTokens: 150,
      temperature: 0.6
    });
    console.log('  ✅ Recommendation response:', recommendationResponse.substring(0, 100) + '...');
    
    console.log('  ✅ HuggingFace Client tests passed!\n');
    return true;
  } catch (error) {
    console.error('  ❌ HuggingFace Client test failed:', error.message);
    console.log('  ℹ️  This is expected if no API key is provided - fallback methods will be used\n');
    return false;
  }
}

async function testDataExtractionAgent() {
  console.log('🧪 Testing Data Extraction Agent...');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY || 'test-key';
  const agent = new DataExtractionAgent(apiKey);
  
  try {
    console.log('  📊 Processing sample transactions...');
    const result = await agent.execute(sampleTransactions);
    
    console.log('  📈 Results:');
    console.log(`    - Agent Type: ${result.agent_type}`);
    console.log(`    - Insights Generated: ${result.insights.length}`);
    console.log(`    - Total Transactions: ${result.metadata?.summary?.total_transactions || 'N/A'}`);
    console.log(`    - Categories Found: ${result.metadata?.summary?.categories_found?.length || 'N/A'}`);
    console.log(`    - Data Quality Score: ${result.metadata?.summary?.data_quality_score || 'N/A'}`);
    
    console.log('  💡 Sample Insights:');
    result.insights.slice(0, 3).forEach((insight, index) => {
      console.log(`    ${index + 1}. ${insight.title}: ${insight.description.substring(0, 80)}...`);
    });
    
    console.log('  ✅ Data Extraction Agent tests passed!\n');
    return true;
  } catch (error) {
    console.error('  ❌ Data Extraction Agent test failed:', error.message);
    return false;
  }
}

async function testSpendingAnalysisAgent() {
  console.log('🧪 Testing Spending Analysis Agent...');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY || 'test-key';
  const agent = new SpendingAnalysisAgent(apiKey);
  
  try {
    console.log('  💰 Analyzing spending patterns...');
    const result = await agent.execute(sampleTransactions);
    
    console.log('  📈 Results:');
    console.log(`    - Agent Type: ${result.agent_type}`);
    console.log(`    - Insights Generated: ${result.insights.length}`);
    console.log(`    - Analysis Method: ${result.metadata?.analysis_method || 'N/A'}`);
    console.log(`    - LLM Insights: ${result.metadata?.llm_generated_insights || 'N/A'}`);
    
    console.log('  💡 Sample Insights:');
    result.insights.slice(0, 3).forEach((insight, index) => {
      console.log(`    ${index + 1}. ${insight.title}: ${insight.description.substring(0, 80)}...`);
    });
    
    console.log('  ✅ Spending Analysis Agent tests passed!\n');
    return true;
  } catch (error) {
    console.error('  ❌ Spending Analysis Agent test failed:', error.message);
    return false;
  }
}

async function testAgentOrchestrator() {
  console.log('🧪 Testing Agent Orchestrator...');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY || 'test-key';
  const orchestrator = new AgentOrchestrator(apiKey);
  
  try {
    console.log('  🎭 Running full analysis workflow...');
    const result = await orchestrator.executeAnalysis('test-session-123', sampleTransactions);
    
    console.log('  📈 Results:');
    console.log(`    - Session ID: ${result.session_id}`);
    console.log(`    - Current Step: ${result.current_step}`);
    console.log(`    - Agent Responses: ${result.agent_responses?.length || 0}`);
    console.log(`    - Uncle Response: ${result.uncle_response ? 'Generated' : 'Not generated'}`);
    
    console.log('  💡 Agent Status:');
    const status = orchestrator.getAgentStatus();
    Object.entries(status).forEach(([agent, status]) => {
      console.log(`    - ${agent}: ${status}`);
    });
    
    console.log('  ✅ Agent Orchestrator tests passed!\n');
    return true;
  } catch (error) {
    console.error('  ❌ Agent Orchestrator test failed:', error.message);
    return false;
  }
}

async function testLLMIntegration() {
  console.log('🚀 UncleSense LLM Integration Test Suite');
  console.log('==========================================\n');
  
  const results = {
    huggingfaceClient: false,
    dataExtractionAgent: false,
    spendingAnalysisAgent: false,
    agentOrchestrator: false
  };
  
  // Run all tests
  results.huggingfaceClient = await testHuggingFaceClient();
  results.dataExtractionAgent = await testDataExtractionAgent();
  results.spendingAnalysisAgent = await testSpendingAnalysisAgent();
  results.agentOrchestrator = await testAgentOrchestrator();
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! LLM integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.');
    console.log('💡 Note: Tests may fail if HUGGINGFACE_API_KEY is not set - this is expected.');
    console.log('   The agents will use fallback methods when API access is unavailable.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Set HUGGINGFACE_API_KEY environment variable for full LLM functionality');
  console.log('2. Test with real transaction data');
  console.log('3. Monitor performance and adjust model parameters as needed');
  console.log('4. Consider implementing caching for better performance');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testLLMIntegration().catch(console.error);
}

export { testLLMIntegration, testHuggingFaceClient, testDataExtractionAgent, testSpendingAnalysisAgent, testAgentOrchestrator };
