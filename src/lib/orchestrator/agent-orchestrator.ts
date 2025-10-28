// Agent Orchestrator - Coordinates multi-agent workflow

import { DataExtractionAgent } from '../agents/data-extraction';
import { SpendingAnalysisAgent } from '../agents/spending-analysis';
import { SavingsInsightAgent } from '../agents/savings-insight';
import { RiskAssessmentAgent } from '../agents/risk-assessment';
import { UnclePersonalityAgent } from '../agents/uncle-personality';
import type { AgentResponse, AgentOrchestratorState, Transaction } from '../../types';

export class AgentOrchestrator {
  private dataExtractionAgent: DataExtractionAgent;
  private spendingAnalysisAgent: SpendingAnalysisAgent;
  private savingsInsightAgent: SavingsInsightAgent;
  private riskAssessmentAgent: RiskAssessmentAgent;
  private unclePersonalityAgent: UnclePersonalityAgent;

  constructor(apiKey: string) {
    this.dataExtractionAgent = new DataExtractionAgent(apiKey);
    this.spendingAnalysisAgent = new SpendingAnalysisAgent(apiKey);
    this.savingsInsightAgent = new SavingsInsightAgent(apiKey);
    this.riskAssessmentAgent = new RiskAssessmentAgent(apiKey);
    this.unclePersonalityAgent = new UnclePersonalityAgent(apiKey);
  }

  async executeAnalysis(sessionId: string, transactions: Transaction[]): Promise<AgentOrchestratorState> {
    const state: AgentOrchestratorState = {
      session_id: sessionId,
      current_step: 'data_extraction',
    };

    try {
      // Run analysis without timeout for now
      console.log('Starting analysis without timeout...');
      return await this.performAnalysis(sessionId, transactions, state);
    } catch (error) {
      console.error('Agent orchestration error:', error);
      
      // Return partial state with error information
      state.current_step = 'error';
      state.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Generate fallback uncle response
      state.uncle_response = "Hey there, sport! Looks like I'm having a bit of trouble processing all this financial data right now. Don't worry though - even the best uncles have their off days! \n\nThe important thing is that you're taking control of your finances, and that's something to be proud of. Keep up the good work, and I'll be back to give you some solid advice once I get my act together! 😄\n\nIn the meantime, remember: slow and steady wins the race when it comes to money management.";
      
      return state;
    }
  }

  private async performAnalysis(sessionId: string, transactions: Transaction[], state: AgentOrchestratorState): Promise<AgentOrchestratorState> {
    try {
      console.log('Starting performAnalysis...');
      console.log(`Processing ${transactions.length} transactions`);
      
      // Step 1: Data Extraction
      console.log('Starting data extraction...');
      let dataExtractionResponse;
      try {
        dataExtractionResponse = await this.dataExtractionAgent.execute(transactions);
        console.log('Data extraction completed successfully');
        state.extracted_data = transactions;
        state.current_step = 'analysis';
      } catch (dataExtractionError) {
        console.error('Data extraction failed:', dataExtractionError);
        dataExtractionResponse = {
          agent_type: 'data_extraction',
          insights: [{
            title: 'Transaction Analysis Failed',
            description: 'Unable to categorize transactions due to processing error.',
            confidence: 0.5,
            metadata: { error: dataExtractionError instanceof Error ? dataExtractionError.message : 'Unknown error' }
          }]
        };
        state.extracted_data = transactions;
        state.current_step = 'analysis';
      }

      console.log('Data extraction step completed');

      // Step 2: Run only spending analysis agent for troubleshooting
      console.log('Running spending analysis agent...');
      const spendingResponse = await this.spendingAnalysisAgent.execute(transactions);
      console.log('Spending analysis completed');

      // Step 3: Aggregate agent responses (only data extraction and spending analysis)
      state.agent_responses = [
        dataExtractionResponse,
        spendingResponse,
      ];

      // Step 4: Generate simple uncle response based on spending analysis
      console.log('Generating Uncle\'s response...');
      state.current_step = 'personality_transform';
      
      // Simple uncle response based on spending analysis
      const totalSpent = spendingResponse.metadata?.summary?.total_spent || 0;
      const topCategory = spendingResponse.metadata?.insights?.highest_spending_category || 'Unknown';
      
      state.uncle_response = `Hey there, sport! I just took a look at your spending and here's what I found:

You spent $${totalSpent.toFixed(2)} total, with most of it going to ${topCategory}. That's not too shabby! 

The good news is you're keeping track of your money, and that's the first step to financial success. Keep up the good work! 😄`;
      
      state.current_step = 'complete';

      console.log('Analysis complete!');
      return state;

    } catch (error) {
      console.error('Agent orchestration error:', error);
      
      // Return partial state with error information
      state.current_step = 'complete';
      state.uncle_response = `Hey there, sport! I ran into a bit of trouble analyzing your finances. Don't worry though - even the best uncles have their off days! 

The good news is that you're taking control of your money, and that's what matters most. Try uploading your statements again, and I'll do my best to give you some solid advice! 😄`;
      
      return state;
    }
  }

  async executeChatResponse(sessionId: string, userMessage: string, previousInsights: any[]): Promise<string> {
    const systemPrompt = `You are Uncle Sense - a wise, funny, slightly quirky uncle who gives financial advice. 

A user is asking you a follow-up question about their finances. Use the previous insights and analysis to provide a helpful, encouraging response in your characteristic uncle voice.

Previous insights context:
${JSON.stringify(previousInsights, null, 2)}

User's question: "${userMessage}"

Respond as Uncle Sense with:
- Warm, encouraging tone
- Practical advice based on the insights
- Appropriate humor or analogies
- Clear next steps if applicable
- Keep it conversational and easy to understand

Don't repeat the same advice from the insights - provide new, relevant guidance based on their question.`;

    try {
      const response = await this.unclePersonalityAgent.generateResponse(systemPrompt, {
        maxTokens: 500,
        temperature: 0.8,
      });
      
      return response;
    } catch (error) {
      console.error('Chat response error:', error);
      return `Hey there, buddy! I'm having a bit of trouble processing your question right now. But don't worry - the fact that you're asking questions about your finances shows you're on the right track! 

Try asking me again in a moment, and I'll do my best to help you out! 😄`;
    }
  }

  getAgentStatus(): Record<string, string> {
    return {
      data_extraction: 'Ready',
      spending_analysis: 'Ready', 
      savings_insight: 'Ready',
      risk_assessment: 'Ready',
      uncle_personality: 'Ready',
    };
  }
}
