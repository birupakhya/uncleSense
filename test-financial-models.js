#!/usr/bin/env node

// Test script for Hugging Face financial models integration
// This script tests the data extraction agent with sample transaction data

import { DataExtractionAgent } from './src/lib/agents/data-extraction.js';
import type { Transaction } from './src/types/index.js';

// Sample transaction data for testing
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'AMZN Mktp US *23AB4',
    amount: -45.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '2',
    date: '2024-01-15',
    description: 'NETFLIX.COM',
    amount: -15.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '3',
    date: '2024-01-14',
    description: 'NETFLIX.COM',
    amount: -15.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '4',
    date: '2024-01-13',
    description: 'WHOLE FOODS MARKET',
    amount: -89.45,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '5',
    date: '2024-01-12',
    description: 'SHELL OIL 12345',
    amount: -52.30,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '6',
    date: '2024-01-11',
    description: 'UBER TRIP HELP',
    amount: -12.50,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '7',
    date: '2024-01-10',
    description: 'SALARY DEPOSIT',
    amount: 3500.00,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '8',
    date: '2024-01-09',
    description: 'NETFLIX.COM',
    amount: -15.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '9',
    date: '2024-01-08',
    description: 'SPOTIFY PREMIUM',
    amount: -9.99,
    category: '',
    merchant: '',
    account: 'checking'
  },
  {
    id: '10',
    date: '2024-01-07',
    description: 'TARGET T-1234',
    amount: -125.67,
    category: '',
    merchant: '',
    account: 'checking'
  }
];

async function testDataExtractionAgent() {
  console.log('🧪 Testing Hugging Face Financial Models Integration');
  console.log('=' .repeat(60));
  
  try {
    const agent = new DataExtractionAgent();
    
    console.log('📊 Processing sample transactions...');
    console.log(`Total transactions: ${sampleTransactions.length}`);
    console.log();
    
    const startTime = Date.now();
    const result = await agent.execute(sampleTransactions);
    const endTime = Date.now();
    
    console.log('✅ Analysis completed successfully!');
    console.log(`⏱️  Processing time: ${endTime - startTime}ms`);
    console.log();
    
    // Display insights
    console.log('📈 INSIGHTS:');
    console.log('-'.repeat(40));
    result.insights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight.title}`);
      console.log(`   ${insight.description}`);
      if (insight.metadata) {
        Object.entries(insight.metadata).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      console.log();
    });
    
    // Display categorized transactions
    console.log('🏷️  CATEGORIZED TRANSACTIONS:');
    console.log('-'.repeat(40));
    const categorizedTransactions = result.metadata.categorized_transactions;
    categorizedTransactions.forEach((transaction, index) => {
      console.log(`${index + 1}. ${transaction.description}`);
      console.log(`   Category: ${transaction.category}`);
      console.log(`   Confidence: ${Math.round(transaction.confidence * 100)}%`);
      console.log(`   Amount: $${transaction.amount}`);
      console.log(`   Notes: ${transaction.notes}`);
      console.log();
    });
    
    // Display patterns
    console.log('🔄 RECURRING PATTERNS:');
    console.log('-'.repeat(40));
    const patterns = result.metadata.patterns;
    if (patterns.recurring_transactions.length > 0) {
      patterns.recurring_transactions.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.merchant}`);
        console.log(`   Frequency: ${pattern.frequency}`);
        console.log(`   Confidence: ${Math.round(pattern.confidence * 100)}%`);
        console.log(`   Average Amount: $${pattern.average_amount.toFixed(2)}`);
        console.log(`   Transactions: ${pattern.transaction_count}`);
        console.log();
      });
    } else {
      console.log('No recurring patterns detected.');
      console.log();
    }
    
    // Display unusual transactions
    console.log('⚠️  UNUSUAL TRANSACTIONS:');
    console.log('-'.repeat(40));
    if (patterns.unusual_transactions.length > 0) {
      patterns.unusual_transactions.forEach((unusual, index) => {
        console.log(`${index + 1}. ${unusual.merchant}`);
        console.log(`   Amount: $${unusual.amount}`);
        console.log(`   Date: ${unusual.date}`);
        console.log(`   Reason: ${unusual.reason}`);
        console.log(`   Z-Score: ${unusual.z_score.toFixed(2)}`);
        console.log();
      });
    } else {
      console.log('No unusual transactions detected.');
      console.log();
    }
    
    // Display summary
    console.log('📋 SUMMARY:');
    console.log('-'.repeat(40));
    const summary = result.metadata.summary;
    console.log(`Total Transactions: ${summary.total_transactions}`);
    console.log(`Categories Found: ${summary.categories_found.length}`);
    console.log(`Data Quality Score: ${Math.round(summary.data_quality_score * 100)}%`);
    console.log(`Recurring Patterns: ${summary.recurring_patterns}`);
    console.log(`Unusual Transactions: ${summary.unusual_transactions}`);
    
    console.log();
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

// Run the test
testDataExtractionAgent().catch(console.error);
