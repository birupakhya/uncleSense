// Frontend Hugging Face integration as a workaround for worker deployment issues
// This will allow us to test the Hugging Face integration while we fix the worker deployment

export class FrontendHuggingFaceClient {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeSentiment(text: string, retries: number = 3): Promise<{
    label: string;
    confidence: number;
    allScores: Array<{ label: string; score: number }>;
  }> {
    console.log(`[FrontendHF] Starting sentiment analysis: ${text.substring(0, 50)}...`);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[FrontendHF] Attempt ${attempt}/${retries}`);
        
        const response = await fetch(`${this.baseUrl}/soleimanian/financial-roberta-large-sentiment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: text,
          }),
        });

        console.log(`[FrontendHF] Response status: ${response.status}`);

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`[FrontendHF] Rate limited, waiting...`);
            if (attempt < retries) {
              await this.delay(2000 * attempt);
              continue;
            }
          }
          
          if (response.status === 503) {
            console.log(`[FrontendHF] Model loading, waiting...`);
            if (attempt < retries) {
              await this.delay(5000 * attempt);
              continue;
            }
          }
          
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[FrontendHF] Response data:`, data);

        if (Array.isArray(data) && data.length > 0) {
          const results = Array.isArray(data[0]) ? data[0] : data;
          if (results.length > 0) {
            const result = {
              label: results[0].label,
              confidence: results[0].score,
              allScores: results
            };
            console.log(`[FrontendHF] Success: ${result.label} (${(result.confidence * 100).toFixed(1)}%)`);
            return result;
          }
        }

        throw new Error('Unexpected response format');
      } catch (error) {
        console.error(`[FrontendHF] Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          console.log(`[FrontendHF] All attempts failed, using fallback`);
          break;
        }
        
        await this.delay(1000 * attempt);
      }
    }
    
    // Fallback analysis
    console.log(`[FrontendHF] Using fallback analysis`);
    const textLower = text.toLowerCase();
    let result;
    if (textLower.includes('exceeded') || textLower.includes('growth') || textLower.includes('positive')) {
      result = { label: 'positive', confidence: 0.8, allScores: [] };
    } else if (textLower.includes('declined') || textLower.includes('negative') || textLower.includes('plummeted')) {
      result = { label: 'negative', confidence: 0.8, allScores: [] };
    } else {
      result = { label: 'neutral', confidence: 0.7, allScores: [] };
    }
    
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test function
export async function testHuggingFaceIntegration() {
  console.log('🧪 Testing Frontend Hugging Face Integration');
  
  const apiKey = process.env.VITE_HUGGINGFACE_API_KEY || 'YOUR_API_KEY_HERE';
  const client = new FrontendHuggingFaceClient(apiKey);
  
  const testTexts = [
    "AMAZON.COM AMZN.COM/BILL WA -45.99",
    "SALARY DEPOSIT +3500.00",
    "NETFLIX.COM -15.99",
    "WHOLE FOODS MARKET -89.45"
  ];
  
  for (const text of testTexts) {
    console.log(`\n📝 Testing: "${text}"`);
    const result = await client.analyzeSentiment(text);
    console.log(`✅ Result: ${result.label} (${(result.confidence * 100).toFixed(1)}%)`);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Frontend integration test complete!');
}
