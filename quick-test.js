// Quick test to verify the financial models integration works
import { DataExtractionAgent } from './src/lib/agents/data-extraction.js';

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
    description: 'AMZN Mktp US *23AB4',
    amount: -45.99,
    category: '',
    merchant: '',
    account: 'checking'
  }
];

async function quickTest() {
  console.log('🧪 Quick test of financial models integration...');
  
  try {
    const agent = new DataExtractionAgent();
    const result = await agent.execute(sampleTransactions);
    
    console.log('✅ Test passed!');
    console.log('Insights:', result.insights.length);
    console.log('Categories found:', result.metadata.summary.categories_found.length);
    console.log('Data quality score:', Math.round(result.metadata.summary.data_quality_score * 100) + '%');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

quickTest().then(success => {
  process.exit(success ? 0 : 1);
});
