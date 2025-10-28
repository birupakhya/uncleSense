import { DataExtractionAgent } from './src/lib/agents/data-extraction.ts';

async function testDataExtraction() {
  console.log('Testing Data Extraction Agent...');
  
  const agent = new DataExtractionAgent(process.env.HUGGINGFACE_API_KEY);
  
  const testTransactions = [
    {
      id: '1',
      date: '2025-10-28',
      description: 'AMAZON.COM AMZN.COM/BILL WA',
      amount: -45.99
    },
    {
      id: '2', 
      date: '2025-10-28',
      description: 'STARBUCKS COFFEE',
      amount: -5.50
    }
  ];
  
  try {
    console.log('Starting data extraction...');
    const result = await agent.execute(testTransactions);
    console.log('Data extraction result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Data extraction failed:', error);
  }
}

testDataExtraction();
