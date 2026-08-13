import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Code2,
  Cpu
} from 'lucide-react';

const DEFAULT_DIFF = `diff --git a/src/controllers/auth.py b/src/controllers/auth.py
index a1b2c3d..e4f5g6h 100644
--- a/src/controllers/auth.py
+++ b/src/controllers/auth.py
@@ -10,12 +10,14 @@ def login_user(request):
     username = request.json.get("username")
     password = request.json.get("password")
-    # Safe query placeholder
+    # Querying DB directly with string interpolation
+    q = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
+    db.cursor.execute(q)
+    x = db.cursor.fetchall()
+    return {"user": x}
`;

export default function PRSimulator({ token }) {
  const [prTitle, setPrTitle] = useState('feat(auth): optimize SQL query and payload handler');
  const [repoName, setRepoName] = useState('hyper-scale/core-auth');
  const [branch, setBranch] = useState('feature/login-v2');
  const [diffText, setDiffText] = useState(DEFAULT_DIFF);
  
  const [loading, setLoading] = useState(false);
  const [prResult, setPrResult] = useState(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleRunSimulation = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/webhook/github-pr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          pr_title: prTitle,
          repo_name: repoName,
          branch: branch,
          diff_text: diffText
        })
      });
      const data = await res.json();
      setPrResult(data);
    } catch (err) {
      console.error('PR review simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const curl = `curl -X POST http://127.0.0.1:8000/api/webhook/github-pr \\
  -H "Content-Type: application/json" \\
  -d '{"pr_title": "${prTitle}", "repo_name": "${repoName}", "branch": "${branch}", "diff_text": "..."}'`;
    navigator.clipboard.writeText(curl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <GitPullRequest className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold font-display text-slate-100">
                24/7 CI/CD & Pull Request Review Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience how Aura 24/7 acts as an autonomous GitHub bot. Whenever a pull request or git diff is submitted, the engine executes multi-language linting, historical rule validation, and leaves automated inline code suggestions.
            </p>
          </div>

          <button
            onClick={handleCopyCurl}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono"
          >
            {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedWebhook ? 'cURL Copied!' : 'Copy CI/CD Webhook cURL'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Output Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Col: PR Input Form */}
        <div className="glass-panel p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Simulate Pull Request Event</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Repository</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Branch Name</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">PR Title</label>
            <input
              type="text"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Git Unified Diff</label>
              <span className="text-[10px] font-mono text-slate-500">Supports standard unified diff syntax</span>
            </div>
            <textarea
              value={diffText}
              onChange={(e) => setDiffText(e.target.value)}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-200 font-mono focus:border-emerald-500/50 outline-none"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Simulating 24/7 CI/CD Review...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Trigger Autonomous PR Review</span>
              </>
            )}
          </button>
        </div>

        {/* Right Col: GitHub PR Review Thread Output */}
        <div className="glass-panel p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold font-display text-slate-100">
                GitHub PR Bot Annotation Stream
              </h3>
            </div>

            {prResult && (
              <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                prResult.overall_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {prResult.overall_status === 'APPROVED' ? '✓ APPROVED' : '✕ CHANGES REQUESTED'}
              </span>
            )}
          </div>

          {!prResult ? (
            <div className="text-center py-20 text-slate-500 font-mono text-xs space-y-2">
              <Cpu className="w-8 h-8 mx-auto text-slate-600" />
              <p>No active PR review simulation.</p>
              <p className="text-slate-600 text-[11px]">Click "Trigger Autonomous PR Review" to inspect this pull request.</p>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              {/* Bot Comment Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      🤖
                    </div>
                    <span className="font-bold text-slate-200">aura-reviewer-bot[bot]</span>
                    <span className="text-slate-500 text-[10px]">commented just now</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold">
                    Score: {prResult.average_quality_score}/10.0
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-300 leading-relaxed font-sans text-xs">
                  {prResult.bot_verdict}
                </div>

                {/* Critical Blockers */}
                {prResult.critical_blockers && prResult.critical_blockers.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-rose-400 font-bold text-[11px] uppercase block">
                      🚨 Required Fixes Before Merge ({prResult.critical_blockers.length})
                    </span>
                    {prResult.critical_blockers.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-rose-300 font-bold">
                          <span>{b.file}:{b.line}</span>
                          <span>{b.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Fix: {b.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Individual File Summaries */}
              <div className="space-y-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase block">File Audits:</span>
                {prResult.file_reviews.map((fr, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-200 font-bold">{fr.filename}</span>
                      <span className="text-slate-500 ml-2">({fr.language})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{fr.quality_score}/10</span>
                      <span className="text-cyan-400">Grade {fr.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
