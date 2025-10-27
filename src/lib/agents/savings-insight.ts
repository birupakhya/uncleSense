// Savings Insight Agent - Identifies saving opportunities and positive behaviors

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class SavingsInsightAgent extends BaseAgent {
  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    const systemPrompt = `You are a financial savings advisor. Analyze the provided transactions to identify saving opportunities and highlight positive financial behaviors.

Your analysis should focus on:
1. Identifying unnecessary or excessive spending
2. Finding subscription services that could be reduced
3. Highlighting positive saving behaviors
4. Calculating potential savings opportunities
5. Recommending specific actions to increase savings

Respond with a JSON object containing:
{
  "saving_opportunities": [
    {
      "type": "subscription" | "dining_out" | "impulse_purchase" | "premium_service",
      "title": "Opportunity title",
      "description": "Description of the opportunity",
      "potential_monthly_savings": 0,
      "potential_yearly_savings": 0,
      "difficulty": "easy" | "medium" | "hard",
      "action_required": "Specific action to take"
    }
  ],
  "positive_behaviors": [
    {
      "behavior": "Description of positive behavior",
      "impact": "Description of positive impact",
      "encouragement": "Encouraging message"
    }
  ],
  "subscription_analysis": {
    "total_monthly_subscriptions": 0,
    "subscriptions": [],
    "potential_savings": 0
  },
  "summary": {
    "total_potential_monthly_savings": 0,
    "total_potential_yearly_savings": 0,
    "savings_score": 0.75,
    "positive_behaviors_count": 0
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
          'Savings Analysis Complete',
          `Found ${parsedResponse.saving_opportunities.length} saving opportunities and ${parsedResponse.summary.positive_behaviors_count} positive behaviors.`,
          'positive',
          {
            'Monthly Savings Potential': parsedResponse.summary.total_potential_monthly_savings,
            'Yearly Savings Potential': parsedResponse.summary.total_potential_yearly_savings,
            'Savings Score': Math.round(parsedResponse.summary.savings_score * 100),
          }
        )
      ];

      // Add specific saving opportunities
      if (parsedResponse.saving_opportunities && parsedResponse.saving_opportunities.length > 0) {
        parsedResponse.saving_opportunities.forEach((opportunity: any) => {
          insights.push(this.createInsight(
            opportunity.title,
            opportunity.description,
            opportunity.difficulty === 'easy' ? 'positive' : opportunity.difficulty === 'hard' ? 'negative' : 'neutral',
            {
              'Monthly Savings': opportunity.potential_monthly_savings,
              'Yearly Savings': opportunity.potential_yearly_savings,
            },
            opportunity.action_required ? [opportunity.action_required] : undefined
          ));
        });
      }

      // Add positive behaviors
      if (parsedResponse.positive_behaviors && parsedResponse.positive_behaviors.length > 0) {
        parsedResponse.positive_behaviors.forEach((behavior: any) => {
          insights.push(this.createInsight(
            'Great Financial Behavior!',
            behavior.behavior,
            'positive',
            undefined,
            [behavior.encouragement]
          ));
        });
      }
      
      return {
        agent_type: 'savings_insight',
        insights,
        metadata: parsedResponse,
      };
    } catch (error) {
      console.error('Savings Insight Agent error:', error);
      
      return {
        agent_type: 'savings_insight',
        insights: [
          this.createInsight(
            'Savings Analysis Failed',
            'Unable to analyze saving opportunities due to processing error.',
            'negative'
          )
        ],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}
