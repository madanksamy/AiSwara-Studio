/**
 * AiSwara Music Studio - Core Package
 * Shared business logic, types, and utilities
 */

// Schema (types, validators, defaults)
// Note: schema/types.ts exports AgentMetadata which conflicts with agents/types.ts
// We re-export schema selectively and let agents take priority
export {
  type CanonicalSchema as CoreCanonicalSchema,
  type GlobalConfig as CoreGlobalConfig,
  type MoodAxes as CoreMoodAxes,
  type Instrumentation as CoreInstrumentation,
  type VocalConfig as CoreVocalConfig,
  type Ornamentation as CoreOrnamentation,
  type Structure as CoreStructure,
  type MixConfig as CoreMixConfig,
  type PipelineOutput,
  type Preset,
  type InputConfig,
} from './schema/types';
export * from './schema/validators';
export * from './schema/defaults';

// Agents
export * from './agents';

// Adapters
export * from './adapters';

// Instruments (will be added with config)
// export * from './instruments';

// Presets (will be added in Phase 6)
// export * from './presets';
