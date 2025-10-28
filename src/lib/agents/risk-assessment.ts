// Risk Assessment Agent - Flags unusual or risky financial behaviors

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class RiskAssessmentAgent extends BaseAgent {
  constructor(apiKey?: string) {
    super(apiKey);
  }

  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    try {
      // Use rule-based analysis instead of AI for reliability
      const analysis = this.assessFinancialRisks(transactions);
      
      return {
        agent_type: 'risk_assessment',
        insights: [
          this.createInsight(
            'Risk Assessment Complete',
            `Identified ${analysis.summary.risk_count} potential risks with ${analysis.summary.high_risk_count} high-priority items.`,
            analysis.summary.high_risk_count > 0 ? 'negative' : 'positive',
            {
              'Risk Level': analysis.summary.overall_risk_level,
              'High Priority Risks': analysis.summary.high_risk_count,
              'Total Risks': analysis.summary.risk_count,
            }
          )
        ],
        metadata: analysis,
      };
    } catch (error) {
      console.error('Risk Assessment Agent error:', error);
      
      return {
        agent_type: 'risk_assessment',
        insights: [
          this.createInsight(
            'Risk Assessment Failed',
            'Unable to assess financial risks due to processing error.',
            'negative'
          )
        ],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private assessFinancialRisks(transactions: Transaction[]) {
    const risks: any[] = [];
    let totalIncome = 0;
    let totalExpenses = 0;
    const largeTransactions: Transaction[] = [];
    const duplicateAmounts: Record<number, Transaction[]> = {};
    
    // Analyze transactions
    transactions.forEach(t => {
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        totalExpenses += Math.abs(t.amount);
        
        // Check for large transactions (>$200)
        if (Math.abs(t.amount) > 200) {
          largeTransactions.push(t);
        }
        
        // Check for duplicate amounts
        const amount = Math.abs(t.amount);
        if (!duplicateAmounts[amount]) {
          duplicateAmounts[amount] = [];
        }
        duplicateAmounts[amount].push(t);
      }
    });

    // Check for overspending
    if (totalExpenses > totalIncome) {
      risks.push({
        type: 'overspending',
        severity: 'high',
        title: 'Spending Exceeds Income',
        description: `Monthly expenses ($${totalExpenses.toFixed(2)}) exceed income ($${totalIncome.toFixed(2)})`,
        recommendation: 'Create a budget and reduce expenses immediately'
      });
    }

    // Check for large transactions
    if (largeTransactions.length > 0) {
      risks.push({
        type: 'large_transactions',
        severity: 'medium',
        title: 'Large Transactions Detected',
        description: `Found ${largeTransactions.length} transactions over $200`,
        recommendation: 'Review large purchases for necessity and budget impact'
      });
    }

    // Check for duplicate charges
    Object.entries(duplicateAmounts).forEach(([amount, txs]) => {
      if (txs.length > 2) {
        risks.push({
          type: 'duplicate_charges',
          severity: 'high',
          title: 'Potential Duplicate Charges',
          description: `Found ${txs.length} transactions with identical amount $${amount}`,
          recommendation: 'Review transactions for duplicate charges'
        });
      }
    });

    // Check for unusual spending patterns
    const avgTransaction = totalExpenses / transactions.filter(t => t.amount < 0).length;
    const unusualTransactions = transactions.filter(t => 
      t.amount < 0 && Math.abs(t.amount) > avgTransaction * 3
    );
    
    if (unusualTransactions.length > 0) {
      risks.push({
        type: 'unusual_spending',
        severity: 'medium',
        title: 'Unusual Spending Patterns',
        description: `Found ${unusualTransactions.length} transactions significantly above average`,
        recommendation: 'Review unusual transactions for accuracy'
      });
    }

    const highRiskCount = risks.filter(r => r.severity === 'high').length;
    const overallRiskLevel = highRiskCount > 0 ? 'High' : risks.length > 2 ? 'Medium' : 'Low';

    return {
      risks,
      risk_summary: {
        overall_risk_level: overallRiskLevel,
        high_risk_count: highRiskCount,
        medium_risk_count: risks.filter(r => r.severity === 'medium').length,
        low_risk_count: risks.filter(r => r.severity === 'low').length
      },
      recommendations: risks.map(r => r.recommendation),
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        risk_count: risks.length,
        high_risk_count: highRiskCount,
        overall_risk_level: overallRiskLevel,
        financial_stability_score: Math.max(0, 100 - (risks.length * 10) - (highRiskCount * 20))
      }
    };
  }
}