/**
 * Agent Pipeline Orchestrator
 * Coordinates the multi-agent pipeline for prompt generation
 */

import type { AgentContext, PipelineResult } from './types';
import { schemaAgent } from './schemaAgent';
import { styleComposer } from './styleComposer';
import { platformAdapter } from './platformAdapter';
import { lengthController } from './lengthController';
import { qualityConstraints } from './qualityConstraints';

const PLATFORM_LIMITS = {
  suno: { min: 120, max: 580 },
  heartmula: { min: 120, max: 600 },
  generic: { min: 100, max: 600 },
} as const;

export interface PipelineOptions {
  /** Input configuration from UI */
  config: unknown;
  /** Target platform */
  platform: 'suno' | 'heartmula' | 'generic';
  /** Target prompt length (optional, defaults to platform limits) */
  targetLength?: { min: number; max: number };
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Run the full multi-agent pipeline
 */
export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { config, platform, debug = false } = options;

  const targetLength = options.targetLength || PLATFORM_LIMITS[platform];

  // Initialize context
  let context: AgentContext = {
    inputConfig: config,
    targetPlatform: platform,
    targetLength,
    metadata: [],
  };

  const agents = [
    schemaAgent,
    styleComposer,
    platformAdapter,
    lengthController,
    qualityConstraints,
  ];

  try {
    // Execute agents in sequence
    for (const agent of agents) {
      if (debug) {
        console.log(`[Pipeline] Running ${agent.name}...`);
      }

      const result = await agent.execute(context);

      if (!result.success) {
        return {
          success: false,
          finalPrompt: '',
          charCount: 0,
          platform,
          agentMetadata: context.metadata,
          error: `${agent.name} failed: ${result.error}`,
        };
      }

      context = result.context;

      if (debug) {
        console.log(`[Pipeline] ${agent.name} completed in ${context.metadata[context.metadata.length - 1].processingTimeMs}ms`);
      }
    }

    // Return successful result
    return {
      success: true,
      finalPrompt: context.platformOutput || '',
      charCount: context.charCount || 0,
      platform,
      agentMetadata: context.metadata,
    };
  } catch (error) {
    return {
      success: false,
      finalPrompt: '',
      charCount: 0,
      platform,
      agentMetadata: context.metadata,
      error: error instanceof Error ? error.message : 'Pipeline execution failed',
    };
  }
}

/**
 * Run pipeline with local fallback (no LLM calls)
 * Uses the same agent structure but without API calls
 */
export async function runLocalPipeline(options: PipelineOptions): Promise<PipelineResult> {
  // The current implementation already uses local fallbacks
  // This function exists for explicit local-only execution
  return runPipeline(options);
}

/**
 * Get pipeline statistics from a result
 */
export function getPipelineStats(result: PipelineResult) {
  const totalTime = result.agentMetadata.reduce(
    (sum, m) => sum + m.processingTimeMs,
    0
  );

  const totalTokens = result.agentMetadata.reduce(
    (sum, m) => sum + m.tokensUsed,
    0
  );

  const llmsUsed = [...new Set(result.agentMetadata.map((m) => m.llmUsed))];

  return {
    totalTimeMs: totalTime,
    totalTokens,
    llmsUsed,
    agentCount: result.agentMetadata.length,
    charCount: result.charCount,
    platform: result.platform,
  };
}

export default runPipeline;
