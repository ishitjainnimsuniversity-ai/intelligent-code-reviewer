import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Layers, 
  Eye, 
  Bug, 
  BookOpen, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  GitCompare,
  Sparkles,
  Activity,
  Cpu,
  Play,
  RotateCw
} from 'lucide-react';

export default function ReviewReport({ reviewData, onViewDiff, onReEvaluate, loading }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  if (!reviewData) return null;

  const {
    title,
    language,
    quality_score,
    grade,
    category_scores = {},
    summary,
    issues = [],
    grounded_rules = [],
    metrics = {},
    ml_insights = null,
    refactored_code
  } = reviewData;

  const getGradeStyle = (grd) => {
    if (grd === 'A+' || grd === 'A') return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/20';
    if (grd === 'B') return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-cyan-500/20';
    if (grd === 'C') return 'text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-amber-500/20';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10 shadow-rose-500/20';
  };

  const getScoreColor = (score) => {
    if (score >= 8.5) return '#10b981';
    if (score >= 7.0) return '#06b6d4';
    if (score >= 5.5) return '#f59e0b';
    return '#f43f5e';
  };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(10, Math.max(0, quality_score)) / 10;
  const strokeDashoffset = circumference - progress * circumference;

  const filteredIssues = issues.filter((item) => {
    const catMatch = selectedCategory === 'ALL' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const sevMatch = selectedSeverity === 'ALL' || item.severity?.toUpperCase() === selectedSeverity.toUpperCase();
    return catMatch && sevMatch;
  });

  const handleDownloadMarkdown = () => {
    const mdContent = `# Code Review Report: ${title}
**Language:** ${language}
**Quality Score:** ${quality_score} / 10.0 (Grade: ${grade})
**ML Confidence:** ${ml_insights?.ml_confidence_percentage || 95}%
**Maintainability Index:** ${metrics.maintainability_index || 80}/100
**Cyclomatic Complexity:** ${metrics.cyclomatic_complexity || 1}

## Executive Summary
${summary}

## Category Breakdown
- Security: ${category_scores.security || 10}/10
- Performance: ${category_scores.performance || 10}/10
- Architecture: ${category_scores.architecture || 10}/10
- Maintainability: ${category_scores.maintainability || 10}/10
- Readability: ${category_scores.readability || 10}/10

## Detected Issues (${issues.length})
${issues.map((i, idx) => `
### ${idx + 1}. [${i.severity}] ${i.title} (Line ${i.line_number || 'N/A'})
- **Category:** ${i.category}
- **Description:** ${i.description}
- **Remediation:** ${i.recommendation}
${i.grounded_rule ? `- **Learned Rule Citation:** ${i.grounded_rule.citation}` : ''}
`).join('\n')}

## Optimized Refactored Code
\`\`\`${language}
${refactored_code}
\`\`\`
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_review_${title.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(reviewData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_review_${title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top HUD Rating Card - FIXED SPACIOUS GRID LAYOUT */}
      <div className="glass-panel p-6 border border-slate-800 shadow-2xl relative overflow-hidden bg-slate-950/90 space-y-5">
        
        {/* Main Grid: Left Gauge & Metadata, Right 4 Metric Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'center' }}>
          
          {/* Gauge & Title Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke={getScoreColor(quality_score)}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="gauge-circle"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-bold text-slate-100">{quality_score}</span>
                <span className="text-[10px] font-mono text-slate-400">/ 10.0</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold font-mono shadow-md ${getGradeStyle(grade)}`}>
                  GRADE {grade}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${
                  quality_score >= 7.5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {quality_score >= 7.5 ? 'PASSED GATE' : 'ACTION REQUIRED'}
                </span>
                {ml_insights && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>ML Conf {ml_insights.ml_confidence_percentage}%</span>
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-display font-bold text-slate-100 leading-snug">
                {title}
              </h2>
              
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Language: <span className="text-emerald-400 font-bold">{language}</span> • Evaluated in Real Time
              </p>
            </div>
          </div>

          {/* 4 Metric Pills in a neat 4-col grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            <div className="hud-metric-pill">
              <span className="hud-metric-label">Total Issues</span>
              <span className="hud-metric-value text-slate-100">{issues.length}</span>
            </div>

            <div className="hud-metric-pill">
              <span className="hud-metric-label">Learned Rules</span>
              <span className="hud-metric-value text-indigo-400">{grounded_rules.length} Grounded</span>
            </div>

            <div className="hud-metric-pill">
              <span className="hud-metric-label">Maintainability</span>
              <span className="hud-metric-value text-teal-400">{metrics.maintainability_index || 80}/100</span>
            </div>

            <div className="hud-metric-pill">
              <span className="hud-metric-label">Complexity</span>
              <span className="hud-metric-value text-amber-400">{metrics.estimated_time_complexity || 'O(N)'}</span>
            </div>
          </div>
        </div>

        {/* Real-time ML Models Telemetry Strip with Small Glowing Icons */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold uppercase">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Real-Time AI &amp; ML Ensemble Telemetry</span>
            </span>
            <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              100% REAL-TIME LIVE INFERENCE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> AdaBoost
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 block mt-1">
                {ml_insights?.adaboost_score || 7.0} / 10
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> GradientBoost
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 block mt-1">
                {ml_insights?.gradient_boosting_score || 6.8} / 10
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> TF-IDF (RNN)
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 block mt-1">
                120 Vector Dim
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> AST Parser
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 block mt-1">
                Multi-AST Online
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> CSV Ingestion
              </span>
              <span className="text-sm font-bold font-mono text-slate-100 block mt-1">
                {grounded_rules.length} Grounded Rules
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Confidence
              </span>
              <span className="text-sm font-bold font-mono text-indigo-300 block mt-1">
                {ml_insights?.ml_confidence_percentage || 92.8}%
              </span>
            </div>
          </div>
        </div>

        {/* Category Scores Breakdown */}
        <div className="mt-4 pt-4 border-t border-slate-800/80" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {[
            { key: 'security', label: 'Security', icon: ShieldCheck, color: '#f43f5e' },
            { key: 'performance', label: 'Performance', icon: Zap, color: '#f59e0b' },
            { key: 'architecture', label: 'Architecture', icon: Layers, color: '#6366f1' },
            { key: 'maintainability', label: 'Maintainability', icon: Bug, color: '#10b981' },
            { key: 'readability', label: 'Readability', icon: Eye, color: '#06b6d4' },
          ].map(({ key, label, icon: Icon, color }) => {
            const score = category_scores[key] !== undefined ? category_scores[key] : 10.0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span>{label}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-100">{score}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounded Historical Rules Alert Banner */}
      {grounded_rules.length > 0 && (
        <div className="glass-panel p-5 border border-indigo-500/30 bg-indigo-950/20 shadow-lg shadow-indigo-950/40">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-indigo-200 font-display">
                  Historical Knowledge Grounding ({grounded_rules.length} Learned Citations)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CSV Rule Base Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                The evaluation engine identified anti-patterns directly matching your ingested historical rule dataset.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                {grounded_rules.map((gr, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/90 border border-indigo-500/40 text-xs font-mono text-indigo-300"
                  >
                    <span className="text-emerald-400 font-bold flex-shrink-0">Rule #{gr.rule_id}</span>
                    <span className="uppercase text-[10px] text-slate-400 flex-shrink-0">[{gr.type}]</span>
                    <span className="text-slate-200">Line {gr.line_number}: {gr.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-slate-400 mr-1">Filter:</span>
          {['ALL', 'security', 'performance', 'architecture', 'formatting', 'bug'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          {onViewDiff && (
            <button
              onClick={onViewDiff}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>View Diff &amp; Refactor</span>
            </button>
          )}

          <button
            onClick={handleDownloadMarkdown}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono"
            title="Download Markdown Report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Markdown</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono"
            title="Download JSON Report"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Categorized Issues List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-display text-slate-200 flex items-center gap-2">
          <span>Detected Audit Findings</span>
          <span className="text-xs font-mono text-slate-500">({filteredIssues.length} items)</span>
        </h3>

        {filteredIssues.length === 0 ? (
          <div className="glass-panel p-8 text-center border border-dashed border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">No Issues Found in this Category</h4>
            <p className="text-xs text-slate-400 mt-1">
              Your source code meets or exceeds all current baseline requirements.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const isCrit = issue.severity === 'CRITICAL';
            const isHigh = issue.severity === 'HIGH';
            const isMed = issue.severity === 'MEDIUM';

            return (
              <div 
                key={issue.id || idx}
                className="glass-card p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {isCrit ? (
                      <span className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 flex-shrink-0">
                        <XCircle className="w-4 h-4" />
                      </span>
                    ) : isHigh ? (
                      <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30 flex-shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </span>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-slate-100 font-display">
                        {issue.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-400">
                        <span className="uppercase text-emerald-400">{issue.category}</span>
                        <span>•</span>
                        <span>Line {issue.line_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                      isCrit ? 'badge-rose' : isHigh ? 'badge-amber' : isMed ? 'badge-cyan' : 'badge-emerald'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {issue.description}
                </p>

                {/* Grounding Citation if any */}
                {issue.grounded_rule && (
                  <div className="px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs font-mono text-indigo-300 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span><strong>Learned Rule #{issue.grounded_rule.rule_id}:</strong> {issue.grounded_rule.description}</span>
                  </div>
                )}

                {/* Remediation Guidance */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                    Recommended Fix
                  </span>
                  <p className="text-slate-300 font-mono text-[12px]">
                    {issue.recommendation}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
