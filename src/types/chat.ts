export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
  timestamp: number;
}

export interface ChatRequest {
  model: string;
  messages: {
    role: string;
    content: string;
    images?: string[];
  }[];
  stream: boolean;
}

export interface ChatResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}