/**
 * Ollama Client - GLM-4.5 (Local)
 */

import type { LLMClient, LLMClientConfig, LLMCompletionOptions, LLMCompletionResult } from './types';
import { MODEL_IDS } from './types';

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaClient implements LLMClient {
  public readonly provider = 'ollama' as const;
  public readonly model: string;
  private baseUrl: string;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = config.model || process.env.OLLAMA_MODEL || MODEL_IDS.ollama;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.defaultMaxTokens = config.defaultMaxTokens ?? 2048;
  }

  async complete(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        options: {
          temperature: options.temperature ?? this.defaultTemperature,
          num_predict: options.maxTokens ?? this.defaultMaxTokens,
          stop: options.stopSequences,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama request failed: ${response.status} - ${error}`);
    }

    const data: OllamaResponse = await response.json();
    const latencyMs = Date.now() - startTime;

    return {
      content: data.message.content,
      provider: this.provider,
      model: this.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
      finishReason: data.done ? 'stop' : 'unknown',
      latencyMs,
    };
  }

  /**
   * Check if Ollama server is running and model is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return false;

      const data = await response.json();
      const models = data.models || [];
      return models.some((m: any) => m.name === this.model || m.name.startsWith(this.model.split(':')[0]));
    } catch {
      return false;
    }
  }
}

export function createOllamaClient(config?: LLMClientConfig): OllamaClient {
  return new OllamaClient(config);
}
