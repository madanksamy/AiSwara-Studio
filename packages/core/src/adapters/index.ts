/**
 * AiSwara Music Studio - Platform Adapters
 * Format prompts for different AI music generation platforms
 */

export * from './types';

export { sunoConfig, formatForSuno } from './suno';
export { heartmulaConfig, formatForHeartMuLa } from './heartmula';
export { genericConfig, formatForGeneric } from './generic';

import { formatForSuno, sunoConfig } from './suno';
import { formatForHeartMuLa, heartmulaConfig } from './heartmula';
import { formatForGeneric, genericConfig } from './generic';
import type { PlatformType, StyleInput, AdapterOutput, PlatformConfig } from './types';

/**
 * Get platform configuration
 */
export function getPlatformConfig(platform: PlatformType): PlatformConfig {
  switch (platform) {
    case 'suno':
      return sunoConfig;
    case 'heartmula':
      return heartmulaConfig;
    case 'generic':
    default:
      return genericConfig;
  }
}

/**
 * Format style input for a specific platform
 */
export function formatForPlatform(
  input: StyleInput,
  platform: PlatformType
): AdapterOutput {
  switch (platform) {
    case 'suno':
      return formatForSuno(input);
    case 'heartmula':
      return formatForHeartMuLa(input);
    case 'generic':
    default:
      return formatForGeneric(input);
  }
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): PlatformType[] {
  return ['suno', 'heartmula', 'generic'];
}

/**
 * Validate prompt for platform constraints
 */
export function validateForPlatform(
  prompt: string,
  platform: PlatformType
): { valid: boolean; errors: string[] } {
  const config = getPlatformConfig(platform);
  const errors: string[] = [];

  if (prompt.length > config.maxChars) {
    errors.push(`Prompt exceeds ${platform} max length (${config.maxChars} chars)`);
  }

  if (prompt.length < config.minChars) {
    errors.push(`Prompt is below ${platform} min length (${config.minChars} chars)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
