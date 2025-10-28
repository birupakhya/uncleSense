// Financial-specific Hugging Face models for data extraction agent

// Dynamic import for browser compatibility
let pipeline: any = null;
let Pipeline: any = null;

// Initialize transformers library dynamically
async function initializeTransformers() {
  if (pipeline && Pipeline) return; // Already initialized
  
  try {
    // Check if we're in a browser environment and transformers is available
    if (typeof window !== 'undefined') {
      try {
        const transformers = await import('@xenova/transformers');
        pipeline = transformers.pipeline;
        Pipeline = transformers.Pipeline;
        console.log('Transformers library loaded successfully');
      } catch (importError) {
        console.warn('Failed to import transformers library:', importError);
        pipeline = null;
        Pipeline = null;
      }
    } else {
      // Cloudflare Worker or Node.js environment - use fallback methods
      console.log('Running in server environment, using fallback categorization methods');
      pipeline = null;
      Pipeline = null;
    }
  } catch (error) {
    console.warn('Transformers library not available, using fallback methods:', error);
    pipeline = null;
    Pipeline = null;
  }
}

export interface TransactionCategory {
  category: string;
  confidence: number;
}

export interface MerchantEmbedding {
  merchant: string;
  embedding: number[];
}

export interface PatternDetectionResult {
  isRecurring: boolean;
  frequency?: string;
  confidence: number;
  pattern?: string;
}

// Financial transaction categories
export const TRANSACTION_CATEGORIES = [
  'Groceries & Food',
  'Dining & Restaurants',
  'Transportation',
  'Utilities & Bills',
  'Entertainment & Recreation',
  'Shopping & Retail',
  'Healthcare & Medical',
  'Insurance',
  'Subscriptions & Services',
  'Travel & Hotels',
  'Education',
  'Investments & Savings',
  'Income & Deposits',
  'Transfers',
  'Other'
] as const;

export type TransactionCategoryType = typeof TRANSACTION_CATEGORIES[number];

export class FinancialModelsClient {
  private classificationPipeline: any = null;
  private embeddingPipeline: any = null;
  private initialized = false;
  private useModels = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize transformers library
      await initializeTransformers();
      
      if (pipeline && typeof window !== 'undefined') {
        // Browser environment - try to load models
        try {
          // Initialize classification pipeline for transaction categorization
          this.classificationPipeline = await pipeline(
            'text-classification',
            'soleimanian/financial-roberta-large-sentiment',
            { quantized: true }
          );

          // Initialize embedding pipeline for merchant normalization
          this.embeddingPipeline = await pipeline(
            'feature-extraction',
            'nickmuchi/setfit-finetuned-financial-text',
            { quantized: true }
          );

          this.useModels = true;
          console.log('Financial models initialized successfully');
        } catch (modelError) {
          console.warn('Failed to load models, using fallback methods:', modelError);
          this.useModels = false;
        }
      } else {
        // Node.js environment or models not available
        console.log('Using fallback categorization methods');
        this.useModels = false;
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize financial models:', error);
      this.useModels = false;
      this.initialized = true; // Mark as initialized to prevent retry loops
    }
  }

  async categorizeTransaction(description: string, amount?: number): Promise<TransactionCategory> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useModels && this.classificationPipeline) {
        // Use the actual model
        const enhancedDescription = amount 
          ? `${description} Amount: $${amount}`
          : description;

        const result = await this.classificationPipeline(enhancedDescription);
        
        // Map sentiment labels to transaction categories
        const category = this.mapSentimentToCategory(result[0].label, description, amount);
        
        return {
          category,
          confidence: result[0].score
        };
      } else {
        // Use fallback categorization
        return this.fallbackCategorization(description, amount);
      }
    } catch (error) {
      console.error('Transaction categorization failed:', error);
      // Fallback to rule-based categorization
      return this.fallbackCategorization(description, amount);
    }
  }

  async generateMerchantEmbedding(merchantName: string): Promise<number[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (this.useModels && this.embeddingPipeline) {
        const result = await this.embeddingPipeline(merchantName);
        return result.data;
      } else {
        // Return a simple hash-based embedding as fallback
        return this.generateFallbackEmbedding(merchantName);
      }
    } catch (error) {
      console.error('Merchant embedding generation failed:', error);
      // Return a simple hash-based embedding as fallback
      return this.generateFallbackEmbedding(merchantName);
    }
  }

  async normalizeMerchantNames(merchantNames: string[]): Promise<Map<string, string>> {
    const embeddings: MerchantEmbedding[] = [];
    const normalizationMap = new Map<string, string>();

    // Generate embeddings for all merchant names
    for (const merchant of merchantNames) {
      const embedding = await this.generateMerchantEmbedding(merchant);
      embeddings.push({ merchant, embedding });
    }

    // Group similar merchants using cosine similarity
    const clusters = this.clusterMerchants(embeddings);
    
    // Create normalization map
    for (const cluster of clusters) {
      const canonicalName = this.selectCanonicalName(cluster);
      for (const merchant of cluster) {
        normalizationMap.set(merchant, canonicalName);
      }
    }

    return normalizationMap;
  }

  async detectRecurringPattern(
    merchantName: string,
    amounts: number[],
    dates: string[]
  ): Promise<PatternDetectionResult> {
    try {
      // Analyze amount patterns
      const amountPattern = this.analyzeAmountPattern(amounts);
      
      // Analyze date patterns
      const datePattern = this.analyzeDatePattern(dates);
      
      // Combine patterns for final decision
      const isRecurring = amountPattern.isConsistent && datePattern.isRegular;
      const confidence = (amountPattern.confidence + datePattern.confidence) / 2;
      
      return {
        isRecurring,
        frequency: datePattern.frequency,
        confidence,
        pattern: `${amountPattern.description} ${datePattern.description}`
      };
    } catch (error) {
      console.error('Pattern detection failed:', error);
      return {
        isRecurring: false,
        confidence: 0,
        pattern: 'Unable to detect pattern'
      };
    }
  }

  private mapSentimentToCategory(
    sentiment: string, 
    description: string, 
    amount?: number
  ): TransactionCategoryType {
    const desc = description.toLowerCase();
    
    // Enhanced rule-based mapping with more patterns
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('supermarket') || 
        desc.includes('whole foods') || desc.includes('trader joe') || desc.includes('kroger') ||
        desc.includes('safeway') || desc.includes('publix') || desc.includes('market')) {
      return 'Groceries & Food';
    }
    if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('dining') ||
        desc.includes('mcdonald') || desc.includes('starbucks') || desc.includes('subway') ||
        desc.includes('pizza') || desc.includes('burger') || desc.includes('food')) {
      return 'Dining & Restaurants';
    }
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('shell') || 
        desc.includes('exxon') || desc.includes('chevron') || desc.includes('bp') ||
        desc.includes('uber') || desc.includes('lyft') || desc.includes('taxi') ||
        desc.includes('transportation') || desc.includes('metro') || desc.includes('bus')) {
      return 'Transportation';
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || 
        desc.includes('phone') || desc.includes('cable') || desc.includes('utility') ||
        desc.includes('at&t') || desc.includes('verizon') || desc.includes('comcast')) {
      return 'Utilities & Bills';
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('subscription') ||
        desc.includes('hulu') || desc.includes('disney') || desc.includes('prime') ||
        desc.includes('apple music') || desc.includes('youtube') || desc.includes('adobe')) {
      return 'Subscriptions & Services';
    }
    if (desc.includes('amazon') || desc.includes('target') || desc.includes('walmart') ||
        desc.includes('costco') || desc.includes('best buy') || desc.includes('home depot') ||
        desc.includes('amzn') || desc.includes('retail') || desc.includes('store')) {
      return 'Shopping & Retail';
    }
    if (desc.includes('medical') || desc.includes('doctor') || desc.includes('pharmacy') ||
        desc.includes('hospital') || desc.includes('clinic') || desc.includes('cvs') ||
        desc.includes('walgreens') || desc.includes('health')) {
      return 'Healthcare & Medical';
    }
    if (desc.includes('hotel') || desc.includes('travel') || desc.includes('flight') ||
        desc.includes('airline') || desc.includes('booking') || desc.includes('expedia') ||
        desc.includes('airbnb') || desc.includes('marriott') || desc.includes('hilton')) {
      return 'Travel & Hotels';
    }
    if (desc.includes('salary') || desc.includes('deposit') || desc.includes('income') ||
        desc.includes('payroll') || desc.includes('direct deposit') || desc.includes('refund') ||
        desc.includes('cashback') || desc.includes('interest')) {
      return 'Income & Deposits';
    }
    if (desc.includes('insurance') || desc.includes('premium') || desc.includes('coverage')) {
      return 'Insurance';
    }
    if (desc.includes('school') || desc.includes('university') || desc.includes('education') ||
        desc.includes('tuition') || desc.includes('student') || desc.includes('course')) {
      return 'Education';
    }
    if (desc.includes('investment') || desc.includes('savings') || desc.includes('retirement') ||
        desc.includes('401k') || desc.includes('ira') || desc.includes('mutual fund') ||
        desc.includes('stock') || desc.includes('bond')) {
      return 'Investments & Savings';
    }
    if (desc.includes('transfer') || desc.includes('payment') || desc.includes('venmo') ||
        desc.includes('paypal') || desc.includes('zelle') || desc.includes('cash app')) {
      return 'Transfers';
    }
    
    // Use amount as additional context
    if (amount && amount < 0) {
      return 'Other';
    }
    if (amount && amount > 0) {
      return 'Income & Deposits';
    }
    
    return 'Other';
  }

  private fallbackCategorization(description: string, amount?: number): TransactionCategory {
    const category = this.mapSentimentToCategory('neutral', description, amount);
    return {
      category,
      confidence: 0.7 // Higher confidence for rule-based categorization
    };
  }

  private generateFallbackEmbedding(merchantName: string): number[] {
    // Simple hash-based embedding as fallback
    const hash = this.simpleHash(merchantName);
    const embedding = new Array(384).fill(0);
    
    for (let i = 0; i < Math.min(hash.length, 384); i++) {
      embedding[i] = (hash.charCodeAt(i) % 100) / 100;
    }
    
    return embedding;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  private clusterMerchants(embeddings: MerchantEmbedding[]): string[][] {
    const clusters: string[][] = [];
    const threshold = 0.8; // Cosine similarity threshold
    
    for (const embedding of embeddings) {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const clusterEmbedding = embeddings.find(e => e.merchant === cluster[0]);
        if (clusterEmbedding && this.cosineSimilarity(embedding.embedding, clusterEmbedding.embedding) > threshold) {
          cluster.push(embedding.merchant);
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push([embedding.merchant]);
      }
    }
    
    return clusters;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private selectCanonicalName(cluster: string[]): string {
    // Select the shortest, most common name as canonical
    return cluster.reduce((shortest, current) => 
      current.length < shortest.length ? current : shortest
    );
  }

  private analyzeAmountPattern(amounts: number[]): { isConsistent: boolean; confidence: number; description: string } {
    if (amounts.length < 2) {
      return { isConsistent: false, confidence: 0, description: 'Insufficient data' };
    }
    
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / Math.abs(mean);
    
    const isConsistent = coefficientOfVariation < 0.1; // Less than 10% variation
    const confidence = Math.max(0, 1 - coefficientOfVariation);
    
    return {
      isConsistent,
      confidence,
      description: isConsistent ? 'Consistent amounts' : 'Variable amounts'
    };
  }

  private analyzeDatePattern(dates: string[]): { isRegular: boolean; confidence: number; frequency?: string; description: string } {
    if (dates.length < 3) {
      return { isRegular: false, confidence: 0, description: 'Insufficient data' };
    }
    
    const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    const intervals: number[] = [];
    
    for (let i = 1; i < sortedDates.length; i++) {
      intervals.push(sortedDates[i].getTime() - sortedDates[i-1].getTime());
    }
    
    const meanInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - meanInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / meanInterval;
    
    const isRegular = coefficientOfVariation < 0.2; // Less than 20% variation
    const confidence = Math.max(0, 1 - coefficientOfVariation);
    
    // Determine frequency
    let frequency: string | undefined;
    const daysInterval = meanInterval / (1000 * 60 * 60 * 24);
    if (daysInterval >= 28 && daysInterval <= 31) frequency = 'Monthly';
    else if (daysInterval >= 6 && daysInterval <= 8) frequency = 'Weekly';
    else if (daysInterval >= 1 && daysInterval <= 2) frequency = 'Daily';
    else if (daysInterval >= 89 && daysInterval <= 92) frequency = 'Quarterly';
    else if (daysInterval >= 364 && daysInterval <= 366) frequency = 'Yearly';
    
    return {
      isRegular,
      confidence,
      frequency,
      description: isRegular ? `Regular ${frequency || 'pattern'}` : 'Irregular pattern'
    };
  }
}
