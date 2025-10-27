// Savings Insight Agent - Identifies saving opportunities and positive behaviors

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class SavingsInsightAgent extends BaseAgent {
  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    try {
      // Use rule-based analysis instead of AI for reliability
      const analysis = this.analyzeSavingsOpportunities(transactions);
      
      return {
        agent_type: 'savings_insight',
        insights: [
          this.createInsight(
            'Savings Analysis Complete',
            `Found ${analysis.summary.potential_savings_count} saving opportunities worth $${analysis.summary.potential_monthly_savings.toFixed(2)} per month.`,
            'positive',
            {
              'Potential Monthly Savings': `$${analysis.summary.potential_monthly_savings.toFixed(2)}`,
              'Saving Opportunities': analysis.summary.potential_savings_count,
              'Current Savings Rate': `${analysis.summary.savings_rate.toFixed(1)}%`,
            }
          )
        ],
        metadata: analysis,
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

  private analyzeSavingsOpportunities(transactions: Transaction[]) {
    // Calculate income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    const subscriptions: Transaction[] = [];
    const diningExpenses: Transaction[] = [];
    const entertainmentExpenses: Transaction[] = [];
    
    transactions.forEach(t => {
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        totalExpenses += Math.abs(t.amount);
        
        // Categorize for analysis
        const desc = t.description.toLowerCase();
        if (desc.includes('subscription') || desc.includes('netflix') || desc.includes('spotify')) {
          subscriptions.push(t);
        }
        if (desc.includes('restaurant') || desc.includes('coffee') || desc.includes('dining')) {
          diningExpenses.push(t);
        }
        if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('gym')) {
          entertainmentExpenses.push(t);
        }
      }
    });

    // Calculate potential savings
    const subscriptionSavings = subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const diningSavings = diningExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0) * 0.3; // 30% reduction
    const entertainmentSavings = entertainmentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0) * 0.2; // 20% reduction
    
    const potentialMonthlySavings = subscriptionSavings + diningSavings + entertainmentSavings;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Generate recommendations
    const recommendations = [];
    if (subscriptions.length > 0) {
      recommendations.push(`Review ${subscriptions.length} subscriptions - potential savings: $${subscriptionSavings.toFixed(2)}/month`);
    }
    if (diningExpenses.length > 0) {
      recommendations.push(`Reduce dining out by 30% - potential savings: $${diningSavings.toFixed(2)}/month`);
    }
    if (entertainmentExpenses.length > 0) {
      recommendations.push(`Optimize entertainment spending - potential savings: $${entertainmentSavings.toFixed(2)}/month`);
    }

    return {
      potential_savings: {
        subscriptions: {
          amount: subscriptionSavings,
          count: subscriptions.length,
          recommendations: subscriptions.map(s => `Review ${s.description}`)
        },
        dining: {
          amount: diningSavings,
          count: diningExpenses.length,
          recommendations: ['Cook more meals at home', 'Use grocery store meal prep']
        },
        entertainment: {
          amount: entertainmentSavings,
          count: entertainmentExpenses.length,
          recommendations: ['Look for free entertainment options', 'Bundle services for discounts']
        }
      },
      positive_behaviors: [
        savingsRate > 20 ? 'Excellent savings rate!' : savingsRate > 10 ? 'Good savings rate' : 'Room for improvement',
        totalIncome > totalExpenses ? 'Living within your means' : 'Spending exceeds income'
      ],
      recommendations,
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        current_savings: totalIncome - totalExpenses,
        savings_rate: savingsRate,
        potential_monthly_savings: potentialMonthlySavings,
        potential_savings_count: recommendations.length,
        financial_health_score: Math.min(100, Math.max(0, savingsRate * 2))
      }
    };
  }
}