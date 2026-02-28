'use client';

import { useState, useEffect, useCallback } from 'react';
import debounce from '@/lib/debounce';

interface LyricResult {
  id: string;
  song_title: string;
  movie_name: string;
  singer: string;
  lyricist: string;
  music_director: string;
  year: number;
  lyrics_preview: string;
  full_lyrics?: string;
  url: string;
  similarity?: number;
}

interface TamilLyricsSearchProps {
  onSelect?: (lyric: LyricResult) => void;
}

export function TamilLyricsSearch({ onSelect }: TamilLyricsSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LyricResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLyric, setSelectedLyric] = useState<LyricResult | null>(null);
  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch('/api/lyrics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            limit: 20,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleSelect = (lyric: LyricResult) => {
    setSelectedLyric(lyric);
    onSelect?.(lyric);
  };

  const loadFullLyrics = async (lyric: LyricResult) => {
    if (lyric.full_lyrics) {
      setSelectedLyric(lyric);
      return;
    }

    try {
      // Use URL-encoded song URL as the ID parameter
      const encodedUrl = encodeURIComponent(lyric.url);
      const response = await fetch(`/api/lyrics/${encodedUrl}`);
      if (response.ok) {
        const data = await response.json();
        const updatedLyric = {
          ...lyric,
          full_lyrics: data.lyrics,
          movie_name: data.movie_name || lyric.movie_name,
          singer: data.singer || lyric.singer,
          lyricist: data.lyricist || lyric.lyricist,
          music_director: data.music_director || lyric.music_director,
        };
        setSelectedLyric(updatedLyric);
        setResults((prev) =>
          prev.map((r) => (r.id === lyric.id ? updatedLyric : r))
        );
      }
    } catch (error) {
      console.error('Failed to load full lyrics:', error);
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Tamil Lyrics Search
          <span className="text-xs text-zinc-500 ml-auto">tamizhlyrics.com</span>
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song, movie, singer, lyricist..."
            className="w-full px-4 py-2.5 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isSearching && (
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.length === 0 && query.length >= 2 && !isSearching && (
            <p className="text-center text-zinc-500 text-sm py-4">No results found</p>
          )}

          {results.map((lyric) => (
            <button
              key={lyric.id}
              onClick={() => handleSelect(lyric)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedLyric?.id === lyric.id
                  ? 'bg-orange-600/20 border border-orange-500/50'
                  : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {lyric.song_title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {lyric.movie_name} ({lyric.year}) • {lyric.singer}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {lyric.lyrics_preview}
                  </p>
                </div>
                {lyric.similarity && (
                  <span className="text-xs text-orange-400 shrink-0">
                    {Math.round(lyric.similarity * 100)}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Lyric Preview */}
        {selectedLyric && (
          <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-orange-400">
                {selectedLyric.song_title}
              </h4>
              <button
                onClick={() => loadFullLyrics(selectedLyric)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Load Full Lyrics
              </button>
            </div>
            <div className="text-xs text-zinc-400 space-y-1 mb-2">
              <p>Movie: {selectedLyric.movie_name} ({selectedLyric.year})</p>
              <p>Singer: {selectedLyric.singer}</p>
              <p>Lyricist: {selectedLyric.lyricist}</p>
              <p>Music: {selectedLyric.music_director}</p>
            </div>
            <div className="text-sm text-zinc-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {selectedLyric.full_lyrics || selectedLyric.lyrics_preview}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onSelect?.(selectedLyric)}
                className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded transition-colors"
              >
                Use as Inspiration
              </button>
              <a
                href={`https://tamizhlyrics.com/?search=${encodeURIComponent(selectedLyric.song_title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors flex items-center gap-1"
              >
                View on tamizhlyrics.com
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TamilLyricsSearch;
