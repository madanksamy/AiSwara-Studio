'use client';

import { useState } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { CharacterCounter, Select } from '../controls';
import type { TargetPlatform } from '@/types/schema';

const PLATFORM_OPTIONS: { value: TargetPlatform; label: string; maxChars: number }[] = [
  { value: 'suno', label: 'Suno.ai', maxChars: 580 },
  { value: 'heartmula', label: 'HeartMuLa', maxChars: 600 },
  { value: 'generic', label: 'Generic', maxChars: 600 },
];

export function OutputPanel() {
  const config = useConfigStore((state) => state.config);
  const updateGlobal = useConfigStore((state) => state.updateGlobal);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = PLATFORM_OPTIONS.find((p) => p.value === config.global.targetPlatform);
  const maxChars = platform?.maxChars || 600;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      // Fallback: generate a simple preview locally
      setGeneratedPrompt(generateLocalPreview());
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocalPreview = () => {
    const parts: string[] = [];

    // Genre
    parts.push(config.global.genre.replace(/_/g, ' '));

    // Tempo
    parts.push(`${config.global.tempo} BPM`);

    // Mood
    if (config.global.moodAxes.energy > 70) parts.push('high energy');
    else if (config.global.moodAxes.energy < 30) parts.push('calm');

    // Vocals
    if (config.vocals.language !== 'instrumental_only') {
      parts.push(`${config.vocals.gender} ${config.vocals.language} vocals`);
      if (config.vocals.styles.length > 0) {
        parts.push(config.vocals.styles[0].replace(/_/g, ' '));
      }
    } else {
      parts.push('instrumental');
    }

    // Instruments
    const instruments = config.instrumentation.instruments
      .slice(0, 3)
      .map((i) => i.name)
      .join(', ');
    if (instruments) parts.push(instruments);

    // Ornamentation
    if (config.ornamentation.carnatic.enabled && config.ornamentation.carnatic.ragaFlavor !== 'none') {
      parts.push(`${config.ornamentation.carnatic.ragaFlavor} raga flavor`);
    }

    // Mix
    if (config.mix.adjectives.length > 0) {
      parts.push(config.mix.adjectives.slice(0, 2).join(' '));
    }

    return parts.join(', ');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Output
      </h2>

      <div className="space-y-4">
        {/* Platform Selector */}
        <Select
          label="Target Platform"
          value={config.global.targetPlatform}
          options={PLATFORM_OPTIONS}
          onChange={(v) => updateGlobal({ targetPlatform: v as TargetPlatform })}
        />

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isGenerating
              ? 'bg-purple-600/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
          } text-white shadow-lg shadow-purple-500/25`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Prompt'
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Output Text Area */}
        <div className="relative">
          <textarea
            value={generatedPrompt}
            onChange={(e) => setGeneratedPrompt(e.target.value)}
            placeholder="Your generated prompt will appear here..."
            className="w-full h-40 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 text-sm font-mono resize-none focus:outline-none focus:border-purple-500 placeholder-zinc-500"
          />

          {/* Copy Button */}
          {generatedPrompt && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Character Counter */}
        <CharacterCounter
          current={generatedPrompt.length}
          min={120}
          max={maxChars}
        />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setGeneratedPrompt('')}
            disabled={!generatedPrompt}
            className="flex-1 py-2 px-3 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-zinc-300 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 py-2 px-3 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-zinc-300 transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;
