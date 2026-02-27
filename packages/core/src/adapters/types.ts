/**
 * Platform Adapter Types
 * Definitions for platform-specific output formatting
 */

export type PlatformType = 'suno' | 'heartmula' | 'generic';

export interface PlatformConfig {
  name: string;
  type: PlatformType;
  maxChars: number;
  minChars: number;
  features: PlatformFeatures;
  formatting: FormattingRules;
}

export interface PlatformFeatures {
  /** Supports genre tags */
  genreTags: boolean;
  /** Supports mood descriptors */
  moodDescriptors: boolean;
  /** Supports instrument specifications */
  instrumentSpecs: boolean;
  /** Supports vocal specifications */
  vocalSpecs: boolean;
  /** Supports production/mix descriptors */
  productionSpecs: boolean;
  /** Supports structure hints */
  structureHints: boolean;
  /** Supports tempo specifications */
  tempoSpecs: boolean;
  /** Supports cultural/regional tags */
  culturalTags: boolean;
}

export interface FormattingRules {
  /** How to separate elements */
  separator: string;
  /** Whether to use Title Case */
  titleCase: boolean;
  /** Whether to use abbreviations */
  useAbbreviations: boolean;
  /** Maximum words per descriptor */
  maxWordsPerDescriptor: number;
  /** Prefix for style prompts */
  stylePrefix?: string;
  /** Suffix for style prompts */
  styleSuffix?: string;
}

export interface AdapterOutput {
  prompt: string;
  charCount: number;
  platform: PlatformType;
  warnings: string[];
  metadata: {
    elementsIncluded: string[];
    elementsDropped: string[];
    compressionApplied: boolean;
  };
}

export interface StyleInput {
  genre?: string;
  mood?: string;
  tempo?: number;
  instruments?: string[];
  vocals?: {
    language?: string;
    gender?: string;
    style?: string;
  };
  ornamentation?: string[];
  production?: string[];
  structure?: string;
}
