export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  functionCalls?: Record<string, any>;
  timestamp: string;
  isUser?: boolean;
}

export interface ChatResponse {
  response: string;
  functions?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
  data?: any[];
}
