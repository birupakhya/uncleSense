// Spending Analysis Agent - Analyzes spending patterns and trends

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class SpendingAnalysisAgent extends BaseAgent {
  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    const systemPrompt = `You are a financial spending analyst. Analyze the provided transactions to identify spending patterns, trends, and insights.

Your analysis should include:
1. Spending by category breakdown
2. Monthly/weekly spending trends
3. Comparison with previous periods (if available)
4. Identification of spending spikes or unusual patterns
5. Budget recommendations based on spending patterns

Respond with a JSON object containing:
{
  "spending_by_category": {
    "category_name": {
      "total_amount": 0,
      "transaction_count": 0,
      "average_transaction": 0,
      "percentage_of_total": 0
    }
  },
  "trends": {
    "monthly_spending": [],
    "weekly_patterns": {},
    "spending_growth_rate": 0
  },
  "insights": [
    {
      "type": "spending_spike" | "budget_exceeded" | "saving_opportunity",
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "high" | "medium" | "low",
      "recommendation": "Actionable recommendation"
    }
  ],
  "summary": {
    "total_spending": 0,
    "average_daily_spending": 0,
    "top_spending_category": "",
    "spending_efficiency_score": 0.85
  }
}`;

    const transactionData = transactions.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
    }));

    const prompt = this.formatPrompt(systemPrompt, JSON.stringify(transactionData));
    
    try {
      const response = await this.generateResponse(prompt, { maxTokens: 2000 });
      const parsedResponse = JSON.parse(response);
      
      const insights = [
        this.createInsight(
          'Spending Analysis Complete',
          `Analyzed spending patterns across ${Object.keys(parsedResponse.spending_by_category).length} categories.`,
          'positive',
          {
            'Total Spending': parsedResponse.summary.total_spending,
            'Average Daily': parsedResponse.summary.average_daily_spending,
            'Efficiency Score': Math.round(parsedResponse.summary.spending_efficiency_score * 100),
          }
        )
      ];

      // Add specific insights from the analysis
      if (parsedResponse.insights && parsedResponse.insights.length > 0) {
        parsedResponse.insights.forEach((insight: any) => {
          insights.push(this.createInsight(
            insight.title,
            insight.description,
            insight.impact === 'high' ? 'negative' : insight.impact === 'low' ? 'positive' : 'neutral',
            undefined,
            insight.recommendation ? [insight.recommendation] : undefined
          ));
        });
      }
      
      return {
        agent_type: 'spending_analysis',
        insights,
        metadata: parsedResponse,
      };
    } catch (error) {
      console.error('Spending Analysis Agent error:', error);
      
      return {
        agent_type: 'spending_analysis',
        insights: [
          this.createInsight(
            'Spending Analysis Failed',
            'Unable to analyze spending patterns due to processing error.',
            'negative'
          )
        ],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}
