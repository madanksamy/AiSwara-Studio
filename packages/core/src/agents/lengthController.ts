/**
 * Length Controller Agent - Gemini 3 Pro Preview
 * Compresses or expands prompt to target character range
 */

import type { Agent, AgentContext, AgentResult } from './types';
import { AgentClients } from '@aiswara/llm-clients';

function buildLengthPrompt(action: 'expand' | 'compress', min: number, max: number): string {
  if (action === 'expand') {
    return `You are a music prompt length controller. The current prompt is too short.
Expand it to be between ${min}-${max} characters by adding rich, evocative musical details.
Keep the same style and meaning. Add texture descriptions, mood elaboration, and production details.
Return ONLY the expanded prompt, no explanation.`;
  }
  return `You are a music prompt length controller. The current prompt is too long.
Compress it to be between ${min}-${max} characters while preserving the most important musical details.
Prioritize genre, mood, instruments, and vocals over production/mix details.
Return ONLY the compressed prompt, no explanation.`;
}

export const lengthController: Agent = {
  name: 'LengthController',
  llmProvider: 'google',

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      const input = context.platformOutput || '';
      const { min, max } = context.targetLength;
      const currentLength = input.length;

      let adjustedPrompt = input;
      let tokensUsed = 0;
      let llmUsed = 'gemini-3-pro-preview';
      const decisions: string[] = [];

      if (currentLength < min || currentLength > max) {
        const action = currentLength < min ? 'expand' : 'compress';

        try {
          const client = AgentClients.lengthController();
          const response = await client.complete({
            messages: [
              { role: 'system', content: buildLengthPrompt(action, min, max) },
              { role: 'user', content: input },
            ],
            temperature: 0.4,
            maxTokens: 1024,
          });

          adjustedPrompt = response.content.trim();
          if (adjustedPrompt.startsWith('"') && adjustedPrompt.endsWith('"')) {
            adjustedPrompt = adjustedPrompt.slice(1, -1);
          }
          tokensUsed = response.usage.totalTokens;
          llmUsed = response.model;
          decisions.push(`LLM-${action}ed via Gemini from ${currentLength} to ${adjustedPrompt.length} chars`);
        } catch {
          if (action === 'expand') {
            adjustedPrompt = expandPrompt(input, min);
          } else {
            adjustedPrompt = compressPrompt(input, max);
          }
          decisions.push(`Rule-based ${action} from ${currentLength} to ${adjustedPrompt.length} chars (LLM unavailable)`);
        }
      } else {
        decisions.push(`Length ${currentLength} is within target range (${min}-${max})`);
      }

      return {
        success: true,
        context: {
          ...context,
          platformOutput: adjustedPrompt,
          charCount: adjustedPrompt.length,
          metadata: [
            ...context.metadata,
            {
              agentName: 'LengthController',
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
        error: error instanceof Error ? error.message : 'Length adjustment failed',
      };
    }
  },
};

/**
 * Expand a prompt to reach minimum length (rule-based fallback)
 */
function expandPrompt(prompt: string, targetMin: number): string {
  if (prompt.length >= targetMin) return prompt;

  const expansions = [
    'with rich, layered textures',
    'creating an immersive atmosphere',
    'blending traditional and modern elements',
    'featuring expressive dynamics',
    'with careful attention to sonic detail',
  ];

  let expanded = prompt.endsWith('.') ? prompt.slice(0, -1) : prompt;

  let idx = 0;
  while (expanded.length < targetMin && idx < expansions.length) {
    expanded += ', ' + expansions[idx];
    idx++;
  }

  if (!expanded.endsWith('.')) {
    expanded += '.';
  }

  return expanded;
}

/**
 * Compress a prompt to fit maximum length (rule-based fallback)
 */
function compressPrompt(prompt: string, targetMax: number): string {
  if (prompt.length <= targetMax) return prompt;

  let compressed = prompt
    .replace(/\s+and\s+/g, ', ')
    .replace(/\s+with\s+/g, ', ')
    .replace(/\s+featuring\s+/g, ', ')
    .replace(/very\s+/g, '')
    .replace(/really\s+/g, '')
    .replace(/highly\s+/g, '')
    .replace(/extremely\s+/g, '');

  if (compressed.length <= targetMax) {
    return compressed;
  }

  const parts = compressed.split(/[,;]/);
  while (compressed.length > targetMax && parts.length > 2) {
    const midIdx = Math.floor(parts.length / 2);
    parts.splice(midIdx, 1);
    compressed = parts.join(', ').trim();
  }

  if (compressed.length > targetMax) {
    compressed = compressed.substring(0, targetMax - 3) + '...';
  }

  return compressed;
}

export default lengthController;
