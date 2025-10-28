// Data Extraction Agent - Categorizes and normalizes financial transactions

import { BaseAgent } from './base-agent';
import { FinancialModelsClient, type TransactionCategory, type PatternDetectionResult } from '../huggingface/financial-models';
import type { Transaction, AgentResponse } from '../../types';

export class DataExtractionAgent extends BaseAgent {
  private financialModels: FinancialModelsClient;

  constructor(apiKey?: string) {
    super(apiKey);
    this.financialModels = new FinancialModelsClient();
  }

  async execute(transactions: Transaction[]): Promise<AgentResponse> {
    try {
      console.log(`[DataExtraction] Starting analysis of ${transactions.length} transactions`);
      console.log(`[DataExtraction] HuggingFace API key available: ${!!this.huggingFaceClient}`);
      
      // Initialize financial models
      await this.financialModels.initialize();

      // Step 1: Categorize transactions using financial RoBERTa model
      console.log(`[DataExtraction] Step 1: Categorizing transactions`);
      const categorizedTransactions = await this.categorizeTransactions(transactions);
      console.log(`[DataExtraction] Categorized ${categorizedTransactions.length} transactions`);

      // Step 2: Normalize merchant names using sentence transformers
      console.log(`[DataExtraction] Step 2: Normalizing merchant names`);
      const merchantNormalization = await this.normalizeMerchants(transactions);

      // Step 3: Detect recurring patterns and anomalies
      console.log(`[DataExtraction] Step 3: Detecting patterns`);
      const patterns = await this.detectPatterns(transactions);

      // Step 4: Calculate data quality score
      console.log(`[DataExtraction] Step 4: Calculating data quality score`);
      const dataQualityScore = this.calculateDataQualityScore(categorizedTransactions);

      // Step 5: Generate insights
      console.log(`[DataExtraction] Step 5: Generating insights`);
      const insights = this.generateInsights(categorizedTransactions, patterns, dataQualityScore);

      console.log(`[DataExtraction] Analysis completed successfully`);

      return {
        agent_type: 'data_extraction',
        insights,
        metadata: {
          categorized_transactions: categorizedTransactions,
          patterns,
          merchant_normalization: merchantNormalization,
          summary: {
            total_transactions: transactions.length,
            categories_found: [...new Set(categorizedTransactions.map(t => t.category))],
            data_quality_score: dataQualityScore,
            recurring_patterns: patterns.recurring_transactions.length,
            unusual_transactions: patterns.unusual_transactions.length
          }
        },
      };
    } catch (error) {
      console.error('[DataExtraction] Agent error:', error);
      
      return {
        agent_type: 'data_extraction',
        insights: [
          this.createInsight(
            'Transaction Analysis Failed',
            'Unable to categorize transactions due to processing error.',
            'negative'
          )
        ],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async categorizeTransactions(transactions: Transaction[]): Promise<any[]> {
    const categorizedTransactions = [];

    for (const transaction of transactions) {
      try {
        console.log(`[DataExtraction] Processing transaction: ${transaction.description}`);
        
        // Use HuggingFace client for sentiment analysis
        const sentimentResult = await this.huggingFaceClient.analyzeSentiment(
          `${transaction.description} ${transaction.amount}`
        );
        
        console.log(`[DataExtraction] Sentiment analysis result:`, sentimentResult);
        
        // Map sentiment to category
        const category = this.mapSentimentToCategory(sentimentResult, transaction.amount);
        
        categorizedTransactions.push({
          id: transaction.id,
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          category: category,
          confidence: sentimentResult.confidence,
          merchant: transaction.description, // Will be normalized later
          notes: this.generateTransactionNotes(transaction, { category, confidence: sentimentResult.confidence }),
          sentiment: sentimentResult.label
        });
      } catch (error) {
        console.error(`[DataExtraction] Failed to categorize transaction ${transaction.id}:`, error);
        // Fallback categorization
        categorizedTransactions.push({
          id: transaction.id,
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          category: 'Other',
          confidence: 0.5,
          merchant: transaction.description,
          notes: 'Categorized using fallback method',
          sentiment: 'neutral'
        });
      }
    }

    return categorizedTransactions;
  }

  private mapSentimentToCategory(sentimentResult: any, amount: number): string {
    // Map sentiment and amount to financial categories
    const { label, confidence } = sentimentResult;
    
    if (amount > 0) {
      return 'Income & Deposits';
    }
    
    // For expenses, use sentiment to help categorize
    if (label === 'positive' && confidence > 0.7) {
      return 'Investments & Savings';
    } else if (label === 'negative' && confidence > 0.7) {
      return 'Bills & Utilities';
    } else {
      // Use amount-based categorization for neutral sentiment
      if (Math.abs(amount) < 20) {
        return 'Food & Dining';
      } else if (Math.abs(amount) < 100) {
        return 'Shopping & Retail';
      } else {
        return 'Major Expenses';
      }
    }
  }

  private async normalizeMerchants(transactions: Transaction[]): Promise<Map<string, string>> {
    const merchantNames = transactions.map(t => t.description);
    return await this.financialModels.normalizeMerchantNames(merchantNames);
  }

  private async detectPatterns(transactions: Transaction[]): Promise<any> {
    const recurringTransactions = [];
    const unusualTransactions = [];
    const merchantSummary: Record<string, any> = {};

    // Group transactions by merchant
    const merchantGroups = this.groupTransactionsByMerchant(transactions);

    for (const [merchant, merchantTransactions] of merchantGroups) {
      if (merchantTransactions.length >= 2) {
        try {
          const amounts = merchantTransactions.map(t => t.amount);
          const dates = merchantTransactions.map(t => t.date);

          const patternResult = await this.financialModels.detectRecurringPattern(
            merchant,
            amounts,
            dates
          );

          if (patternResult.isRecurring && patternResult.confidence > 0.7) {
            recurringTransactions.push({
              merchant,
              frequency: patternResult.frequency,
              confidence: patternResult.confidence,
              pattern: patternResult.pattern,
              transaction_count: merchantTransactions.length,
              average_amount: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
            });
          }

          // Check for unusual transactions
          const unusual = this.detectUnusualTransactions(merchantTransactions, patternResult);
          unusualTransactions.push(...unusual);

          merchantSummary[merchant] = {
            transaction_count: merchantTransactions.length,
            total_amount: amounts.reduce((sum, amount) => sum + amount, 0),
            average_amount: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
            is_recurring: patternResult.isRecurring,
            frequency: patternResult.frequency
          };
        } catch (error) {
          console.error(`Failed to analyze patterns for merchant ${merchant}:`, error);
        }
      }
    }

    return {
      recurring_transactions: recurringTransactions,
      unusual_transactions: unusualTransactions,
      merchant_summary: merchantSummary
    };
  }

  private groupTransactionsByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
      const merchant = this.extractMerchantName(transaction.description);
      if (!groups.has(merchant)) {
        groups.set(merchant, []);
      }
      groups.get(merchant)!.push(transaction);
    }

    return groups;
  }

  private extractMerchantName(description: string): string {
    // Simple merchant extraction - remove common prefixes/suffixes
    return description
      .replace(/^\d+\s*/, '') // Remove leading numbers
      .replace(/\s+\d+$/, '') // Remove trailing numbers
      .replace(/\*.*$/, '') // Remove everything after *
      .trim()
      .substring(0, 50); // Limit length
  }

  private detectUnusualTransactions(transactions: Transaction[], pattern: PatternDetectionResult): any[] {
    const unusual = [];
    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length
    );

    for (const transaction of transactions) {
      const zScore = Math.abs((transaction.amount - mean) / stdDev);
      
      if (zScore > 2) { // More than 2 standard deviations from mean
        unusual.push({
          transaction_id: transaction.id,
          merchant: this.extractMerchantName(transaction.description),
          amount: transaction.amount,
          date: transaction.date,
          reason: 'Amount significantly different from typical pattern',
          z_score: zScore,
          confidence: Math.min(0.95, zScore / 3) // Cap confidence at 0.95
        });
      }
    }

    return unusual;
  }

  private calculateDataQualityScore(categorizedTransactions: any[]): number {
    if (categorizedTransactions.length === 0) return 0;

    const totalTransactions = categorizedTransactions.length;
    const highConfidenceTransactions = categorizedTransactions.filter(t => t.confidence > 0.8).length;
    const categorizedTransactionsCount = categorizedTransactions.filter(t => t.category !== 'Other').length;

    const confidenceScore = highConfidenceTransactions / totalTransactions;
    const categorizationScore = categorizedTransactionsCount / totalTransactions;

    return (confidenceScore + categorizationScore) / 2;
  }

  private generateTransactionNotes(transaction: Transaction, categoryResult: TransactionCategory): string {
    const notes = [];
    
    if (categoryResult.confidence < 0.7) {
      notes.push('Low confidence categorization');
    }
    
    if (Math.abs(transaction.amount) > 1000) {
      notes.push('Large transaction amount');
    }
    
    if (transaction.description.length < 5) {
      notes.push('Short description may affect accuracy');
    }

    return notes.join('; ') || 'No special notes';
  }

  private async generateInsights(categorizedTransactions: any[], patterns: any, dataQualityScore: number): Promise<any[]> {
    const insights = [];

    // Main categorization insight
    insights.push(
      this.createInsight(
        'Transaction Analysis Complete',
        `Successfully categorized ${categorizedTransactions.length} transactions with ${Math.round(dataQualityScore * 100)}% data quality score.`,
        'positive',
        {
          'Total Transactions': categorizedTransactions.length,
          'Categories Found': [...new Set(categorizedTransactions.map(t => t.category))].length,
          'Data Quality Score': Math.round(dataQualityScore * 100),
          'High Confidence': categorizedTransactions.filter(t => t.confidence > 0.8).length
        }
      )
    );

    // Recurring patterns insight
    if (patterns.recurring_transactions.length > 0) {
      insights.push(
        this.createInsight(
          'Recurring Patterns Detected',
          `Found ${patterns.recurring_transactions.length} recurring transaction patterns.`,
          'info',
          {
            'Recurring Merchants': patterns.recurring_transactions.length,
            'Most Common Frequency': this.getMostCommonFrequency(patterns.recurring_transactions),
            'Average Confidence': Math.round(
              patterns.recurring_transactions.reduce((sum: number, p: any) => sum + p.confidence, 0) / 
              patterns.recurring_transactions.length * 100
            )
          }
        )
      );
    }

    // Unusual transactions insight
    if (patterns.unusual_transactions.length > 0) {
      insights.push(
        this.createInsight(
          'Unusual Transactions Found',
          `Detected ${patterns.unusual_transactions.length} unusual transactions that may require attention.`,
          'warning',
          {
            'Unusual Transactions': patterns.unusual_transactions.length,
            'Highest Z-Score': Math.round(
              Math.max(...patterns.unusual_transactions.map((t: any) => t.z_score)) * 100
            ) / 100
          }
        )
      );
    }

    // Generate LLM-powered insights
    try {
      const llmInsights = await this.generateLLMInsights(categorizedTransactions, patterns, dataQualityScore);
      insights.push(...llmInsights);
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

  private async generateLLMInsights(categorizedTransactions: any[], patterns: any, dataQualityScore: number): Promise<any[]> {
    const insights = [];

    // Generate transaction categorization insights
    const categorizationInsight = await this.generateCategorizationInsight(categorizedTransactions, dataQualityScore);
    if (categorizationInsight) insights.push(categorizationInsight);

    // Generate pattern analysis insights
    const patternInsight = await this.generatePatternAnalysisInsight(patterns);
    if (patternInsight) insights.push(patternInsight);

    // Generate data quality insights
    const qualityInsight = await this.generateDataQualityInsight(categorizedTransactions, dataQualityScore);
    if (qualityInsight) insights.push(qualityInsight);

    // Generate merchant analysis insights
    const merchantInsight = await this.generateMerchantAnalysisInsight(categorizedTransactions);
    if (merchantInsight) insights.push(merchantInsight);

    return insights;
  }

  private async generateCategorizationInsight(categorizedTransactions: any[], dataQualityScore: number): Promise<any | null> {
    const categoryDistribution = this.calculateCategoryDistribution(categorizedTransactions);
    const lowConfidenceTransactions = categorizedTransactions.filter(t => t.confidence < 0.7);

    const prompt = `Analyze this transaction categorization data and provide insights:

Categorization Summary:
- Total Transactions: ${categorizedTransactions.length}
- Data Quality Score: ${Math.round(dataQualityScore * 100)}%
- Categories Found: ${Object.keys(categoryDistribution).length}
- Low Confidence Transactions: ${lowConfidenceTransactions.length}

Category Distribution:
${Object.entries(categoryDistribution)
  .sort(([,a], [,b]) => b.count - a.count)
  .map(([cat, data]: [string, any]) => 
    `- ${cat}: ${data.count} transactions (${data.percentage.toFixed(1)}%) - $${data.total.toFixed(2)}`
  ).join('\n')}

Low Confidence Transactions Sample:
${lowConfidenceTransactions.slice(0, 5).map(t => 
  `- ${t.description}: ${t.category} (${Math.round(t.confidence * 100)}%)`
).join('\n')}

Provide insights about:
1. Categorization accuracy and patterns
2. Categories that might need review
3. Suggestions for improving categorization
4. Notable spending patterns by category

Keep response concise and actionable.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 400,
        temperature: 0.6
      });

      return this.createInsight(
        'AI Transaction Categorization Analysis',
        response,
        dataQualityScore > 0.8 ? 'positive' : dataQualityScore > 0.6 ? 'neutral' : 'negative',
        {
          'Quality Score': `${Math.round(dataQualityScore * 100)}%`,
          'Categories': Object.keys(categoryDistribution).length,
          'Low Confidence': lowConfidenceTransactions.length
        }
      );
    } catch (error) {
      console.error('Categorization insight generation failed:', error);
      return null;
    }
  }

  private async generatePatternAnalysisInsight(patterns: any): Promise<any | null> {
    const prompt = `Analyze these transaction patterns and provide insights:

Pattern Analysis:
- Recurring Transactions: ${patterns.recurring_transactions.length}
- Unusual Transactions: ${patterns.unusual_transactions.length}
- Merchants Analyzed: ${Object.keys(patterns.merchant_summary).length}

Recurring Patterns:
${patterns.recurring_transactions.map((p: any) => 
  `- ${p.merchant}: ${p.frequency} (${Math.round(p.confidence * 100)}% confidence)`
).join('\n')}

Unusual Transactions:
${patterns.unusual_transactions.slice(0, 5).map((t: any) => 
  `- ${t.merchant}: $${t.amount} (Z-score: ${t.z_score.toFixed(2)})`
).join('\n')}

Merchant Summary (Top 5):
${Object.entries(patterns.merchant_summary)
  .sort(([,a], [,b]) => b.transaction_count - a.transaction_count)
  .slice(0, 5)
  .map(([merchant, data]: [string, any]) => 
    `- ${merchant}: ${data.transaction_count} transactions, $${data.total_amount.toFixed(2)} total`
  ).join('\n')}

Provide insights about:
1. Spending patterns and habits
2. Subscription and recurring payment analysis
3. Unusual spending that needs attention
4. Merchant relationship patterns
5. Recommendations for budget optimization

Keep response practical and actionable.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 450,
        temperature: 0.7
      });

      return this.createInsight(
        'AI Pattern Analysis Insights',
        response,
        'info',
        {
          'Recurring Patterns': patterns.recurring_transactions.length,
          'Unusual Transactions': patterns.unusual_transactions.length,
          'Merchants': Object.keys(patterns.merchant_summary).length
        }
      );
    } catch (error) {
      console.error('Pattern analysis insight generation failed:', error);
      return null;
    }
  }

  private async generateDataQualityInsight(categorizedTransactions: any[], dataQualityScore: number): Promise<any | null> {
    const highConfidenceTransactions = categorizedTransactions.filter(t => t.confidence > 0.8);
    const mediumConfidenceTransactions = categorizedTransactions.filter(t => t.confidence >= 0.6 && t.confidence <= 0.8);
    const lowConfidenceTransactions = categorizedTransactions.filter(t => t.confidence < 0.6);

    const prompt = `Assess the data quality of this transaction analysis:

Data Quality Metrics:
- Overall Quality Score: ${Math.round(dataQualityScore * 100)}%
- High Confidence (>80%): ${highConfidenceTransactions.length} transactions
- Medium Confidence (60-80%): ${mediumConfidenceTransactions.length} transactions
- Low Confidence (<60%): ${lowConfidenceTransactions.length} transactions

Low Confidence Transactions Sample:
${lowConfidenceTransactions.slice(0, 5).map(t => 
  `- ${t.description}: ${t.category} (${Math.round(t.confidence * 100)}%)`
).join('\n')}

Transaction Description Quality:
- Average Description Length: ${Math.round(categorizedTransactions.reduce((sum, t) => sum + t.description.length, 0) / categorizedTransactions.length)}
- Short Descriptions (<10 chars): ${categorizedTransactions.filter(t => t.description.length < 10).length}
- Very Short Descriptions (<5 chars): ${categorizedTransactions.filter(t => t.description.length < 5).length}

Provide insights about:
1. Overall data quality assessment
2. Factors affecting categorization accuracy
3. Recommendations for improving data quality
4. Which transactions might need manual review
5. Suggestions for better transaction descriptions

Be specific about what affects quality and how to improve it.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 350,
        temperature: 0.5
      });

      return this.createInsight(
        'AI Data Quality Assessment',
        response,
        dataQualityScore > 0.8 ? 'positive' : dataQualityScore > 0.6 ? 'neutral' : 'negative',
        {
          'Quality Score': `${Math.round(dataQualityScore * 100)}%`,
          'High Confidence': highConfidenceTransactions.length,
          'Needs Review': lowConfidenceTransactions.length
        }
      );
    } catch (error) {
      console.error('Data quality insight generation failed:', error);
      return null;
    }
  }

  private async generateMerchantAnalysisInsight(categorizedTransactions: any[]): Promise<any | null> {
    const merchantAnalysis = this.analyzeMerchantPatterns(categorizedTransactions);

    const prompt = `Analyze these merchant patterns and provide insights:

Merchant Analysis:
- Unique Merchants: ${merchantAnalysis.uniqueMerchants}
- Top Merchant by Transactions: ${merchantAnalysis.topMerchantByCount}
- Top Merchant by Amount: ${merchantAnalysis.topMerchantByAmount}
- Average Transactions per Merchant: ${merchantAnalysis.avgTransactionsPerMerchant.toFixed(1)}

Top Merchants by Transaction Count:
${merchantAnalysis.topMerchantsByCount.slice(0, 5).map((m: any) => 
  `- ${m.merchant}: ${m.count} transactions, $${m.total.toFixed(2)}`
).join('\n')}

Top Merchants by Amount:
${merchantAnalysis.topMerchantsByAmount.slice(0, 5).map((m: any) => 
  `- ${m.merchant}: $${m.total.toFixed(2)} across ${m.count} transactions`
).join('\n')}

Merchant Categories:
${Object.entries(merchantAnalysis.categoryDistribution)
  .sort(([,a], [,b]) => b.count - a.count)
  .map(([cat, data]: [string, any]) => 
    `- ${cat}: ${data.count} merchants, ${data.transactions} transactions`
  ).join('\n')}

Provide insights about:
1. Spending concentration and diversification
2. Merchant relationship patterns
3. Potential subscription services
4. Shopping habits and preferences
5. Recommendations for merchant optimization

Focus on actionable insights for financial management.`;

    try {
      const response = await this.generateResponse(prompt, {
        maxTokens: 400,
        temperature: 0.6
      });

      return this.createInsight(
        'AI Merchant Analysis',
        response,
        'info',
        {
          'Unique Merchants': merchantAnalysis.uniqueMerchants,
          'Top Merchant': merchantAnalysis.topMerchantByCount,
          'Avg per Merchant': merchantAnalysis.avgTransactionsPerMerchant.toFixed(1)
        }
      );
    } catch (error) {
      console.error('Merchant analysis insight generation failed:', error);
      return null;
    }
  }

  private calculateCategoryDistribution(categorizedTransactions: any[]): Record<string, { count: number; total: number; percentage: number }> {
    const distribution: Record<string, { count: number; total: number; percentage: number }> = {};
    
    categorizedTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!distribution[category]) {
        distribution[category] = { count: 0, total: 0, percentage: 0 };
      }
      distribution[category].count++;
      distribution[category].total += Math.abs(transaction.amount);
    });

    const totalTransactions = categorizedTransactions.length;
    Object.values(distribution).forEach(data => {
      data.percentage = (data.count / totalTransactions) * 100;
    });

    return distribution;
  }

  private analyzeMerchantPatterns(categorizedTransactions: any[]): any {
    const merchantMap = new Map<string, { count: number; total: number; category: string }>();
    
    categorizedTransactions.forEach(transaction => {
      const merchant = this.extractMerchantName(transaction.description);
      if (!merchantMap.has(merchant)) {
        merchantMap.set(merchant, { count: 0, total: 0, category: transaction.category });
      }
      const data = merchantMap.get(merchant)!;
      data.count++;
      data.total += Math.abs(transaction.amount);
    });

    const merchants = Array.from(merchantMap.entries()).map(([merchant, data]) => ({
      merchant,
      ...data
    }));

    const topMerchantsByCount = merchants.sort((a, b) => b.count - a.count);
    const topMerchantsByAmount = merchants.sort((a, b) => b.total - a.total);

    const categoryDistribution: Record<string, { count: number; transactions: number }> = {};
    merchants.forEach(merchant => {
      const category = merchant.category;
      if (!categoryDistribution[category]) {
        categoryDistribution[category] = { count: 0, transactions: 0 };
      }
      categoryDistribution[category].count++;
      categoryDistribution[category].transactions += merchant.count;
    });

    return {
      uniqueMerchants: merchants.length,
      topMerchantByCount: topMerchantsByCount[0]?.merchant || 'None',
      topMerchantByAmount: topMerchantsByAmount[0]?.merchant || 'None',
      avgTransactionsPerMerchant: merchants.reduce((sum, m) => sum + m.count, 0) / merchants.length,
      topMerchantsByCount: topMerchantsByCount.slice(0, 10),
      topMerchantsByAmount: topMerchantsByAmount.slice(0, 10),
      categoryDistribution
    };
  }

  private getMostCommonFrequency(recurringTransactions: any[]): string {
    const frequencies = recurringTransactions.map(t => t.frequency).filter(f => f);
    if (frequencies.length === 0) return 'Unknown';
    
    const frequencyCounts = frequencies.reduce((acc, freq) => {
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(frequencyCounts).reduce((a, b) => 
      frequencyCounts[a[0]] > frequencyCounts[b[0]] ? a : b
    )[0];
  }
}