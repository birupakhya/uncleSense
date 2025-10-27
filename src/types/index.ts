// Core types for UncleSense application

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
}

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  file_type: 'csv' | 'excel' | 'pdf';
  upload_date: string;
  status: 'processing' | 'analyzed' | 'error';
  transaction_count?: number;
}

export interface Transaction {
  id: string;
  upload_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant?: string;
  account_type?: 'checking' | 'savings' | 'credit';
}

export interface Insight {
  id: string;
  session_id: string;
  agent_type: 'data_extraction' | 'spending_analysis' | 'savings_insight' | 'risk_assessment' | 'uncle_personality';
  insight_data: InsightData;
  created_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface InsightData {
  title: string;
  description: string;
  key_numbers?: Record<string, number>;
  recommendations?: string[];
  visual_data?: {
    type: 'chart' | 'progress' | 'icon';
    data: any;
  };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  related_insights?: string[]; // Array of insight IDs
}

// Agent-specific types
export interface AgentResponse {
  agent_type: string;
  insights: InsightData[];
  metadata: Record<string, any>;
}

export interface AgentOrchestratorState {
  session_id: string;
  current_step: 'data_extraction' | 'analysis' | 'personality_transform' | 'complete';
  extracted_data?: Transaction[];
  agent_responses?: AgentResponse[];
  uncle_response?: string;
}

// File parsing types
export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  raw_data: Record<string, any>;
}

export interface FileParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  metadata: {
    file_type: string;
    total_rows: number;
    parsed_rows: number;
    errors: string[];
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  upload_id: string;
  transaction_count: number;
  status: string;
}

export interface AnalysisResponse {
  session_id: string;
  insights: Insight[];
  uncle_summary: string;
}

// Frontend component props
export interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number;
}

export interface ChatInterfaceProps {
  sessionId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isStreaming: boolean;
}

export interface InsightCardProps {
  insight: Insight;
  onAskUncle: (insightId: string) => void;
}

export interface DashboardProps {
  sessionId: string;
  insights: Insight[];
  transactions: Transaction[];
  isLoading: boolean;
}
