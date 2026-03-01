import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LyricWriterConfig, LLMResult } from '@/types/lyricWriter';
import { DEFAULT_LYRIC_CONFIG } from '@/types/lyricWriter';

interface LyricWriterState {
  // State
  config: LyricWriterConfig;
  results: LLMResult[];
  isGenerating: boolean;
  selectedIndex: number | null;

  // Actions
  updateConfig: (updates: Partial<LyricWriterConfig>) => void;
  setResults: (results: LLMResult[]) => void;
  setIsGenerating: (val: boolean) => void;
  selectResult: (index: number) => void;
  resetResults: () => void;
}

export const useLyricWriterStore = create<LyricWriterState>()(
  persist(
    (set) => ({
      config: DEFAULT_LYRIC_CONFIG,
      results: [],
      isGenerating: false,
      selectedIndex: null,

      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),

      setResults: (results) => set({ results }),

      setIsGenerating: (val) => set({ isGenerating: val }),

      selectResult: (index) => set({ selectedIndex: index }),

      resetResults: () => set({ results: [], selectedIndex: null }),
    }),
    {
      name: 'aiswara-lyric-writer',
      partialize: (state) => ({ config: state.config }),
    }
  )
);
