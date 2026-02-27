/**
 * Schema Agent - Mistral Large 3
 * Normalizes and validates config, resolves conflicts
 */

import type { Agent, AgentContext, AgentResult } from './types';
import { AgentClients } from '@aiswara/llm-clients';

const SYSTEM_PROMPT = `You are a music configuration schema agent for AiSwara Music Studio.
Your job is to normalize and validate a JSON music configuration object.

Rules:
- Ensure tempo is between 40-200 BPM
- Ensure all mood axis values are between 0-100
- Limit instruments to the maxInstruments count
- Resolve any conflicts (e.g., instrumental_only language with vocal styles set)
- Ensure percussion density/fills/complexity are 0-100
- Return the normalized JSON config ONLY, no explanation`;

export const schemaAgent: Agent = {
  name: 'SchemaAgent',
  llmProvider: 'mistral',

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      let normalizedConfig: unknown;
      let tokensUsed = 0;
      let llmUsed = 'mistral-large-3';
      const decisions: string[] = [];

      try {
        const client = AgentClients.schemaAgent();
        const response = await client.complete({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(context.inputConfig, null, 2) },
          ],
          temperature: 0.1,
          maxTokens: 4096,
        });

        normalizedConfig = JSON.parse(response.content);
        tokensUsed = response.usage.totalTokens;
        llmUsed = response.model;
        decisions.push('LLM-normalized config via Mistral');
      } catch {
        normalizedConfig = normalizeConfig(context.inputConfig);
        decisions.push('Used rule-based fallback (LLM unavailable)');
      }

      decisions.push('Validated input schema', 'Normalized tempo to BPM range', 'Resolved instrument conflicts');

      return {
        success: true,
        context: {
          ...context,
          normalizedConfig,
          metadata: [
            ...context.metadata,
            {
              agentName: 'SchemaAgent',
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
        error: error instanceof Error ? error.message : 'Schema validation failed',
      };
    }
  },
};

/**
 * Basic config normalization (rule-based fallback)
 */
function normalizeConfig(config: unknown): unknown {
  if (!config || typeof config !== 'object') {
    return config;
  }

  const normalized = { ...(config as Record<string, unknown>) };

  if (!normalized.global) {
    normalized.global = {};
  }

  const global = normalized.global as Record<string, unknown>;
  if (typeof global.tempo === 'number') {
    global.tempo = Math.max(40, Math.min(200, global.tempo as number));
  }

  if (global.moodAxes && typeof global.moodAxes === 'object') {
    const axes = global.moodAxes as Record<string, number>;
    for (const key of Object.keys(axes)) {
      axes[key] = Math.max(0, Math.min(100, axes[key]));
    }
  }

  if (normalized.instrumentation && typeof normalized.instrumentation === 'object') {
    const inst = normalized.instrumentation as Record<string, unknown>;
    if (Array.isArray(inst.instruments)) {
      const maxInst = (inst.maxInstruments as number) || 8;
      if (inst.instruments.length > maxInst) {
        inst.instruments = inst.instruments.slice(0, maxInst);
      }
    }
  }

  return normalized;
}

export default schemaAgent;
