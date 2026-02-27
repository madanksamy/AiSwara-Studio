/**
 * Anthropic Client - Claude Opus 4.6
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMClient, LLMClientConfig, LLMCompletionOptions, LLMCompletionResult } from './types';
import { MODEL_IDS } from './types';

export class AnthropicClient implements LLMClient {
  public readonly provider = 'anthropic' as const;
  public readonly model: string;
  private client: Anthropic;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      baseURL: config.baseUrl,
    });
    this.model = config.model || MODEL_IDS.anthropic;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.defaultMaxTokens = config.defaultMaxTokens ?? 2048;
  }

  async complete(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const startTime = Date.now();

    // Extract system message if present
    const systemMessage = options.messages.find((m) => m.role === 'system');
    const otherMessages = options.messages.filter((m) => m.role !== 'system');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? this.defaultMaxTokens,
      system: systemMessage?.content,
      messages: otherMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options.temperature ?? this.defaultTemperature,
      stop_sequences: options.stopSequences,
    });

    const latencyMs = Date.now() - startTime;

    // Extract text content from response
    const textContent = response.content.find((c) => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    return {
      content,
      provider: this.provider,
      model: this.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason || 'unknown',
      latencyMs,
    };
  }
}

export function createAnthropicClient(config?: LLMClientConfig): AnthropicClient {
  return new AnthropicClient(config);
}
