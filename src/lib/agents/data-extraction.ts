// Data Extraction Agent - Categorizes and normalizes financial transactions

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class DataExtractionAgent extends BaseAgent {
  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    const systemPrompt = `You are a financial data analyst specializing in transaction categorization and normalization.

Your task is to analyze financial transactions and:
1. Categorize each transaction into appropriate spending categories
2. Extract merchant names and normalize them
3. Identify recurring patterns
4. Flag any unusual or suspicious transactions

Categories should include:
- Groceries & Food
- Dining & Restaurants  
- Transportation (Gas, Uber, etc.)
- Utilities & Bills
- Entertainment & Recreation
- Shopping & Retail
- Healthcare & Medical
- Insurance
- Subscriptions & Services
- Travel & Hotels
- Education
- Investments & Savings
- Income & Deposits
- Transfers
- Other

Respond with a JSON object containing:
{
  "categorized_transactions": [
    {
      "id": "transaction_id",
      "category": "category_name",
      "merchant": "normalized_merchant_name",
      "confidence": 0.95,
      "notes": "any relevant notes"
    }
  ],
  "patterns": {
    "recurring_transactions": [],
    "unusual_transactions": [],
    "merchant_summary": {}
  },
  "summary": {
    "total_transactions": 0,
    "categories_found": [],
    "data_quality_score": 0.95
  }
}`;

    const transactionData = transactions.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
    }));

    const prompt = this.formatPrompt(systemPrompt, JSON.stringify(transactionData));
    
    try {
      const response = await this.generateResponse(prompt, { maxTokens: 2000 });
      const parsedResponse = JSON.parse(response);
      
      return {
        agent_type: 'data_extraction',
        insights: [
          this.createInsight(
            'Transaction Analysis Complete',
            `Successfully categorized ${parsedResponse.summary.total_transactions} transactions across ${parsedResponse.summary.categories_found.length} categories.`,
            'positive',
            {
              'Total Transactions': parsedResponse.summary.total_transactions,
              'Categories Found': parsedResponse.summary.categories_found.length,
              'Data Quality Score': Math.round(parsedResponse.summary.data_quality_score * 100),
            }
          )
        ],
        metadata: parsedResponse,
      };
    } catch (error) {
      console.error('Data Extraction Agent error:', error);
      
      return {
        agent_type: 'data_extraction',
        insights: [
          this.createInsight(
            'Transaction Analysis Failed',
            'Unable to categorize transactions due to processing error.',
            'negative'
          )
        ],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}
