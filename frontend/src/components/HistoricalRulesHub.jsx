import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  Play,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';

export default function HistoricalRulesHub({ token }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [uploadStatus, setUploadStatus] = useState(null);
  
  // Custom Rule Creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    type: 'security',
    description: '',
    severity: 'HIGH'
  });

  // Rule Tester State
  const [testRule, setTestRule] = useState({
    type: 'formatting',
    description: 'Avoid single-character variable names — they hurt readability',
    code: `def calculate_metric(a, b):\n    x = a * 10\n    return x`
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Fetch Rules
  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rules/');
      const data = await res.json();
      setRules(data.rules || []);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Handle CSV File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus({ type: 'loading', msg: `Processing ${file.name}...` });
      const res = await fetch('/api/rules/ingest/file', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ type: 'success', msg: data.message });
        fetchRules();
      } else {
        setUploadStatus({ type: 'error', msg: data.detail || 'Failed to ingest CSV' });
      }
    } catch (err) {
      setUploadStatus({ type: 'error', msg: 'Network error during CSV upload' });
    }
  };

  // Handle Direct Paste CSV Ingestion
  const handleIngestSample = async () => {
    const sampleCSV = `id,type,description
1,formatting,Avoid single-character variable names — they hurt readability
2,performance,Cache repeated database lookups inside the request loop
3,security,Never interpolate raw user input directly into SQL queries
4,security,Do not hardcode sensitive credentials API keys or tokens in source files
5,performance,Avoid quadratic nested loops when linear lookups with sets or hash maps can be used`;

    try {
      setUploadStatus({ type: 'loading', msg: 'Ingesting baseline dataset...' });
      const res = await fetch('/api/rules/ingest/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ csv_content: sampleCSV })
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ type: 'success', msg: data.message });
        fetchRules();
      }
    } catch (err) {
      setUploadStatus({ type: 'error', msg: 'Failed to ingest benchmark dataset' });
    }
  };

  // Handle Rule Test
  const handleRunRuleTest = async () => {
    try {
      setTesting(true);
      const res = await fetch('/api/rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testRule.type,
          description: testRule.description,
          test_code: testRule.code
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  // Filtered Rules
  const filteredRules = rules.filter((r) => {
    const typeMatch = selectedType === 'ALL' || r.type.toLowerCase() === selectedType.toLowerCase();
    const searchMatch = r.description.toLowerCase().includes(searchQuery.toLowerCase()) || String(r.rule_id).includes(searchQuery);
    return typeMatch && searchMatch;
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Banner / Ingestion Section */}
      <div className="glass-panel p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold font-display text-slate-100">
                Historical Rule & Learning Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ingest historical architectural rules, organizational anti-patterns, and compliance standards via CSV (<code className="text-emerald-400 font-mono">&lt;id&gt;, &lt;type&gt;, &lt;description&gt;</code>). The 24/7 AI evaluator automatically grounds future reviews against this learned knowledge base.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-lg">
              <Upload className="w-4 h-4" />
              <span>Upload Rules CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleIngestSample}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Load Default CSV Schema</span>
            </button>

            <a
              href="/api/rules/export/csv"
              download
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Upload Feedback Alert */}
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
            uploadStatus.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' :
            uploadStatus.type === 'error' ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' :
            'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <span>{uploadStatus.msg}</span>
            <button onClick={() => setUploadStatus(null)} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>
        )}
      </div>

      {/* Main Content: Interactive Rule Base & Live Tester */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Rule Directory */}
        <div className="xl:col-span-2 space-y-4">
          {/* Search & Filters */}
          <div className="glass-panel p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules by ID or keyword (e.g., SQL, variable, loop, cache)..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'security', 'performance', 'architecture', 'formatting', 'bug'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedType === t
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>Active Ingested Rules: {filteredRules.length}</span>
              <span>Schema: &lt;id&gt;, &lt;type&gt;, &lt;description&gt;</span>
            </div>

            {loading ? (
              <div className="glass-panel p-8 text-center text-slate-500 font-mono text-xs">
                Loading learned rules...
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="glass-panel p-8 text-center text-slate-500 font-mono text-xs">
                No rules matched your search query.
              </div>
            ) : (
              filteredRules.map((rule) => {
                const isSec = rule.type === 'security';
                const isPerf = rule.type === 'performance';
                const isArch = rule.type === 'architecture';
                const isFormat = rule.type === 'formatting';

                return (
                  <div
                    key={rule.id || rule.rule_id}
                    className="glass-card p-4 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200">
                          #{rule.rule_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          isSec ? 'badge-rose' : isPerf ? 'badge-amber' : isArch ? 'badge-indigo' : isFormat ? 'badge-cyan' : 'badge-emerald'
                        }`}>
                          {rule.type}
                        </span>
                        {rule.is_custom && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            Custom Upload
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {rule.description}
                      </p>

                      {rule.pattern_regex && (
                        <div className="text-[11px] font-mono text-slate-500 truncate max-w-xl">
                          Synthesized Matcher: <code className="text-slate-400">{rule.pattern_regex}</code>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setTestRule({
                          type: rule.type,
                          description: rule.description,
                          code: testRule.code
                        });
                      }}
                      className="text-xs font-mono text-slate-400 hover:text-emerald-400 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors flex-shrink-0"
                    >
                      Test in Sandbox →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Interactive Rule Tester Sandbox */}
        <div className="space-y-4">
          <div className="glass-panel p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold font-display text-slate-100">
                Rule Synthesizer & Pattern Tester
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Verify how the learning engine evaluates and recognizes historical rule patterns on arbitrary code snippets.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-slate-400 block">Rule Type</label>
              <select
                value={testRule.type}
                onChange={(e) => setTestRule({ ...testRule, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
              >
                <option value="formatting">formatting</option>
                <option value="performance">performance</option>
                <option value="security">security</option>
                <option value="architecture">architecture</option>
                <option value="bug">bug</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-slate-400 block">Rule Description</label>
              <textarea
                value={testRule.description}
                onChange={(e) => setTestRule({ ...testRule, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-emerald-500/50 outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-slate-400 block">Test Code Snippet</label>
              <textarea
                value={testRule.code}
                onChange={(e) => setTestRule({ ...testRule, code: e.target.value })}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-emerald-200 font-mono focus:border-emerald-500/50 outline-none"
              />
            </div>

            <button
              onClick={handleRunRuleTest}
              disabled={testing}
              className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              {testing ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>Test Pattern Recognition</span>
            </button>

            {/* Test Result Box */}
            {testResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 ${
                testResult.matched ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Evaluation Result:</span>
                  <span className={testResult.matched ? 'text-emerald-400' : 'text-slate-500'}>
                    {testResult.matched ? '✓ MATCHED RULE CRITERIA' : '✕ NO MATCH TRIGGERED'}
                  </span>
                </div>
                {testResult.matched && (
                  <div className="space-y-1 pt-1 border-t border-emerald-500/20">
                    <span className="text-[10px] text-slate-400 block">Matched Lines ({testResult.match_count}):</span>
                    {testResult.matches.map((m, i) => (
                      <div key={i} className="text-slate-300 text-[11px] bg-slate-950/80 px-2 py-1 rounded">
                        Line {m.line}: <code>{m.text}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
