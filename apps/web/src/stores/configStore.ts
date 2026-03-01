import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CanonicalSchema,
  GlobalConfig,
  Instrumentation,
  InstrumentRole,
  VocalConfig,
  Ornamentation,
  Structure,
  MixConfig,
  MacroControls,
  InstrumentConfig,
} from '@/types/schema';
import { DEFAULT_CONFIG } from '@/types/schema';

interface ConfigState {
  // Current config
  config: CanonicalSchema;

  // Generated prompt
  generatedPrompt: string;
  isGenerating: boolean;

  // Actions - Full update helpers
  setConfig: (config: CanonicalSchema) => void;
  updateGlobal: (updates: Partial<GlobalConfig>) => void;
  updateInstrumentation: (updates: Partial<Instrumentation>) => void;
  updateVocals: (updates: Partial<VocalConfig>) => void;
  updateOrnamentation: (updates: Partial<Ornamentation>) => void;
  updateStructure: (updates: Partial<Structure>) => void;
  updateMix: (updates: Partial<MixConfig>) => void;
  updateMacroControls: (updates: Partial<MacroControls>) => void;

  // Actions - Prompt
  setPromptLengthTarget: (target: number) => void;
  setGeneratedPrompt: (prompt: string) => void;
  setIsGenerating: (generating: boolean) => void;

  // Actions - Reset & Presets
  resetToDefaults: () => void;
  loadPreset: (preset: Partial<CanonicalSchema>) => void;

  // Actions - Lyric Writer Integration
  applyLyricSuggestions: (suggestions: {
    instruments: string[];
    stylePrompt: string;
  }) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      generatedPrompt: '',
      isGenerating: false,

      // Set entire config
      setConfig: (config) => set({ config }),

      // Global updates
      updateGlobal: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            global: { ...state.config.global, ...updates },
          },
        })),

      // Instrumentation updates
      updateInstrumentation: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            instrumentation: {
              ...state.config.instrumentation,
              ...updates,
              percussion: updates.percussion
                ? { ...state.config.instrumentation.percussion, ...updates.percussion }
                : state.config.instrumentation.percussion,
            },
          },
        })),

      // Vocal updates
      updateVocals: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            vocals: { ...state.config.vocals, ...updates },
          },
        })),

      // Ornamentation updates
      updateOrnamentation: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            ornamentation: {
              carnatic: updates.carnatic
                ? { ...state.config.ornamentation.carnatic, ...updates.carnatic }
                : state.config.ornamentation.carnatic,
              folk: updates.folk
                ? { ...state.config.ornamentation.folk, ...updates.folk }
                : state.config.ornamentation.folk,
            },
          },
        })),

      // Structure updates
      updateStructure: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            structure: { ...state.config.structure, ...updates },
          },
        })),

      // Mix updates
      updateMix: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            mix: { ...state.config.mix, ...updates },
          },
        })),

      // Macro controls updates
      updateMacroControls: (updates) =>
        set((state) => ({
          config: {
            ...state.config,
            macroControls: { ...state.config.macroControls, ...updates },
          },
        })),

      // Prompt actions
      setPromptLengthTarget: (target) =>
        set((state) => ({
          config: { ...state.config, promptLengthTarget: target },
        })),

      setGeneratedPrompt: (prompt) => set({ generatedPrompt: prompt }),

      setIsGenerating: (generating) => set({ isGenerating: generating }),

      // Reset to defaults
      resetToDefaults: () =>
        set({
          config: DEFAULT_CONFIG,
          generatedPrompt: '',
        }),

      // Load preset
      loadPreset: (preset) =>
        set(() => ({
          config: {
            ...DEFAULT_CONFIG,
            ...preset,
            global: { ...DEFAULT_CONFIG.global, ...preset.global },
            instrumentation: {
              ...DEFAULT_CONFIG.instrumentation,
              ...preset.instrumentation,
              percussion: {
                ...DEFAULT_CONFIG.instrumentation.percussion,
                ...preset.instrumentation?.percussion,
              },
            },
            vocals: { ...DEFAULT_CONFIG.vocals, ...preset.vocals },
            ornamentation: {
              carnatic: {
                ...DEFAULT_CONFIG.ornamentation.carnatic,
                ...preset.ornamentation?.carnatic,
              },
              folk: {
                ...DEFAULT_CONFIG.ornamentation.folk,
                ...preset.ornamentation?.folk,
              },
            },
            structure: { ...DEFAULT_CONFIG.structure, ...preset.structure },
            mix: { ...DEFAULT_CONFIG.mix, ...preset.mix },
            macroControls: { ...DEFAULT_CONFIG.macroControls, ...preset.macroControls },
          },
        })),

      // Apply lyric writer suggestions to instrumentation and prompt
      applyLyricSuggestions: (suggestions) =>
        set((state) => {
          const instruments: InstrumentConfig[] = suggestions.instruments.map(
            (id, index) => ({
              id,
              name: id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              role: (index === 0 ? 'lead' : 'supporting') as InstrumentRole,
              level: 0.7,
              style: '',
              adjectives: [],
            })
          );

          return {
            config: {
              ...state.config,
              instrumentation: {
                ...state.config.instrumentation,
                instruments,
              },
            },
            generatedPrompt: suggestions.stylePrompt,
          };
        }),
    }),
    {
      name: 'aiswara-config',
      partialize: (state) => ({ config: state.config }),
    }
  )
);

// Re-export types for convenience
export type { CanonicalSchema, InstrumentConfig };
export { DEFAULT_CONFIG };
