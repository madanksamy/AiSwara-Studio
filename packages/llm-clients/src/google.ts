/**
 * Google AI Client - Gemini 3 Pro Preview
 * Updated for @google/genai SDK (replaces @google/generative-ai)
 */

import { GoogleGenAI } from '@google/genai';
import type { LLMClient, LLMClientConfig, LLMCompletionOptions, LLMCompletionResult } from './types';
import { MODEL_IDS } from './types';

export class GoogleAIClient implements LLMClient {
  public readonly provider = 'google' as const;
  public readonly model: string;
  private client: GoogleGenAI;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    const apiKey = config.apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API key is required');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = config.model || MODEL_IDS.google;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.defaultMaxTokens = config.defaultMaxTokens ?? 2048;
  }

  async complete(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const startTime = Date.now();

    // Extract system message if present
    const systemMessage = options.messages.find((m) => m.role === 'system');
    const otherMessages = options.messages.filter((m) => m.role !== 'system');

    // Convert messages to @google/genai contents format
    const contents = otherMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: systemMessage?.content || undefined,
        temperature: options.temperature ?? this.defaultTemperature,
        maxOutputTokens: options.maxTokens ?? this.defaultMaxTokens,
        stopSequences: options.stopSequences,
      },
    });

    const latencyMs = Date.now() - startTime;

    // Get token counts if available
    const usageMetadata = response.usageMetadata;

    return {
      content: response.text || '',
      provider: this.provider,
      model: this.model,
      usage: {
        promptTokens: usageMetadata?.promptTokenCount || 0,
        completionTokens: usageMetadata?.candidatesTokenCount || 0,
        totalTokens: usageMetadata?.totalTokenCount || 0,
      },
      finishReason: response.candidates?.[0]?.finishReason || 'unknown',
      latencyMs,
    };
  }
}

export function createGoogleAIClient(config?: LLMClientConfig): GoogleAIClient {
  return new GoogleAIClient(config);
}
