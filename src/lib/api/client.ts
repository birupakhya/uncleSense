// API client for UncleSense frontend

import type { 
  ApiResponse, 
  UploadResponse, 
  AnalysisResponse, 
  Insight, 
  Transaction, 
  ChatMessage,
  AgentStatus,
  ContextualChatMessage
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // File upload
  async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Trigger analysis
  async analyzeFinances(sessionId: string): Promise<ApiResponse<AnalysisResponse>> {
    return this.request<AnalysisResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  // Get insights
  async getInsights(sessionId: string): Promise<ApiResponse<{
    insights: Insight[];
    transactions: Transaction[];
    session_id: string;
  }>> {
    return this.request(`/api/insights/${sessionId}`);
  }

  // Send chat message
  async sendChatMessage(sessionId: string, message: string): Promise<ApiResponse<{
    message: string;
    relatedInsight?: string;
    followUpQuestions?: string[];
    quickActions?: string[];
    session_id: string;
  }>> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    });
  }

  // Get chat history
  async getChatHistory(sessionId: string): Promise<ApiResponse<{
    messages: ContextualChatMessage[];
    session_id: string;
  }>> {
    return this.request(`/api/chat/${sessionId}`);
  }

  // Get agent status
  async getAgentStatus(sessionId: string): Promise<ApiResponse<{
    agents: AgentStatus[];
    overall_progress: number;
    session_id: string;
  }>> {
    return this.request(`/api/agents/${sessionId}/status`);
  }

  // Update agent configuration
  async updateAgentConfig(sessionId: string, config: any): Promise<ApiResponse<{
    success: boolean;
    config: any;
  }>> {
    return this.request('/api/agents/config', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, config }),
    });
  }

  // Get spending analysis
  async getSpendingAnalysis(sessionId: string): Promise<ApiResponse<{
    categories: any[];
    insights: any[];
    trends: any[];
    session_id: string;
  }>> {
    return this.request(`/api/spending/${sessionId}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
