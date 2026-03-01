'use client';

import { useState, useCallback } from 'react';
import { useLyricWriterStore } from '@/stores/lyricWriterStore';
import { useConfigStore } from '@/stores/configStore';
import {
  LANGUAGE_OPTIONS,
  MOOD_OPTIONS,
  GENRE_OPTIONS,
  THEME_OPTIONS,
  DECADE_OPTIONS,
  LYRICIST_OPTIONS,
  SONG_TYPE_OPTIONS,
  LENGTH_OPTIONS,
} from '@/types/lyricWriter';
import type { LLMResult } from '@/types/lyricWriter';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: string; description?: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.icon ? `${opt.icon} ` : ''}{opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ThemeMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (themes: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((t) => t !== val));
    } else if (selected.length < 5) {
      onChange([...selected, val]);
    }
  };

  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">
        Themes <span className="text-zinc-600">({selected.length}/5)</span>
      </label>
      <div className="flex flex-wrap gap-1">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.value}
            onClick={() => toggle(theme.value)}
            className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
              selected.includes(theme.value)
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProviderBadge({ provider, latencyMs, status }: { provider: string; latencyMs: number; status: string }) {
  const colorMap: Record<string, string> = {
    gemini: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    sonnet: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    opus: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    glm: 'text-green-400 bg-green-500/10 border-green-500/30',
    kimi: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  };
  const colors = colorMap[provider] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${colors}`}>
      <span className="font-medium capitalize">{provider}</span>
      {status === 'success' && (
        <span className="text-zinc-500">{(latencyMs / 1000).toFixed(1)}s</span>
      )}
      {status === 'error' && <span className="text-red-400">failed</span>}
    </div>
  );
}

function LyricsDisplay({ lyrics }: { lyrics: string }) {
  if (!lyrics) return <p className="text-zinc-500 text-sm italic">No lyrics generated</p>;

  const lines = lyrics.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-1 font-mono">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          return (
            <div key={i} className="text-purple-400 font-bold text-xs mt-3 mb-1 uppercase tracking-wider">
              {trimmed}
            </div>
          );
        }
        return (
          <div key={i} className="text-zinc-200">
            {trimmed}
          </div>
        );
      })}
    </div>
  );
}

function InstrumentChips({ instruments }: { instruments: string[] }) {
  if (!instruments.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {instruments.map((inst) => (
        <span
          key={inst}
          className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700"
        >
          {inst.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// RESULT CARD
// ============================================================================

function ResultCard({
  result,
  isSelected,
  onSelect,
  onCopy,
  onApplyStyle,
}: {
  result: LLMResult;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onApplyStyle: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (result.status === 'error') {
    return (
      <div className="p-3 rounded-lg bg-red-900/10 border border-red-500/30">
        <ProviderBadge provider={result.provider} latencyMs={result.latencyMs} status="error" />
        <p className="text-xs text-red-400 mt-2">{result.error || 'Generation failed'}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border transition-all ${
        isSelected
          ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-0">
        <div className="flex items-center gap-2">
          <ProviderBadge provider={result.provider} latencyMs={result.latencyMs} status={result.status} />
          {result.title && (
            <span className="text-xs text-zinc-300 font-medium truncate max-w-[160px]">
              {result.title}
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-zinc-800 rounded transition-colors"
        >
          <svg
            className={`w-3 h-3 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Lyrics */}
          <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
            <LyricsDisplay lyrics={result.lyrics} />
          </div>

          {/* Style Prompt */}
          {result.stylePrompt && (
            <div className="p-2 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Style Prompt</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{result.stylePrompt}</p>
            </div>
          )}

          {/* Instruments */}
          <InstrumentChips instruments={result.instruments} />

          {/* Notes */}
          {result.notes && (
            <p className="text-xs text-zinc-500 italic">{result.notes}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSelect}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isSelected
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isSelected ? '✓ Selected' : 'Select This'}
            </button>
            <button
              onClick={onCopy}
              className="px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Copy lyrics"
            >
              Copy
            </button>
            <button
              onClick={onApplyStyle}
              className="px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Apply style & instruments to config"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LyricWriter() {
  const {
    config,
    results,
    isGenerating,
    selectedIndex,
    updateConfig,
    setResults,
    setIsGenerating,
    selectResult,
    resetResults,
  } = useLyricWriterStore();

  const applyLyricSuggestions = useConfigStore((s) => s.applyLyricSuggestions);

  const [inputCollapsed, setInputCollapsed] = useState(false);

  // Generate lyrics via API
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    resetResults();

    try {
      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            ...config,
            inspiration: config.customPrompt || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Generation failed:', error);
      setResults([
        {
          provider: 'system',
          model: '',
          lyrics: '',
          stylePrompt: '',
          instruments: [],
          title: '',
          notes: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          latencyMs: 0,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [config, setIsGenerating, resetResults, setResults]);

  // Copy lyrics to clipboard
  const handleCopy = useCallback(async (result: LLMResult) => {
    try {
      await navigator.clipboard.writeText(result.lyrics);
    } catch {
      console.error('Copy failed');
    }
  }, []);

  // Apply style + instruments to main config
  const handleApplyStyle = useCallback((result: LLMResult) => {
    applyLyricSuggestions({
      instruments: result.instruments,
      stylePrompt: result.stylePrompt,
    });
  }, [applyLyricSuggestions]);

  // Send to Suno.com
  const handleSendToSuno = useCallback(async () => {
    if (selectedIndex === null || !results[selectedIndex]) return;
    const result = results[selectedIndex];

    try {
      await navigator.clipboard.writeText(result.lyrics);
      window.open('https://suno.com/create', '_blank');
    } catch {
      console.error('Failed to copy for Suno');
    }
  }, [selectedIndex, results]);

  const successResults = results.filter((r) => r.status === 'success');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          AI Lyric Writer
        </h2>
        <button
          onClick={() => setInputCollapsed(!inputCollapsed)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {inputCollapsed ? 'Show Config' : 'Hide Config'}
        </button>
      </div>

      {/* Input Config */}
      {!inputCollapsed && (
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-3">
          {/* Row 1: Language, Mood */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Language"
              value={config.language}
              options={LANGUAGE_OPTIONS}
              onChange={(v) => updateConfig({ language: v as typeof config.language })}
            />
            <SelectField
              label="Mood"
              value={config.mood}
              options={MOOD_OPTIONS}
              onChange={(v) => updateConfig({ mood: v as typeof config.mood })}
            />
          </div>

          {/* Row 2: Genre, Decade */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Genre"
              value={config.genre}
              options={GENRE_OPTIONS}
              onChange={(v) => updateConfig({ genre: v as typeof config.genre })}
            />
            <SelectField
              label="Decade"
              value={config.decadeInfluence}
              options={DECADE_OPTIONS}
              onChange={(v) => updateConfig({ decadeInfluence: v })}
            />
          </div>

          {/* Row 3: Lyricist, Song Type */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Lyricist Style"
              value={config.lyricistStyle}
              options={LYRICIST_OPTIONS}
              onChange={(v) => updateConfig({ lyricistStyle: v })}
            />
            <SelectField
              label="Song Type"
              value={config.songType}
              options={SONG_TYPE_OPTIONS}
              onChange={(v) => updateConfig({ songType: v as typeof config.songType })}
            />
          </div>

          {/* Row 4: Length */}
          <SelectField
            label="Length"
            value={config.length}
            options={LENGTH_OPTIONS}
            onChange={(v) => updateConfig({ length: v as typeof config.length })}
          />

          {/* Themes */}
          <ThemeMultiSelect
            selected={config.themes}
            onChange={(themes) => updateConfig({ themes })}
          />

          {/* Inspiration / Custom Prompt */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Inspiration / Custom Notes</label>
            <textarea
              value={config.customPrompt}
              onChange={(e) => updateConfig({ customPrompt: e.target.value })}
              placeholder="Additional instructions, reference lyrics, mood description..."
              className="w-full h-16 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating with 5 LLMs...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Lyrics (5 LLMs)
              </span>
            )}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="space-y-3">
          {['Gemini 3.1', 'Sonnet 4.6', 'Opus 4.6', 'GLM-5', 'Kimi K2.5'].map((name) => (
            <div key={name} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-16 h-5 bg-zinc-800 rounded-full" />
                <div className="w-24 h-4 bg-zinc-800 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-5/6" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
              <p className="text-xs text-zinc-600 mt-3">Waiting for {name}...</p>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isGenerating && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-zinc-400">
              Results ({successResults.length}/{results.length} succeeded)
            </h3>
            <button
              onClick={resetResults}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          </div>

          {results.map((result, idx) => (
            <ResultCard
              key={`${result.provider}-${idx}`}
              result={result}
              isSelected={selectedIndex === idx}
              onSelect={() => selectResult(idx)}
              onCopy={() => handleCopy(result)}
              onApplyStyle={() => handleApplyStyle(result)}
            />
          ))}

          {/* Selection Actions */}
          {selectedIndex !== null && results[selectedIndex]?.status === 'success' && (
            <div className="bg-zinc-900/50 rounded-xl p-3 border border-purple-500/30 space-y-2">
              <p className="text-xs text-purple-400 font-medium">Selected: {results[selectedIndex].title || results[selectedIndex].provider}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyStyle(results[selectedIndex])}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Apply to Config
                </button>
                <button
                  onClick={handleSendToSuno}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  Send to Suno
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && results.length === 0 && (
        <div className="text-center py-8 text-zinc-600">
          <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-sm">Configure your song and hit Generate</p>
          <p className="text-xs mt-1">5 AI models will compose lyrics in parallel</p>
        </div>
      )}
    </div>
  );
}

export default LyricWriter;
