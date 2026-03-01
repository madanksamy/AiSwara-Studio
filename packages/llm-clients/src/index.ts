/**
 * AiSwara LLM Clients
 * Unified interface for multiple LLM providers
 */

// Types
export * from './types';

// Individual clients
export { OpenAIClient, createOpenAIClient } from './openai';
export { AnthropicClient, createAnthropicClient } from './anthropic';
export { GoogleAIClient, createGoogleAIClient } from './google';
export { MistralClient, createMistralClient } from './mistral';
export { OllamaClient, createOllamaClient } from './ollama';
export { PerplexityClient, createPerplexityClient } from './perplexity';

// Factory function
import type { LLMClient, LLMClientConfig, LLMProvider } from './types';
import { MODEL_IDS } from './types';
import { createOpenAIClient } from './openai';
import { createAnthropicClient } from './anthropic';
import { createGoogleAIClient } from './google';
import { createMistralClient } from './mistral';
import { createOllamaClient } from './ollama';
import { createPerplexityClient } from './perplexity';

/**
 * Create an LLM client for the specified provider
 */
export function createLLMClient(provider: LLMProvider, config?: LLMClientConfig): LLMClient {
  switch (provider) {
    case 'openai':
      return createOpenAIClient(config);
    case 'anthropic':
      return createAnthropicClient(config);
    case 'google':
      return createGoogleAIClient(config);
    case 'mistral':
      return createMistralClient(config);
    case 'ollama':
      return createOllamaClient(config);
    case 'perplexity':
      return createPerplexityClient(config);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

/**
 * Create all configured LLM clients
 */
export function createAllClients(configs?: Partial<Record<LLMProvider, LLMClientConfig>>): Record<LLMProvider, LLMClient> {
  return {
    openai: createOpenAIClient(configs?.openai),
    anthropic: createAnthropicClient(configs?.anthropic),
    google: createGoogleAIClient(configs?.google),
    mistral: createMistralClient(configs?.mistral),
    ollama: createOllamaClient(configs?.ollama),
    perplexity: createPerplexityClient(configs?.perplexity),
  };
}

/**
 * Agent-specific client factory
 * Based on the multi-agent pipeline specification
 */
export const AgentClients = {
  /** Schema Agent - Mistral Large 3 */
  schemaAgent: () => createMistralClient({ model: MODEL_IDS.mistral }),

  /** Style Composer Agent - GPT-5.2 Pro HighThinking */
  styleComposer: () => createOpenAIClient({ model: MODEL_IDS.openai }),

  /** Platform Adapter Agent - Gemini 3 Pro Preview */
  platformAdapter: () => createGoogleAIClient({ model: MODEL_IDS.google }),

  /** Length Controller Agent - Gemini 3 Pro Preview */
  lengthController: () => createGoogleAIClient({ model: MODEL_IDS.google }),

  /** Quality Constraints Agent - Claude Opus 4.6 */
  qualityConstraints: () => createAnthropicClient({ model: MODEL_IDS.anthropic }),

  /** Local Fallback Agent - GLM-4.5 (Ollama) */
  localFallback: () => createOllamaClient({ model: MODEL_IDS.ollama }),

  /** Testing/Diagnostics Agent - Devstral 2 */
  testing: () => createMistralClient({ model: MODEL_IDS.devstral }),

  /** Lyric Writer Agent - Perplexity Sonar Pro */
  lyricWriter: () => createPerplexityClient({ model: MODEL_IDS.perplexity }),
};
