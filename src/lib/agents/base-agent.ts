// Base agent class for UncleSense agents

import { HuggingFaceClient, DEFAULT_MODEL } from '../huggingface/client';
import type { Transaction, InsightData, AgentResponse } from '../../types';

export abstract class BaseAgent {
  protected huggingFaceClient: HuggingFaceClient;
  protected model: string;

  constructor(apiKey?: string, model: string = DEFAULT_MODEL) {
    // Use provided API key or get from environment
    const finalApiKey = apiKey || process.env.HUGGINGFACE_API_KEY || '';
    this.huggingFaceClient = new HuggingFaceClient(finalApiKey);
    this.model = model;
  }

  abstract execute(input: any): Promise<AgentResponse>;

  protected async generateResponse(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      return await this.huggingFaceClient.generateText(this.model, prompt, options);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  protected async generateFinancialInsight(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      return await this.huggingFaceClient.generateFinancialInsight(prompt, options);
    } catch (error) {
      console.error(`Financial insight generation error in ${this.constructor.name}:`, error);
      throw new Error(`Failed to generate financial insight: ${error}`);
    }
  }

  protected async generateFinancialRecommendations(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      return await this.huggingFaceClient.generateFinancialRecommendations(prompt, options);
    } catch (error) {
      console.error(`Financial recommendations generation error in ${this.constructor.name}:`, error);
      throw new Error(`Failed to generate financial recommendations: ${error}`);
    }
  }

  protected async analyzeFinancialData(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      return await this.huggingFaceClient.analyzeFinancialData(prompt, options);
    } catch (error) {
      console.error(`Financial data analysis error in ${this.constructor.name}:`, error);
      throw new Error(`Failed to analyze financial data: ${error}`);
    }
  }

  protected formatFinancialPrompt(
    systemContext: string,
    financialData: any,
    analysisType: 'spending' | 'patterns' | 'recommendations' | 'health'
  ): string {
    return this.huggingFaceClient.formatFinancialPrompt(systemContext, financialData, analysisType);
  }

  protected formatPrompt(systemPrompt: string, userInput: string): string {
    return `${systemPrompt}\n\nUser Input: ${userInput}\n\nResponse:`;
  }

  protected createInsight(
    title: string,
    description: string,
    sentiment: 'positive' | 'neutral' | 'negative' = 'neutral',
    keyNumbers?: Record<string, number>,
    recommendations?: string[],
    visualData?: any
  ): InsightData {
    return {
      title,
      description,
      key_numbers: keyNumbers,
      recommendations,
      visual_data: visualData,
    };
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    
    throw lastError!;
  }
}
