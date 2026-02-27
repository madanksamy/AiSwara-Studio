'use client';

import { useState } from 'react';
import { useConfigStore } from '@/stores/configStore';

type BrowserTarget = 'suno' | 'heartmula';

const TARGETS = {
  suno: {
    name: 'Suno.ai',
    url: 'https://suno.com/create',
    description: 'AI music generation with vocals',
    icon: '🎵',
    color: 'from-purple-600 to-pink-600',
    maxChars: 580,
  },
  heartmula: {
    name: 'HeartMuLa',
    url: 'https://heartmula.ai/create',
    description: 'Expressive AI music creation',
    icon: '💜',
    color: 'from-pink-600 to-red-600',
    maxChars: 600,
  },
};

export function EmbeddedBrowser() {
  const [target, setTarget] = useState<BrowserTarget>('suno');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const generatedPrompt = useConfigStore((state) => state.generatedPrompt);
  const currentTarget = TARGETS[target];

  const copyToClipboard = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAndOpen = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
    }
    window.open(currentTarget.url, '_blank');
  };

  const openInNewTab = () => {
    window.open(currentTarget.url, '_blank');
  };

  const charCount = generatedPrompt?.length || 0;
  const charPercentage = Math.min((charCount / currentTarget.maxChars) * 100, 100);
  const isOverLimit = charCount > currentTarget.maxChars;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Browser Header */}
      <div className="bg-zinc-800/50 px-4 py-2 flex items-center gap-2 border-b border-zinc-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-zinc-700 rounded transition-colors"
        >
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          AI Music Generator
        </h3>

        {/* Target Selector */}
        <div className="flex gap-1 ml-auto">
          {(['suno', 'heartmula'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                target === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              {TARGETS[t].name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Target Info Card */}
          <div className={`bg-gradient-to-r ${currentTarget.color} p-4 rounded-xl`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTarget.icon}</span>
              <div>
                <h4 className="text-lg font-bold text-white">{currentTarget.name}</h4>
                <p className="text-white/80 text-sm">{currentTarget.description}</p>
              </div>
            </div>
          </div>

          {/* Generated Prompt Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Generated Prompt</span>
              <span className={`text-xs font-mono ${isOverLimit ? 'text-red-400' : 'text-zinc-500'}`}>
                {charCount} / {currentTarget.maxChars} chars
              </span>
            </div>

            {/* Character Progress Bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit ? 'bg-red-500' : charPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${charPercentage}%` }}
              />
            </div>

            {/* Prompt Text Area */}
            <div className="bg-zinc-800/50 rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
              {generatedPrompt ? (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{generatedPrompt}</p>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  Configure your music settings and generate a prompt using the Output panel.
                </p>
              )}
            </div>
          </div>

          {/* Warning if over limit */}
          {isOverLimit && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm text-red-400 font-medium">Prompt too long</p>
                <p className="text-xs text-red-400/70">
                  Reduce by {charCount - currentTarget.maxChars} characters for {currentTarget.name}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              disabled={!generatedPrompt}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Prompt
                </>
              )}
            </button>

            <button
              onClick={copyAndOpen}
              disabled={!generatedPrompt}
              className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${currentTarget.color} text-white rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Copy & Open {currentTarget.name}
            </button>
          </div>

          {/* Quick Open (no copy) */}
          <button
            onClick={openInNewTab}
            className="w-full px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Just Open {currentTarget.name}
          </button>

          {/* Instructions */}
          <div className="bg-zinc-800/30 rounded-lg p-3 space-y-2">
            <p className="text-xs text-zinc-500 font-medium">How to use:</p>
            <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
              <li>Configure your music settings in the panels</li>
              <li>Generate your prompt in the Output tab</li>
              <li>Click &ldquo;Copy &amp; Open&rdquo; to launch {currentTarget.name}</li>
              <li>Paste your prompt in the style/description field</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmbeddedBrowser;
