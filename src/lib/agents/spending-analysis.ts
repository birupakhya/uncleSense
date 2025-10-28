// Spending Analysis Agent - Analyzes spending patterns and trends with LLM insights

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class SpendingAnalysisAgent extends BaseAgent {
  constructor(apiKey?: string) {
    super(apiKey);
  }

  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    try {
      // Step 1: Perform rule-based analysis for reliable metrics
      const analysis = this.analyzeSpendingPatterns(transactions);
      
      // Step 2: Generate LLM-powered insights and recommendations
      const llmInsights = await this.generateLLMInsights(transactions, analysis);
      
      // Step 3: Create comprehensive insights combining both approaches
      const insights = [
        this.createInsight(
          'Spending Analysis Complete',
          `Analyzed $${Math.abs(analysis.summary.total_spent).toFixed(2)} in spending across ${analysis.summary.category_count} categories.`,
          'positive',
          {
            'Total Spent': `$${Math.abs(analysis.summary.total_spent).toFixed(2)}`,
            'Daily Average': `$${analysis.summary.average_daily_spending.toFixed(2)}`,
            'Top Category': analysis.insights.highest_spending_category,
          }
        ),
        ...llmInsights
      ];
      
      return {
        agent_type: 'spending_analysis',
        insights,
        metadata: {
          ...analysis,
          llm_generated_insights: llmInsights.length,
          analysis_method: 'hybrid_rule_based_and_llm'
        },
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

  private async generateLLMInsights(transactions: Transaction[], analysis: any): Promise<any[]> {
    const insights = [];
    
    try {
      // Generate spending pattern insights
      const patternInsight = await this.generateSpendingPatternInsight(transactions, analysis);
      if (patternInsight) insights.push(patternInsight);

      // Generate budget optimization recommendations
      const budgetInsight = await this.generateBudgetOptimizationInsight(analysis);
      if (budgetInsight) insights.push(budgetInsight);

      // Generate financial health assessment
      const healthInsight = await this.generateFinancialHealthInsight(analysis);
      if (healthInsight) insights.push(healthInsight);

      // Generate personalized recommendations
      const recommendationInsight = await this.generatePersonalizedRecommendations(transactions, analysis);
      if (recommendationInsight) insights.push(recommendationInsight);

    } catch (error) {
      console.error('LLM insight generation failed:', error);
      // Add fallback insight
      insights.push(
        this.createInsight(
          'AI Analysis Temporarily Unavailable',
          'Using traditional analysis methods. AI-powered insights will be available shortly.',
          'neutral'
        )
      );
    }

    return insights;
  }

  private async generateSpendingPatternInsight(transactions: Transaction[], analysis: any): Promise<any | null> {
    const prompt = `Analyze the following spending patterns and provide insights:

Spending Summary:
- Total Spent: $${Math.abs(analysis.summary.total_spent).toFixed(2)}
- Daily Average: $${analysis.summary.average_daily_spending.toFixed(2)}
- Top Spending Category: ${analysis.insights.highest_spending_category}
- Categories: ${Object.keys(analysis.spending_by_category).join(', ')}

Category Breakdown:
${Object.entries(analysis.spending_by_category).map(([cat, data]: [string, any]) => 
  `- ${cat}: $${data.total_amount.toFixed(2)} (${data.percentage_of_total.toFixed(1)}%)`
).join('\n')}

Recent Transactions Sample:
${transactions.slice(0, 10).map(t => 
  `- ${t.date}: ${t.description} - $${Math.abs(t.amount).toFixed(2)}`
).join('\n')}

Provide insights about:
1. Spending patterns and trends
2. Areas of concern or opportunity
3. Comparison to typical spending patterns
4. Seasonal or temporal patterns if any

Keep response concise and actionable.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 400,
        temperature: 0.7
      });

      return this.createInsight(
        'AI Spending Pattern Analysis',
        response,
        'info',
        {
          'Analysis Method': 'LLM-Powered',
          'Categories Analyzed': Object.keys(analysis.spending_by_category).length,
          'Transactions Reviewed': transactions.length
        }
      );
    } catch (error) {
      console.error('Spending pattern insight generation failed:', error);
      return null;
    }
  }

  private async generateBudgetOptimizationInsight(analysis: any): Promise<any | null> {
    const prompt = `Based on this spending analysis, provide budget optimization recommendations:

Financial Overview:
- Total Spent: $${Math.abs(analysis.summary.total_spent).toFixed(2)}
- Total Income: $${analysis.summary.total_income.toFixed(2)}
- Spending Efficiency Score: ${(analysis.summary.spending_efficiency_score * 100).toFixed(1)}%
- Daily Average Spending: $${analysis.summary.average_daily_spending.toFixed(2)}

Top Spending Categories:
${Object.entries(analysis.spending_by_category)
  .sort(([,a], [,b]) => b.total_amount - a.total_amount)
  .slice(0, 5)
  .map(([cat, data]: [string, any]) => 
    `- ${cat}: $${data.total_amount.toFixed(2)} (${data.percentage_of_total.toFixed(1)}%)`
  ).join('\n')}

Provide specific, actionable budget optimization recommendations:
1. Which categories to focus on for savings
2. Realistic spending reduction targets
3. Budget allocation suggestions
4. Emergency fund considerations

Keep recommendations practical and achievable.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 350,
        temperature: 0.6
      });

      return this.createInsight(
        'AI Budget Optimization Recommendations',
        response,
        'positive',
        {
          'Savings Potential': `${(analysis.summary.spending_efficiency_score * 100).toFixed(1)}%`,
          'Top Category': analysis.insights.highest_spending_category,
          'Daily Target': `$${(analysis.summary.average_daily_spending * 0.9).toFixed(2)}`
        },
        [
          'Review top spending categories',
          'Set realistic reduction targets',
          'Track progress weekly'
        ]
      );
    } catch (error) {
      console.error('Budget optimization insight generation failed:', error);
      return null;
    }
  }

  private async generateFinancialHealthInsight(analysis: any): Promise<any | null> {
    const prompt = `Assess the financial health based on this spending analysis:

Financial Metrics:
- Total Spent: $${Math.abs(analysis.summary.total_spent).toFixed(2)}
- Total Income: $${analysis.summary.total_income.toFixed(2)}
- Spending Efficiency: ${(analysis.summary.spending_efficiency_score * 100).toFixed(1)}%
- Daily Average: $${analysis.summary.average_daily_spending.toFixed(2)}

Spending Distribution:
${Object.entries(analysis.spending_by_category)
  .sort(([,a], [,b]) => b.total_amount - a.total_amount)
  .map(([cat, data]: [string, any]) => 
    `${cat}: ${data.percentage_of_total.toFixed(1)}%`
  ).join(', ')}

Provide a financial health assessment covering:
1. Overall financial health score (1-10)
2. Strengths in current spending habits
3. Areas needing improvement
4. Risk factors to watch
5. Positive trends to maintain

Be encouraging but honest about areas for improvement.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 300,
        temperature: 0.5
      });

      const healthScore = Math.min(10, Math.max(1, Math.round(analysis.summary.spending_efficiency_score * 10)));

      return this.createInsight(
        'AI Financial Health Assessment',
        response,
        healthScore >= 7 ? 'positive' : healthScore >= 5 ? 'neutral' : 'negative',
        {
          'Health Score': `${healthScore}/10`,
          'Efficiency': `${(analysis.summary.spending_efficiency_score * 100).toFixed(1)}%`,
          'Income vs Spending': analysis.summary.total_income > 0 ? 'Positive' : 'Needs Review'
        }
      );
    } catch (error) {
      console.error('Financial health insight generation failed:', error);
      return null;
    }
  }

  private async generatePersonalizedRecommendations(transactions: Transaction[], analysis: any): Promise<any | null> {
    const prompt = `Generate personalized financial recommendations based on this spending data:

Spending Profile:
- Total Transactions: ${transactions.length}
- Spending Period: ${this.calculateSpendingPeriod(transactions)} days
- Average Transaction: $${(Math.abs(analysis.summary.total_spent) / transactions.length).toFixed(2)}
- Most Frequent Category: ${analysis.insights.most_frequent_transaction}

Transaction Patterns:
${this.analyzeTransactionPatterns(transactions)}

Spending Categories:
${Object.entries(analysis.spending_by_category)
  .map(([cat, data]: [string, any]) => 
    `${cat}: ${data.transaction_count} transactions, avg $${(data.total_amount / data.transaction_count).toFixed(2)}`
  ).join('\n')}

Provide personalized recommendations for:
1. Immediate actions (next 30 days)
2. Medium-term goals (3-6 months)
3. Long-term financial habits
4. Specific tools or strategies
5. Warning signs to watch for

Make recommendations specific to this spending pattern and lifestyle.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 400,
        temperature: 0.7
      });

      return this.createInsight(
        'AI Personalized Financial Recommendations',
        response,
        'positive',
        {
          'Recommendations': 'AI-Generated',
          'Based On': `${transactions.length} transactions`,
          'Timeframe': `${this.calculateSpendingPeriod(transactions)} days`
        },
        [
          'Review recommendations weekly',
          'Track implementation progress',
          'Adjust based on results'
        ]
      );
    } catch (error) {
      console.error('Personalized recommendations generation failed:', error);
      return null;
    }
  }

  private calculateSpendingPeriod(transactions: Transaction[]): number {
    if (transactions.length < 2) return 1;
    
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    return Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private analyzeTransactionPatterns(transactions: Transaction[]): string {
    const patterns = [];
    
    // Analyze transaction frequency
    const dailyTransactions = transactions.length / this.calculateSpendingPeriod(transactions);
    if (dailyTransactions > 3) patterns.push('High frequency spending');
    else if (dailyTransactions < 0.5) patterns.push('Low frequency spending');
    else patterns.push('Moderate frequency spending');
    
    // Analyze amount distribution
    const amounts = transactions.map(t => Math.abs(t.amount));
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const largeTransactions = amounts.filter(amount => amount > avgAmount * 2).length;
    
    if (largeTransactions > amounts.length * 0.2) patterns.push('Many large transactions');
    else patterns.push('Consistent transaction sizes');
    
    return patterns.join(', ');
  }
}