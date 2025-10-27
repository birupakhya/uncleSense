// Spending Analysis Agent - Analyzes spending patterns and trends

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class SpendingAnalysisAgent extends BaseAgent {
  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    try {
      // Use rule-based analysis instead of AI for reliability
      const analysis = this.analyzeSpendingPatterns(transactions);
      
      return {
        agent_type: 'spending_analysis',
        insights: [
          this.createInsight(
            'Spending Analysis Complete',
            `Analyzed $${Math.abs(analysis.summary.total_spent).toFixed(2)} in spending across ${analysis.summary.category_count} categories.`,
            'positive',
            {
              'Total Spent': `$${Math.abs(analysis.summary.total_spent).toFixed(2)}`,
              'Daily Average': `$${analysis.summary.average_daily_spending.toFixed(2)}`,
              'Top Category': analysis.insights.highest_spending_category,
            }
          )
        ],
        metadata: analysis,
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

  private analyzeSpendingPatterns(transactions: Transaction[]) {
    // Calculate spending by category
    const spendingByCategory: Record<string, { total: number; count: number }> = {};
    let totalSpent = 0;
    let totalIncome = 0;
    
    transactions.forEach(t => {
      if (t.amount < 0) {
        totalSpent += Math.abs(t.amount);
        const category = t.category || 'Other';
        if (!spendingByCategory[category]) {
          spendingByCategory[category] = { total: 0, count: 0 };
        }
        spendingByCategory[category].total += Math.abs(t.amount);
        spendingByCategory[category].count += 1;
      } else {
        totalIncome += t.amount;
      }
    });

    // Find highest spending category
    const highestSpendingCategory = Object.entries(spendingByCategory)
      .sort(([,a], [,b]) => b.total - a.total)[0]?.[0] || 'None';

    // Calculate daily average (assuming 30 days for simplicity)
    const averageDailySpending = totalSpent / 30;

    // Calculate category breakdown with percentages
    const categoryBreakdown: Record<string, any> = {};
    Object.entries(spendingByCategory).forEach(([category, data]) => {
      categoryBreakdown[category] = {
        total_amount: data.total,
        transaction_count: data.count,
        average_transaction: data.total / data.count,
        percentage_of_total: (data.total / totalSpent) * 100
      };
    });

    return {
      spending_by_category: categoryBreakdown,
      trends: {
        monthly_spending: [totalSpent], // Simplified for now
        weekly_patterns: {},
        spending_growth_rate: 0
      },
      insights: {
        highest_spending_category: highestSpendingCategory,
        most_frequent_transaction: Object.entries(spendingByCategory)
          .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'None',
        unusual_spending: [],
        budget_recommendations: [
          `Consider reducing ${highestSpendingCategory} spending`,
          'Track daily expenses more closely'
        ]
      },
      summary: {
        total_spent: totalSpent,
        total_income: totalIncome,
        average_daily_spending: averageDailySpending,
        category_count: Object.keys(spendingByCategory).length,
        spending_efficiency_score: totalIncome > 0 ? (totalIncome - totalSpent) / totalIncome : 0
      }
    };
  }
}