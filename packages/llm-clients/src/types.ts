/**
 * AiSwara LLM Clients - Common Types
 */

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'ollama' | 'perplexity';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface LLMCompletionResult {
  content: string;
  provider: LLMProvider;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  latencyMs: number;
}

export interface LLMClient {
  provider: LLMProvider;
  model: string;
  complete(options: LLMCompletionOptions): Promise<LLMCompletionResult>;
}

export interface LLMClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}

// Model IDs — updated Feb 2026
export const MODEL_IDS = {
  openai: 'gpt-5.2-pro-highthinking',
  anthropic: 'claude-opus-4-6-20260225',
  google: 'gemini-3-pro-preview',
  mistral: 'mistral-large-3',
  ollama: 'glm-4.5:latest',
  perplexity: 'sonar-pro',
  devstral: 'devstral-2',
} as const;
