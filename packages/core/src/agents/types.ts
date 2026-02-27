/**
 * AiSwara Music Studio - Agent Types
 * Type definitions for the multi-agent pipeline
 */

export interface AgentContext {
  /** Original user config */
  inputConfig: unknown;
  /** Processed/normalized config */
  normalizedConfig?: unknown;
  /** Generated style layers */
  styleLayers?: StyleLayer[];
  /** Platform-specific output */
  platformOutput?: string;
  /** Current character count */
  charCount?: number;
  /** Target platform */
  targetPlatform: 'suno' | 'heartmula' | 'generic';
  /** Target length range */
  targetLength: {
    min: number;
    max: number;
  };
  /** Execution metadata */
  metadata: AgentMetadata[];
}

export interface AgentMetadata {
  agentName: string;
  llmUsed: string;
  tokensUsed: number;
  processingTimeMs: number;
  decisions: string[];
}

export interface StyleLayer {
  category: 'genre' | 'mood' | 'instrumentation' | 'vocals' | 'ornamentation' | 'structure' | 'mix';
  description: string;
  priority: number; // 1-10, higher = more important
  keywords: string[];
}

export interface AgentResult {
  success: boolean;
  context: AgentContext;
  error?: string;
}

export interface Agent {
  name: string;
  llmProvider: 'openai' | 'anthropic' | 'google' | 'mistral' | 'ollama';
  execute: (context: AgentContext) => Promise<AgentResult>;
}

export interface PipelineResult {
  success: boolean;
  finalPrompt: string;
  charCount: number;
  platform: string;
  agentMetadata: AgentMetadata[];
  error?: string;
}
