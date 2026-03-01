'use client';

import { useState } from 'react';
import {
  GlobalSection,
  InstrumentsSection,
  VocalsSection,
  OrnamentationSection,
  StructureSection,
  PercussionSection,
  MixSection,
  MacroSection,
} from '@/components/sections';
import {
  OutputPanel,
  PresetPanel,
  EmbeddedBrowser,
  LyricInput,
  TamilLyricsSearch,
  LyricWriter,
} from '@/components/panels';

type TabId = 'global' | 'instruments' | 'percussion' | 'vocals' | 'ornamentation' | 'structure' | 'mix';
type RightPanelTab = 'output' | 'browser' | 'lyrics' | 'write';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'global', label: 'Global', icon: '🌍' },
  { id: 'instruments', label: 'Instruments', icon: '🎵' },
  { id: 'percussion', label: 'Percussion', icon: '🥁' },
  { id: 'vocals', label: 'Vocals', icon: '🎤' },
  { id: 'ornamentation', label: 'Ornamentation', icon: '✨' },
  { id: 'structure', label: 'Structure', icon: '📐' },
  { id: 'mix', label: 'Mix', icon: '🎛️' },
];

const RIGHT_TABS: { id: RightPanelTab; label: string; icon: string }[] = [
  { id: 'output', label: 'Output', icon: '📤' },
  { id: 'write', label: 'Write', icon: '✍️' },
  { id: 'lyrics', label: 'Lyrics', icon: '📝' },
  { id: 'browser', label: 'Browser', icon: '🌐' },
];

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<TabId>('global');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('output');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'global':
        return <GlobalSection />;
      case 'instruments':
        return <InstrumentsSection />;
      case 'percussion':
        return <PercussionSection />;
      case 'vocals':
        return <VocalsSection />;
      case 'ornamentation':
        return <OrnamentationSection />;
      case 'structure':
        return <StructureSection />;
      case 'mix':
        return <MixSection />;
      default:
        return <GlobalSection />;
    }
  };

  const renderRightPanel = () => {
    switch (rightPanelTab) {
      case 'output':
        return (
          <>
            <OutputPanel />
            <PresetPanel />
          </>
        );
      case 'write':
        return <LyricWriter />;
      case 'browser':
        return <EmbeddedBrowser />;
      case 'lyrics':
        return (
          <>
            <LyricInput />
            <TamilLyricsSearch />
          </>
        );
      default:
        return <OutputPanel />;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AiSwara Studio
              </h1>
              <p className="text-xs text-zinc-500">AI Music Prompt Composer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">v0.2.0</span>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-[1920px] mx-auto flex h-[calc(100vh-57px-32px)]">
        {/* Left Sidebar - Tabs (Sticky) */}
        <nav className="w-16 border-r border-zinc-800 bg-zinc-900/50 sticky top-[57px] h-[calc(100vh-57px-32px)] py-4 overflow-y-auto shrink-0">
          <div className="flex flex-col items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Center - Section Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-w-3xl scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
            {/* Macro Controls - Always visible */}
            <MacroSection />

            {/* Active Section */}
            {renderActiveSection()}

            {/* Bottom padding for footer */}
            <div className="h-4"></div>
          </div>

          {/* Right Sidebar - Output, Browser, Lyrics (Sticky) */}
          <div className={`relative transition-all shrink-0 ${sidebarCollapsed ? 'w-12' : 'w-[420px]'} flex flex-col h-full`}>
            {!sidebarCollapsed && (
              <>
                {/* Right Panel Tabs */}
                <div className="flex gap-1 mb-3 bg-zinc-900/50 p-1 rounded-lg shrink-0">
                  {RIGHT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRightPanelTab(tab.id)}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        rightPanelTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
                  {renderRightPanel()}
                </div>
              </>
            )}

            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`absolute ${sidebarCollapsed ? 'left-1' : '-left-3'} top-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors z-40 border border-zinc-700`}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 text-xs text-zinc-500 z-40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Ready
          </span>
          <span>|</span>
          <span>Target: Suno.ai</span>
          <span>|</span>
          <span>Max: 600 chars</span>
        </div>
        <div className="ml-auto">
          Multi-Agent Pipeline: GPT-5.2 → Claude 4.5 → Gemini 3
        </div>
      </footer>
    </main>
  );
}
