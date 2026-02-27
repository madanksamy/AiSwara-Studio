import { NextRequest, NextResponse } from 'next/server';
import type { CanonicalSchema } from '@/types/schema';
import { runPipeline, getPipelineStats } from '@aiswara/core';
import type { PipelineResult } from '@aiswara/core';

/**
 * POST /api/generate
 * Runs the multi-agent pipeline to generate a style prompt.
 * Each agent tries its assigned LLM first, falling back to rule-based logic.
 */
export async function POST(request: NextRequest) {
  try {
    const { config, mode } = (await request.json()) as {
      config: CanonicalSchema;
      mode?: 'full' | 'local';
    };

    const platform = config.global.targetPlatform;

    let result: PipelineResult;

    if (mode === 'local') {
      // Force local-only (rule-based fallback for all agents)
      result = await runPipeline({
        config,
        platform,
        debug: false,
      });
    } else {
      // Full pipeline — each agent tries LLM, falls back to rules
      result = await runPipeline({
        config,
        platform,
        debug: process.env.NODE_ENV === 'development',
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Pipeline failed', agentMetadata: result.agentMetadata },
        { status: 500 }
      );
    }

    const stats = getPipelineStats(result);

    return NextResponse.json({
      prompt: result.finalPrompt,
      charCount: result.charCount,
      platform: result.platform,
      stats: {
        totalTimeMs: stats.totalTimeMs,
        totalTokens: stats.totalTokens,
        llmsUsed: stats.llmsUsed,
        agentCount: stats.agentCount,
      },
      agentMetadata: result.agentMetadata,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
