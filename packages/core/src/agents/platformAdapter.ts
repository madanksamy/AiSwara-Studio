/**
 * Platform Adapter Agent - Gemini 3 Pro Preview
 * Renders style layers for specific platforms (Suno, HeartMuLa, Generic)
 */

import type { Agent, AgentContext, AgentResult, StyleLayer } from './types';
import { AgentClients } from '@aiswara/llm-clients';
import { getPlatformConfig, formatForPlatform, validateForPlatform } from '../adapters';
import type { StyleInput, PlatformType } from '../adapters/types';

/**
 * Convert agent StyleLayer[] to adapter StyleInput
 */
function styleLayersToStyleInput(layers: StyleLayer[]): StyleInput {
  const input: StyleInput = {};

  for (const layer of layers) {
    switch (layer.category) {
      case 'genre':
        input.genre = layer.description;
        break;
      case 'mood':
        input.mood = layer.description;
        break;
      case 'instrumentation':
        input.instruments = layer.keywords;
        break;
      case 'vocals':
        input.vocals = { style: layer.description };
        break;
      case 'ornamentation':
        input.ornamentation = layer.keywords;
        break;
      case 'structure':
        input.structure = layer.description;
        break;
      case 'mix':
        input.production = layer.keywords;
        break;
    }
  }

  return input;
}

function buildSystemPrompt(platform: PlatformType): string {
  const config = getPlatformConfig(platform);
  return `You are a Platform Adapter for AiSwara Music Studio.
Given an array of style layers (each with category, description, priority, keywords),
compose a single cohesive music style prompt optimized for the "${platform}" AI music platform.

Platform constraints:
- Target character range: ${config.minChars}-${config.maxChars} characters
- ${platform === 'heartmula' ? 'Use structured keyword-heavy tags' : 'Use natural, flowing language descriptions'}
- Capitalize first letter, end with a period
- Be specific with musical terminology, especially Indian/Tamil music terms

Return ONLY the final prompt string, no explanation or quotes.`;
}

export const platformAdapter: Agent = {
  name: 'PlatformAdapter',
  llmProvider: 'google',

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      const styleLayers = context.styleLayers || [];
      const platform = context.targetPlatform;

      let platformOutput: string;
      let tokensUsed = 0;
      let llmUsed = 'gemini-3-pro-preview';
      const decisions: string[] = [];

      try {
        const client = AgentClients.platformAdapter();
        const response = await client.complete({
          messages: [
            { role: 'system', content: buildSystemPrompt(platform) },
            { role: 'user', content: JSON.stringify(styleLayers, null, 2) },
          ],
          temperature: 0.6,
          maxTokens: 1024,
        });

        platformOutput = response.content.trim();
        // Strip surrounding quotes if the LLM wrapped them
        if (platformOutput.startsWith('"') && platformOutput.endsWith('"')) {
          platformOutput = platformOutput.slice(1, -1);
        }
        tokensUsed = response.usage.totalTokens;
        llmUsed = response.model;
        decisions.push('LLM-adapted prompt via Gemini');

        // Post-LLM validation against platform constraints
        const validation = validateForPlatform(platformOutput, platform);
        if (!validation.valid) {
          console.warn(`[PlatformAdapter] Validation warnings: ${validation.errors.join('; ')}`);
          decisions.push(`Validation warnings: ${validation.errors.join('; ')}`);
        }
      } catch {
        // Rule-based fallback using adapter module
        const styleInput = styleLayersToStyleInput(styleLayers);
        const adapterResult = formatForPlatform(styleInput, platform);
        platformOutput = adapterResult.prompt;
        decisions.push('Used adapter-module fallback (LLM unavailable)');
        if (adapterResult.warnings.length > 0) {
          decisions.push(`Adapter warnings: ${adapterResult.warnings.join('; ')}`);
        }
      }

      decisions.push(
        `Adapted for ${platform} platform`,
        `Generated ${platformOutput.length} character output`,
        'Applied platform-specific formatting',
      );

      return {
        success: true,
        context: {
          ...context,
          platformOutput,
          charCount: platformOutput.length,
          metadata: [
            ...context.metadata,
            {
              agentName: 'PlatformAdapter',
              llmUsed,
              tokensUsed,
              processingTimeMs: Date.now() - startTime,
              decisions,
            },
          ],
        },
      };
    } catch (error) {
      return {
        success: false,
        context,
        error: error instanceof Error ? error.message : 'Platform adaptation failed',
      };
    }
  },
};

export default platformAdapter;
