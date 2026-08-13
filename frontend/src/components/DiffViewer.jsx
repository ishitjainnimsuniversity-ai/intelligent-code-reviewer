import React, { useState } from 'react';
import * as Diff from 'diff';
import { 
  GitCompare, 
  Check, 
  Copy, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Split, 
  AlignJustify 
} from 'lucide-react';

export default function DiffViewer({ 
  originalCode, 
  refactoredCode, 
  language, 
  onApplyToEditor 
}) {
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'unified'
  const [copied, setCopied] = useState(false);

  const diffChunks = Diff.diffLines(originalCode || '', refactoredCode || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(refactoredCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origLines = (originalCode || '').split('\n');
  const refactoredLines = (refactoredCode || '').split('\n');

  return (
    <div className="glass-panel overflow-hidden border border-slate-800 shadow-2xl space-y-0">
      {/* Top Diff Header */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
              <span>Automated Refactoring & Diff Inspection</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ready to Deploy
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Side-by-side comparison between submitted code and automated production-ready refactoring.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                viewMode === 'split' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                viewMode === 'unified' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>Unified</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>

          {onApplyToEditor && (
            <button
              onClick={() => onApplyToEditor(refactoredCode)}
              className="btn-primary flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Fix to Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Diff Content View */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950 font-mono text-xs max-h-[600px] overflow-auto">
          {/* Left: Original */}
          <div className="p-4 overflow-x-auto">
            <div className="pb-2 mb-3 border-b border-slate-800 text-slate-400 font-bold text-xs uppercase flex items-center justify-between">
              <span className="text-rose-400 font-mono">Original Source ({origLines.length} lines)</span>
              <span className="text-[10px] text-slate-500">Before Audit</span>
            </div>
            <div className="space-y-0.5">
              {origLines.map((line, idx) => (
                <div key={idx} className="flex leading-5 text-slate-300 hover:bg-slate-900/60 rounded px-1">
                  <span className="w-8 text-right pr-3 select-none text-slate-600 font-mono">{idx + 1}</span>
                  <span className="whitespace-pre flex-1">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Refactored */}
          <div className="p-4 overflow-x-auto bg-slate-950/70">
            <div className="pb-2 mb-3 border-b border-slate-800 text-slate-400 font-bold text-xs uppercase flex items-center justify-between">
              <span className="text-emerald-400 font-mono">Refactored & Optimized ({refactoredLines.length} lines)</span>
              <span className="text-[10px] text-emerald-500/80 font-mono font-bold">100% Remediation</span>
            </div>
            <div className="space-y-0.5">
              {refactoredLines.map((line, idx) => (
                <div key={idx} className="flex leading-5 text-emerald-200/90 hover:bg-emerald-950/30 rounded px-1">
                  <span className="w-8 text-right pr-3 select-none text-emerald-500/40 font-mono">{idx + 1}</span>
                  <span className="whitespace-pre flex-1">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unified Diff View */
        <div className="p-4 bg-slate-950 font-mono text-xs max-h-[600px] overflow-auto space-y-0.5">
          {diffChunks.map((part, idx) => {
            const lines = part.value.replace(/\n$/, '').split('\n');
            const isAdded = part.added;
            const isRemoved = part.removed;

            return lines.map((line, lineIdx) => (
              <div 
                key={`${idx}-${lineIdx}`}
                className={`flex leading-5 px-2 py-0.5 rounded font-mono ${
                  isAdded ? 'diff-added' : isRemoved ? 'diff-removed' : 'diff-context'
                }`}
              >
                <span className="w-6 text-center select-none font-bold mr-2">
                  {isAdded ? '+' : isRemoved ? '-' : ' '}
                </span>
                <span className="whitespace-pre flex-1">{line || ' '}</span>
              </div>
            ));
          })}
        </div>
      )}
    </div>
  );
}
