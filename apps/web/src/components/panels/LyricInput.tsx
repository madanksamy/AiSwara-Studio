'use client';

import { useState } from 'react';

type InputMode = 'text' | 'youtube' | 'spotify' | 'search';

interface LyricInputProps {
  onLyricChange?: (lyric: string, source: string) => void;
}

export function LyricInput({ onLyricChange }: LyricInputProps) {
  const [mode, setMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedLyric, setExtractedLyric] = useState('');

  const handleTextChange = (value: string) => {
    setTextInput(value);
    onLyricChange?.(value, 'manual');
  };

  const handleUrlSubmit = async () => {
    if (!urlInput) return;

    setIsProcessing(true);
    try {
      // Call API to extract lyrics from URL
      const response = await fetch('/api/extract-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, type: mode }),
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedLyric(data.lyrics || '');
        onLyricChange?.(data.lyrics || '', mode);
      }
    } catch (error) {
      console.error('Failed to extract lyrics:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (mode === 'text') {
        setTextInput(text);
        onLyricChange?.(text, 'clipboard');
      } else {
        setUrlInput(text);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Lyric / Inspiration Input
      </h3>

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-3">
        {([
          { id: 'text', label: 'Text', icon: '📝' },
          { id: 'youtube', label: 'YouTube', icon: '▶️' },
          { id: 'spotify', label: 'Spotify', icon: '🎧' },
          { id: 'search', label: 'Search', icon: '🔍' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
              mode === tab.id
                ? 'bg-pink-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      {mode === 'text' && (
        <div className="space-y-2">
          <textarea
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter lyrics or text for inspiration..."
            className="w-full h-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">{textInput.length} characters</span>
            <button
              onClick={pasteFromClipboard}
              className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors"
            >
              Paste
            </button>
          </div>
        </div>
      )}

      {(mode === 'youtube' || mode === 'spotify') && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={mode === 'youtube' ? 'Paste YouTube URL...' : 'Paste Spotify URL...'}
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500"
            />
            <button
              onClick={pasteFromClipboard}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
              title="Paste from clipboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput || isProcessing}
            className="w-full py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Extracting...
              </span>
            ) : (
              `Extract from ${mode === 'youtube' ? 'YouTube' : 'Spotify'}`
            )}
          </button>

          {extractedLyric && (
            <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-1">Extracted lyrics:</p>
              <p className="text-sm text-zinc-200 line-clamp-4">{extractedLyric}</p>
            </div>
          )}
        </div>
      )}

      {mode === 'search' && (
        <div className="text-center py-4 text-zinc-500 text-sm">
          <p>Use the Tamil Lyrics Search panel below</p>
          <p className="text-xs mt-1">Search tamil2lyrics.com (20,000+ songs)</p>
        </div>
      )}
    </div>
  );
}

export default LyricInput;
