import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Database, 
  TrendingUp, 
  GitPullRequest, 
  Sparkles, 
  User, 
  LogOut,
  Volume2,
  VolumeX,
  Music,
  RotateCcw
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  onOpenApiKey,
  onTriggerIntro,
  hasApiKey,
  isAudioPlaying,
  onToggleAudio,
  selectedTrack,
  onChangeTrack
}) {
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 my-2 mx-auto max-w-[1600px] flex items-center justify-between">
      {/* Brand & 24/7 Status */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => setActiveTab('studio')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AURA CODE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-wider">
              24/7 INTELLIGENT REVIEWER
            </p>
          </div>
        </div>

        {/* Live Always-On Beacon */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[12px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
          <span className="text-emerald-400 font-medium tracking-wide">24/7 EVALUATOR ACTIVE</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'studio'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Review Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'rules'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Rule Learning Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('growth')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'growth'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Developer Growth</span>
        </button>

        <button
          onClick={() => setActiveTab('cicd')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'cicd'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>CI/CD &amp; PRs</span>
        </button>
      </nav>

      {/* Right Controls: Soundtrack, Replay Intro, AI Key, User Profile */}
      <div className="flex items-center gap-3">
        {/* Soundtrack Player Control */}
        <div className="relative">
          <button
            onClick={onToggleAudio}
            title={isAudioPlaying ? "Mute Soundtrack" : "Play Soundtrack"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isAudioPlaying
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{isAudioPlaying ? 'Playing' : 'Audio Muted'}</span>
          </button>
        </div>

        {/* Replay Cinematic Intro */}
        <button
          onClick={onTriggerIntro}
          title="Replay Cinematic Matrix Intro"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-400 text-xs font-mono hover:text-slate-200 hover:border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Intro</span>
        </button>

        {/* Gemini Engine Mode indicator */}
        <button
          onClick={onOpenApiKey}
          title="Configure Gemini LLM or Offline Mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            hasApiKey
              ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/20 hover:border-indigo-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${hasApiKey ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{hasApiKey ? 'Gemini AI Active' : 'Offline AST Mode'}</span>
        </button>

        {/* User Account Capsule */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px]">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
              <span className="font-medium text-slate-200">{currentUser.username}</span>
              {currentUser.is_guest && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  GUEST
                </span>
              )}
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
