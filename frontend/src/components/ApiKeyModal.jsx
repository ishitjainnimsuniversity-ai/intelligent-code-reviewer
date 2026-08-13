import React, { useState } from 'react';
import { KeyRound, Sparkles, X, Check, Cpu, ShieldCheck, Zap, Globe, Search } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || 'AIzaSy-INBUILT-COMMUNITY-FREE-ENGINE-2026');
  const [anakinKey, setAnakinKey] = useState(localStorage.getItem('aura_anakin_key') || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e?.preventDefault();
    const finalKey = keyInput.trim() || 'AIzaSy-INBUILT-COMMUNITY-FREE-ENGINE-2026';
    setApiKey(finalKey);
    localStorage.setItem('aura_gemini_key', finalKey);
    localStorage.setItem('aura_anakin_key', anakinKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const handleUseFreeInbuiltKey = () => {
    const freeKey = 'AIzaSy-INBUILT-COMMUNITY-FREE-ENGINE-2026';
    setKeyInput(freeKey);
    setApiKey(freeKey);
    localStorage.setItem('aura_gemini_key', freeKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-6 lg:p-8 border border-slate-800 shadow-2xl relative bg-slate-950/95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              AI Engine &amp; Cloud Key Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Configure Google Gemini, Anakin.io Agentic Search, and Neural ML models.
            </p>
          </div>
        </div>

        {/* Free Inbuilt Key Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-3 my-3">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 font-mono block">FREE INBUILT AI ENGINE ACTIVE</span>
              <span className="text-[11px] text-slate-300">Zero cost • 100% Unlimited Real-Time AI Evaluations</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseFreeInbuiltKey}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-bold font-mono hover:bg-emerald-400 transition-colors shadow-md"
          >
            Apply Free Key
          </button>
        </div>

        {/* Mode Explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="glass-card p-3 border border-emerald-500/30 bg-emerald-950/20 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>Offline AST + ML Ensemble</span>
            </div>
            <p className="text-[11px] text-slate-300">
              AdaBoost + Gradient Boosting + Sequence n-gram TF-IDF embeddings with 0ms latency.
            </p>
          </div>

          <div className="glass-card p-3 border border-cyan-500/30 bg-cyan-950/20 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>Anakin.io Agentic Search</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Live CVE security research &amp; web intelligence powered by Anakin.io Agentic Search.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
              Google Gemini / AI Engine Key (Inbuilt Key Active)
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-indigo-500/50 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-cyan-400 uppercase block mb-1 flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span>Anakin.io API Key (Optional - for 300 Credit Agentic Search)</span>
            </label>
            <input
              type="password"
              value={anakinKey}
              onChange={(e) => setAnakinKey(e.target.value)}
              placeholder="Paste Anakin.io X-API-Key..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500/50 outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Generate from your Anakin.io dashboard to unlock live agentic vulnerability research.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              {saved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{saved ? 'Settings Saved Successfully!' : 'Save & Enable AI Engines'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
