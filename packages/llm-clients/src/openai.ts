/**
 * OpenAI Client - GPT-5.2 Pro HighThinking
 */

import OpenAI from 'openai';
import type { LLMClient, LLMClientConfig, LLMCompletionOptions, LLMCompletionResult } from './types';
import { MODEL_IDS } from './types';

export class OpenAIClient implements LLMClient {
  public readonly provider = 'openai' as const;
  public readonly model: string;
  private client: OpenAI;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
    });
    this.model = config.model || MODEL_IDS.openai;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.defaultMaxTokens = config.defaultMaxTokens ?? 2048;
  }

  async complete(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? this.defaultTemperature,
      max_completion_tokens: options.maxTokens ?? this.defaultMaxTokens,
      stop: options.stopSequences,
    });

    const latencyMs = Date.now() - startTime;
    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      provider: this.provider,
      model: this.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason || 'unknown',
      latencyMs,
    };
  }
}

export function createOpenAIClient(config?: LLMClientConfig): OpenAIClient {
  return new OpenAIClient(config);
}
