import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  Code2, 
  Unlock, 
  ChevronRight,
  Activity
} from 'lucide-react';

export default function TechGate({ isOpening, onStartOpening, onFullyOpened }) {
  const [progress, setProgress] = useState(20);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: 'CALIBRATING SYNTACTIC AST ENGINES', sub: 'Multi-language parsers active (Python, JS/TS, Java, Go, Rust, SQL)' },
    { label: 'LOADING HISTORICAL CSV RULE GROUNDING', sub: 'Ingesting learned anti-patterns & organizational security benchmarks' },
    { label: 'INITIALIZING ML ENSEMBLE REGRESSORS', sub: 'GradientBoost + AdaBoost + Sequence n-gram embeddings online' },
    { label: 'SYNCHRONIZING 24/7 CI/CD AUTOMATION MATRIX', sub: 'Autonomous continuous pull request review loop verified' },
    { label: 'SECURITY ISOLATION & CODE VAULT ARMED', sub: 'All subsystems calibrated. Ready to open quantum review gate.' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 15) + 12;
        return next > 100 ? 100 : next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress < 25) setActiveStep(0);
    else if (progress < 50) setActiveStep(1);
    else if (progress < 75) setActiveStep(2);
    else if (progress < 95) setActiveStep(3);
    else setActiveStep(4);
  }, [progress]);

  const handleTriggerOpen = () => {
    if (isOpening) return;
    onStartOpening();
    setTimeout(() => {
      onFullyOpened();
    }, 1100);
  };

  return (
    <div className={`tech-gate-container ${isOpening ? 'pointer-events-none' : ''}`}>
      
      {/* LEFT MECHANICAL BLAST DOOR */}
      <div className={`blast-door-left ${isOpening ? 'open' : ''}`}>
        <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
        
        {/* Top telemetry */}
        <div className="flex items-center justify-between z-10">
          <span className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            BLAST DOOR SECTOR A [LEFT]
          </span>
          <span className="font-mono text-xs text-slate-500 font-bold tracking-wider">
            {isOpening ? 'LOCK DISENGAGING...' : 'SECURITY LOCK ACTIVE'}
          </span>
        </div>

        {/* Hazard Seam */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-3.5 opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
          style={{
            background: 'repeating-linear-gradient(45deg, #10b981, #10b981 12px, #02040a 12px, #02040a 24px)'
          }}
        />

        {/* Large Decorative Text */}
        <div className="z-10 text-right pr-8 space-y-1">
          <div className="font-display font-extrabold text-4xl lg:text-5xl text-slate-700/80 tracking-widest">
            AURA GATE // 01
          </div>
          <div className="font-mono text-xs text-emerald-500/80 font-bold tracking-widest uppercase">
            SYNTACTIC AST &amp; HISTORICAL VAULT
          </div>
        </div>

        <div className="font-mono text-xs text-slate-500 z-10 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>MIL-SPEC 24/7 AUTONOMOUS ENCLAVE</span>
        </div>
      </div>

      {/* RIGHT MECHANICAL BLAST DOOR */}
      <div className={`blast-door-right ${isOpening ? 'open' : ''}`}>
        <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
        
        {/* Top telemetry */}
        <div className="flex items-center justify-between z-10">
          <span className="font-mono text-xs text-slate-500 font-bold tracking-wider">
            QUANTUM PROTOCOL: V2.4
          </span>
          <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-2">
            BLAST DOOR SECTOR B [RIGHT]
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </span>
        </div>

        {/* Hazard Seam */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-3.5 opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
          style={{
            background: 'repeating-linear-gradient(-45deg, #06b6d4, #06b6d4 12px, #02040a 12px, #02040a 24px)'
          }}
        />

        {/* Large Decorative Text */}
        <div className="z-10 text-left pl-8 space-y-1">
          <div className="font-display font-extrabold text-4xl lg:text-5xl text-slate-700/80 tracking-widest">
            AURA GATE // 02
          </div>
          <div className="font-mono text-xs text-cyan-500/80 font-bold tracking-widest uppercase">
            NEURAL ML ENSEMBLE ARMED
          </div>
        </div>

        <div className="font-mono text-xs text-slate-500 text-right z-10 flex items-center justify-end gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>NEURAL WEIGHTS 100% SYNCHRONIZED</span>
        </div>
      </div>

      {/* CENTRAL FLOATING HUD CONTROLLER */}
      <div className={`gate-hud-modal ${isOpening ? 'open' : ''}`}>
        <div className="relative w-full max-w-xl glass-panel p-8 border border-emerald-500/60 shadow-[0_0_120px_rgba(16,185,129,0.4)] text-center space-y-6 bg-slate-950/95 backdrop-blur-2xl">
          
          {/* Central Logo & Orbitals */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-ping opacity-30" />
            <div className="absolute -inset-2 rounded-full border border-dashed border-cyan-400/60 animate-spin" style={{ animationDuration: '10s' }} />
            <div className="absolute -inset-4 rounded-full border border-emerald-500/30 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
            
            <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-2xl shadow-emerald-500/60">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Code2 className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
              <span>THE 24/7 INTELLIGENT CODE REVIEWER</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AURA QUANTUM GATE
            </h1>

            <p className="text-xs text-slate-400 font-mono">
              AUTOMATED MULTI-LANGUAGE AUDITING &amp; ML ENSEMBLE PLATFORM
            </p>
          </div>

          {/* Diagnostic Loading Scanner */}
          <div className="space-y-3 text-left font-mono">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 animate-pulse" />
                SYSTEM DIAGNOSTIC SCAN
              </span>
              <span className="font-bold text-slate-100 text-sm">{progress}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-bold uppercase">{steps[activeStep].label}</span>
                <span className="text-slate-500 font-bold">NODE [0x{activeStep}F]</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {steps[activeStep].sub}
              </p>
            </div>
          </div>

          {/* Door Open Action */}
          <div className="pt-2">
            <button
              onClick={handleTriggerOpen}
              disabled={isOpening}
              className="btn-primary w-full py-4 rounded-xl text-xs font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>CLICK TO OPEN FULL QUANTUM GATE &amp; ENTER STUDIO</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
