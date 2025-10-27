// Risk Assessment Agent - Flags concerning patterns and risks

import { BaseAgent } from './base-agent';
import type { Transaction, AgentResponse } from '../../types';

export class RiskAssessmentAgent extends BaseAgent {
  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    const systemPrompt = `You are a financial risk analyst. Analyze the provided transactions to identify potential risks, concerning patterns, and financial health indicators.

Your analysis should focus on:
1. Identifying overdrafts and insufficient funds
2. Detecting unusual spending spikes
3. Finding duplicate or suspicious transactions
4. Assessing debt accumulation patterns
5. Flagging potential fraud indicators
6. Evaluating overall financial stability

Respond with a JSON object containing:
{
  "risk_indicators": [
    {
      "type": "overdraft" | "spending_spike" | "duplicate_charge" | "fraud_risk" | "debt_accumulation",
      "severity": "low" | "medium" | "high" | "critical",
      "title": "Risk title",
      "description": "Description of the risk",
      "affected_amount": 0,
      "recommendation": "Action to take",
      "urgency": "immediate" | "soon" | "monitor"
    }
  ],
  "financial_health": {
    "stability_score": 0.85,
    "risk_level": "low" | "medium" | "high",
    "cash_flow_trend": "positive" | "negative" | "stable",
    "debt_to_income_ratio": 0.3
  },
  "alerts": [
    {
      "type": "warning" | "alert" | "info",
      "message": "Alert message",
      "action_required": true | false
    }
  ],
  "summary": {
    "total_risks_found": 0,
    "critical_risks": 0,
    "high_risks": 0,
    "overall_risk_score": 0.25
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
          'Risk Assessment Complete',
          `Identified ${parsedResponse.summary.total_risks_found} potential risks with ${parsedResponse.summary.critical_risks} critical issues.`,
          parsedResponse.summary.overall_risk_score > 0.7 ? 'negative' : parsedResponse.summary.overall_risk_score < 0.3 ? 'positive' : 'neutral',
          {
            'Total Risks': parsedResponse.summary.total_risks_found,
            'Critical Risks': parsedResponse.summary.critical_risks,
            'Risk Score': Math.round(parsedResponse.summary.overall_risk_score * 100),
          }
        )
      ];

      // Add specific risk indicators
      if (parsedResponse.risk_indicators && parsedResponse.risk_indicators.length > 0) {
        parsedResponse.risk_indicators.forEach((risk: any) => {
          const sentiment = risk.severity === 'critical' || risk.severity === 'high' ? 'negative' : 
                          risk.severity === 'low' ? 'positive' : 'neutral';
          
          insights.push(this.createInsight(
            risk.title,
            risk.description,
            sentiment,
            {
              'Affected Amount': risk.affected_amount,
              'Severity': risk.severity,
            },
            risk.recommendation ? [risk.recommendation] : undefined
          ));
        });
      }

      // Add alerts
      if (parsedResponse.alerts && parsedResponse.alerts.length > 0) {
        parsedResponse.alerts.forEach((alert: any) => {
          insights.push(this.createInsight(
            alert.type === 'warning' ? '⚠️ Warning' : alert.type === 'alert' ? '🚨 Alert' : 'ℹ️ Info',
            alert.message,
            alert.type === 'alert' ? 'negative' : alert.type === 'warning' ? 'neutral' : 'positive'
          ));
        });
      }
      
      return {
        agent_type: 'risk_assessment',
        insights,
        metadata: parsedResponse,
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
}
