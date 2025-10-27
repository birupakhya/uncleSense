// HuggingFace API client for UncleSense agents

export interface HuggingFaceRequest {
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    do_sample?: boolean;
  };
}

export interface HuggingFaceResponse {
  generated_text: string;
  error?: string;
}

export class HuggingFaceClient {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(
    model: string,
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    const request: HuggingFaceRequest = {
      inputs: prompt,
      parameters: {
        max_new_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        do_sample: true,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || '';
      }
      
      if (data.error) {
        throw new Error(`HuggingFace API error: ${data.error}`);
      }

      return data.generated_text || '';
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw error;
    }
  }

  async generateStream(
    model: string,
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const request: HuggingFaceRequest = {
      inputs: prompt,
      parameters: {
        max_new_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        do_sample: true,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
      }

      return response.body!;
    } catch (error) {
      console.error('HuggingFace streaming error:', error);
      throw error;
    }
  }
}

// Model configurations
export const MODELS = {
  MISTRAL_7B: 'mistralai/Mistral-7B-Instruct-v0.2',
  LLAMA_3_8B: 'meta-llama/Llama-3-8B-Instruct',
  CODELLAMA_7B: 'codellama/CodeLlama-7b-Instruct-hf',
} as const;

// Default model for UncleSense
export const DEFAULT_MODEL = MODELS.MISTRAL_7B;
