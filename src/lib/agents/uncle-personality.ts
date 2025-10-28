// Uncle Personality Agent - Transforms technical insights into quirky, practical uncle advice

import { BaseAgent } from './base-agent';
import type { AgentResponse, Insight } from '../../types';

export class UnclePersonalityAgent extends BaseAgent {
  constructor(apiKey?: string) {
    super(apiKey);
  }

  async execute(agentResponses: AgentResponse[]): Promise<AgentResponse> {
    const systemPrompt = `You are Uncle Sense - a wise, funny, slightly quirky uncle who gives financial advice. You have decades of experience with money, and you're here to help your favorite niece/nephew with their finances.

Your personality traits:
- Warm and encouraging, never judgmental
- Uses humor and dad jokes appropriately
- Gives practical, actionable advice
- References personal experiences and stories
- Uses casual, conversational language
- Occasionally uses financial metaphors and analogies
- Celebrates wins and gently addresses concerns
- Maintains a positive, supportive tone

Your response style:
- Start with a warm greeting or acknowledgment
- Use "kid", "buddy", "sport", or similar terms of endearment
- Include relevant personal anecdotes or analogies
- End with encouragement and next steps
- Keep responses conversational and easy to understand

Transform the technical financial insights into your unique uncle voice. Make it feel like a conversation over coffee, not a financial report.

Respond with a JSON object containing:
{
  "uncle_summary": "Your main response as Uncle Sense",
  "key_takeaways": [
    "Main point 1",
    "Main point 2",
    "Main point 3"
  ],
  "encouragement": "Specific words of encouragement",
  "next_steps": [
    "Actionable next step 1",
    "Actionable next step 2"
  ],
  "uncle_wisdom": "A piece of financial wisdom or life advice",
  "tone": "celebratory" | "concerned" | "encouraging" | "practical"
}`;

    // Aggregate insights from all agents
    const allInsights = agentResponses.flatMap(response => response.insights);
    const insightsSummary = allInsights.map(insight => ({
      title: insight.title,
      description: insight.description,
      sentiment: insight.sentiment,
      key_numbers: insight.key_numbers,
      recommendations: insight.recommendations,
    }));

    const prompt = this.formatPrompt(systemPrompt, JSON.stringify({
      insights: insightsSummary,
      agent_count: agentResponses.length,
      total_insights: allInsights.length,
    }));
    
    try {
      const response = await this.huggingFaceClient.generateUnclePersonalityResponse(prompt, { 
        maxTokens: 1000,
        temperature: 0.8 // Higher temperature for more creative responses
      });
      const parsedResponse = JSON.parse(response);
      
      return {
        agent_type: 'uncle_personality',
        insights: [
          this.createInsight(
            'Uncle\'s Financial Wisdom',
            parsedResponse.uncle_summary,
            parsedResponse.tone === 'celebratory' ? 'positive' : 
            parsedResponse.tone === 'concerned' ? 'negative' : 'neutral',
            undefined,
            parsedResponse.next_steps,
            {
              type: 'text',
              data: {
                key_takeaways: parsedResponse.key_takeaways,
                encouragement: parsedResponse.encouragement,
                uncle_wisdom: parsedResponse.uncle_wisdom,
                tone: parsedResponse.tone,
              }
            }
          )
        ],
        metadata: parsedResponse,
      };
    } catch (error) {
      console.error('Uncle Personality Agent error:', error);
      
      // Fallback response in Uncle's voice
      const fallbackResponse = `Hey there, sport! Looks like I'm having a bit of trouble processing all this financial data right now. Don't worry though - even the best uncles have their off days! 

The important thing is that you're taking control of your finances, and that's something to be proud of. Keep up the good work, and I'll be back to give you some solid advice once I get my act together! 😄

In the meantime, remember: slow and steady wins the race when it comes to money management.`;
      
      return {
        agent_type: 'uncle_personality',
        insights: [
          this.createInsight(
            'Uncle\'s Temporary Confusion',
            fallbackResponse,
            'neutral',
            undefined,
            ['Try uploading your statements again', 'Check back in a few minutes']
          )
        ],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}
