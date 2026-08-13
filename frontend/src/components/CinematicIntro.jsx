import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  Activity,
  Cpu,
  Music,
  ChevronRight
} from 'lucide-react';

export default function CinematicIntro({ onEnterApp }) {
  const [loadingProgress, setLoadingProgress] = useState(10);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeSubsystem, setActiveSubsystem] = useState(0);

  const subsystems = [
    { title: "NEURAL ENSEMBLE ARMED", desc: "AdaBoost + GradientBoost + TF-IDF Sequence Proxies Online" },
    { title: "CSV HISTORICAL KNOWLEDGE GROUNDED", desc: "Learned Anti-Patterns & Enterprise Rules Ingested" },
    { title: "MULTI-LANGUAGE SYNTACTIC AST ACTIVE", desc: "Python, JS, TS, Java, Go, Rust, C++, SQL Ready" },
    { title: "24/7 CI/CD PR SIMULATOR SYNCED", desc: "Autonomous Pull Request Review Matrix Online" },
    { title: "QUANTUM ENVIRONMENT CALIBRATED", desc: "All Systems Operational. Ready for Launch." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 18) + 12;
        return next > 100 ? 100 : next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loadingProgress < 25) setActiveSubsystem(0);
    else if (loadingProgress < 50) setActiveSubsystem(1);
    else if (loadingProgress < 75) setActiveSubsystem(2);
    else if (loadingProgress < 95) setActiveSubsystem(3);
    else setActiveSubsystem(4);
  }, [loadingProgress]);

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onEnterApp();
    }, 800);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, rgba(3,6,15,0.95) 70%), url("/bg-cinematic.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Cyber Ambient Overlay */}
      <div className="absolute inset-0 bg-[#02050e]/85 backdrop-blur-md" />

      {/* Center Cinematic Card */}
      <div className="relative z-10 w-full max-w-xl mx-4 glass-panel p-8 border border-emerald-500/40 shadow-[0_0_120px_rgba(16,185,129,0.35)] text-center space-y-6 bg-slate-950/95">
        
        {/* Holographic Glowing Logo */}
        <div className="flex justify-center items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-2xl shadow-emerald-500/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Code2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]" />
            </div>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
            <span>24/7 INTELLIGENT CODE REVIEWER</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AURA CODE MATRIX
          </h1>

          <p className="text-xs text-slate-300 font-sans max-w-md mx-auto leading-relaxed">
            Automated Multi-Language AST Auditing, ML Neural Ensembles, and Historical Anti-Pattern Grounding.
          </p>
        </div>

        {/* Diagnostic Progress & Telemetry */}
        <div className="space-y-3 text-left font-mono">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>SYSTEM DIAGNOSTIC SCAN</span>
            </span>
            <span className="font-bold text-slate-100 text-sm">{loadingProgress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-emerald-300 font-bold text-xs uppercase block">
                {subsystems[activeSubsystem].title}
              </span>
              <p className="text-[11px] text-slate-400 font-sans">
                {subsystems[activeSubsystem].desc}
              </p>
            </div>
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse flex-shrink-0 ml-3" />
          </div>
        </div>

        {/* Enter Button with Soundtrack */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={handleEnter}
            className="btn-primary w-full py-3.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>ENTER REVIEW MATRIX &amp; PLAY SOUNDTRACK</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span>Custom Cinematic Soundtrack Ingested from Downloads</span>
          </div>
        </div>
      </div>
    </div>
  );
}
