/**
 * HeartMuLa Platform Adapter
 * Formats prompts for HeartMuLa's AI music generation
 */

import type { PlatformConfig, StyleInput, AdapterOutput } from './types';

export const heartmulaConfig: PlatformConfig = {
  name: 'HeartMuLa',
  type: 'heartmula',
  maxChars: 600,
  minChars: 120,
  features: {
    genreTags: true,
    moodDescriptors: true,
    instrumentSpecs: true,
    vocalSpecs: true,
    productionSpecs: true,
    structureHints: true,
    tempoSpecs: true,
    culturalTags: true,
  },
  formatting: {
    separator: ', ',
    titleCase: false,
    useAbbreviations: false,
    maxWordsPerDescriptor: 5,
    stylePrefix: '',
    styleSuffix: '',
  },
};

/**
 * Format style input for HeartMuLa platform
 */
export function formatForHeartMuLa(input: StyleInput): AdapterOutput {
  const parts: string[] = [];
  const elementsIncluded: string[] = [];
  const elementsDropped: string[] = [];
  const warnings: string[] = [];

  // Genre
  if (input.genre) {
    parts.push(formatGenre(input.genre));
    elementsIncluded.push('genre');
  }

  // Mood
  if (input.mood) {
    parts.push(input.mood);
    elementsIncluded.push('mood');
  }

  // Tempo with BPM for HeartMuLa (it may support exact BPM)
  if (input.tempo) {
    parts.push(`${input.tempo} BPM`);
    elementsIncluded.push('tempo');
  }

  // Vocals (HeartMuLa supports detailed vocal specs)
  if (input.vocals) {
    const vocalPart = formatVocals(input.vocals);
    if (vocalPart) {
      parts.push(vocalPart);
      elementsIncluded.push('vocals');
    }
  }

  // Instruments (HeartMuLa can handle more instruments)
  if (input.instruments && input.instruments.length > 0) {
    const instPart = formatInstruments(input.instruments, 5);
    parts.push(instPart);
    elementsIncluded.push('instruments');
  }

  // Ornamentation (good support for Indian classical elements)
  if (input.ornamentation && input.ornamentation.length > 0) {
    const ornPart = formatOrnamentation(input.ornamentation);
    parts.push(ornPart);
    elementsIncluded.push('ornamentation');
  }

  // Structure
  if (input.structure) {
    parts.push(`${input.structure.replace(/_/g, ' ')} structure`);
    elementsIncluded.push('structure');
  }

  // Production
  if (input.production && input.production.length > 0) {
    const prodPart = input.production.slice(0, 3).join(', ') + ' production';
    parts.push(prodPart);
    elementsIncluded.push('production');
  }

  // Build prompt
  let prompt = parts.join(heartmulaConfig.formatting.separator);

  // Capitalize first letter
  prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);

  // Ensure ends with period
  if (!prompt.endsWith('.')) {
    prompt += '.';
  }

  // Check length
  let compressionApplied = false;
  if (prompt.length > heartmulaConfig.maxChars) {
    prompt = compressPrompt(prompt, heartmulaConfig.maxChars);
    compressionApplied = true;
    warnings.push('Prompt was compressed to fit character limit');
  }

  return {
    prompt,
    charCount: prompt.length,
    platform: 'heartmula',
    warnings,
    metadata: {
      elementsIncluded,
      elementsDropped,
      compressionApplied,
    },
  };
}

function formatGenre(genre: string): string {
  return genre.replace(/_/g, ' ');
}

function formatVocals(vocals: StyleInput['vocals']): string {
  if (!vocals) return '';

  const parts: string[] = [];

  if (vocals.language === 'instrumental_only') {
    return 'instrumental';
  }

  if (vocals.gender && vocals.gender !== 'neutral') {
    parts.push(vocals.gender);
  }

  if (vocals.language) {
    parts.push(vocals.language);
  }

  parts.push('vocals');

  if (vocals.style) {
    parts.push(`in ${vocals.style.replace(/_/g, ' ')} style`);
  }

  return parts.join(' ');
}

function formatInstruments(instruments: string[], max: number): string {
  const limited = instruments.slice(0, max);

  if (limited.length === 1) return limited[0];
  if (limited.length === 2) return `${limited[0]} and ${limited[1]}`;

  return `${limited.slice(0, -1).join(', ')}, and ${limited[limited.length - 1]}`;
}

function formatOrnamentation(ornamentation: string[]): string {
  if (ornamentation.length === 0) return '';

  // HeartMuLa understands Indian classical terms
  const formatted = ornamentation.map((o) => o.replace(/_/g, ' '));

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;

  return formatted.slice(0, 3).join(', ');
}

function compressPrompt(prompt: string, maxChars: number): string {
  if (prompt.length <= maxChars) return prompt;

  // Progressive compression
  let compressed = prompt
    .replace(/\s+and\s+/g, ', ')
    .replace(/\s+with\s+/g, ', ');

  if (compressed.length <= maxChars) return compressed;

  // Truncate smartly
  compressed = compressed.substring(0, maxChars - 1);
  const lastBreak = Math.max(
    compressed.lastIndexOf(', '),
    compressed.lastIndexOf('. ')
  );

  if (lastBreak > maxChars * 0.75) {
    compressed = compressed.substring(0, lastBreak);
  }

  if (!compressed.endsWith('.')) {
    compressed += '.';
  }

  return compressed;
}

export default {
  config: heartmulaConfig,
  format: formatForHeartMuLa,
};
