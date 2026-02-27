/**
 * Mistral AI Client - Mistral Large 3
 */

import { Mistral } from '@mistralai/mistralai';
import type { LLMClient, LLMClientConfig, LLMCompletionOptions, LLMCompletionResult } from './types';
import { MODEL_IDS } from './types';

export class MistralClient implements LLMClient {
  public readonly provider = 'mistral' as const;
  public readonly model: string;
  private client: Mistral;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    const apiKey = config.apiKey || process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('Mistral API key is required');
    }
    this.client = new Mistral({ apiKey });
    this.model = config.model || MODEL_IDS.mistral;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.defaultMaxTokens = config.defaultMaxTokens ?? 2048;
  }

  async complete(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const startTime = Date.now();

    const response = await this.client.chat.complete({
      model: this.model,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? this.defaultTemperature,
      maxTokens: options.maxTokens ?? this.defaultMaxTokens,
      stop: options.stopSequences,
    });

    const latencyMs = Date.now() - startTime;

    const choice = response.choices?.[0];
    const content = typeof choice?.message?.content === 'string'
      ? choice.message.content
      : '';

    return {
      content,
      provider: this.provider,
      model: this.model,
      usage: {
        promptTokens: response.usage?.promptTokens || 0,
        completionTokens: response.usage?.completionTokens || 0,
        totalTokens: response.usage?.totalTokens || 0,
      },
      finishReason: choice?.finishReason || 'unknown',
      latencyMs,
    };
  }
}

export function createMistralClient(config?: LLMClientConfig): MistralClient {
  return new MistralClient(config);
}
