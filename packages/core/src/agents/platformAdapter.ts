/**
 * Platform Adapter Agent - Gemini 3 Pro Preview
 * Renders style layers for specific platforms (Suno, HeartMuLa, Generic)
 */

import type { Agent, AgentContext, AgentResult, StyleLayer } from './types';
import { AgentClients } from '@aiswara/llm-clients';

const PLATFORM_LIMITS = {
  suno: { min: 120, max: 580 },
  heartmula: { min: 120, max: 600 },
  generic: { min: 100, max: 600 },
};

const PLATFORM_STYLES = {
  suno: {
    separator: ', ',
    useKeywords: false,
    includeProduction: true,
  },
  heartmula: {
    separator: ', ',
    useKeywords: true,
    includeProduction: true,
  },
  generic: {
    separator: ', ',
    useKeywords: false,
    includeProduction: true,
  },
};

function buildSystemPrompt(platform: string, limits: { min: number; max: number }): string {
  return `You are a Platform Adapter for AiSwara Music Studio.
Given an array of style layers (each with category, description, priority, keywords),
compose a single cohesive music style prompt optimized for the "${platform}" AI music platform.

Platform constraints:
- Target character range: ${limits.min}-${limits.max} characters
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
      const limits = PLATFORM_LIMITS[platform];

      let platformOutput: string;
      let tokensUsed = 0;
      let llmUsed = 'gemini-3-pro-preview';
      const decisions: string[] = [];

      try {
        const client = AgentClients.platformAdapter();
        const response = await client.complete({
          messages: [
            { role: 'system', content: buildSystemPrompt(platform, limits) },
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
      } catch {
        platformOutput = adaptForPlatform(styleLayers, platform);
        decisions.push('Used rule-based fallback (LLM unavailable)');
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

/**
 * Adapt style layers to platform-specific format (rule-based fallback)
 */
function adaptForPlatform(layers: StyleLayer[], platform: keyof typeof PLATFORM_STYLES): string {
  const style = PLATFORM_STYLES[platform];
  const sortedLayers = [...layers].sort((a, b) => b.priority - a.priority);
  const parts: string[] = [];

  for (const layer of sortedLayers) {
    if (style.useKeywords && layer.keywords.length > 0) {
      parts.push(...layer.keywords.slice(0, 3));
    } else {
      parts.push(layer.description);
    }
  }

  let prompt = parts.filter(Boolean).join(style.separator);
  prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
  if (!prompt.endsWith('.')) {
    prompt += '.';
  }

  return prompt;
}

export default platformAdapter;
