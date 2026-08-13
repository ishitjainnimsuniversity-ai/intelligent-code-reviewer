import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Trash2, 
  FileCode2, 
  Check,
  Cpu,
  Zap,
  Activity
} from 'lucide-react';

const PRESET_TEMPLATES = {
  vulnerable_sql: {
    name: '🚨 SQL Injection & Secrets (Python)',
    lang: 'python',
    title: 'User Profile & Query Handler',
    code: `import os
import sqlite3

# Production API Key
api_key = "AIzaSyD9873498234798234729384729"

def fetch_user_record(user_id):
    # Vulnerable raw SQL string interpolation (CWE-89)
    conn = sqlite3.connect("production.db")
    cursor = conn.cursor()
    
    # Notice single-character variable name 'q'
    q = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(q)
    
    # Notice single-character variable 'r'
    r = cursor.fetchone()
    return r
`
  },
  n_plus_one: {
    name: '⚡ N+1 Query & Loop Allocation (JavaScript)',
    lang: 'javascript',
    title: 'Order Processing Service',
    code: `// Async Order Enrichment Service
async function processCustomerOrders(orderList) {
  let combinedOutput = "";
  const enrichedOrders = [];
  
  // Anti-pattern: database query inside loop triggering O(N) network trips
  for (let i = 0; i < orderList.length; i++) {
    const o = orderList[i];
    const customer = await db.users.findOne({ id: o.userId });
    
    // Inefficient string concatenation in loop
    combinedOutput += "Order: " + o.id + " for " + customer.name + "\\n";
    enrichedOrders.push({ order: o, customer });
  }
  
  return { enrichedOrders, log: combinedOutput };
}
`
  },
  architecture_flaws: {
    name: '🏗️ Mutable Defaults & Bare Except (Python)',
    lang: 'python',
    title: 'Payment Settlement Dispatcher',
    code: `import requests
import json

# Anti-pattern: Mutable default argument retains state across calls
def dispatch_settlement(payments=[], target_env="prod"):
    # Anti-pattern: disabled TLS certificate validation
    response = requests.post(
        "https://api.settlements.internal/v1/batch", 
        json={"items": payments}, 
        verify=False
    )
    
    try:
        data = response.json()
        return data
    except:
        # Anti-pattern: broad except silently suppressing fatal errors
        return None
`
  },
  style_magic_numbers: {
    name: '📏 Single-Char Vars & Magic Numbers (Java)',
    lang: 'java',
    title: 'Billing Period Processor',
    code: `public class BillingProcessor {
    public double calculateTotalInvoice(double a, double b) {
        // Anti-pattern: single character identifiers and magic numbers
        double x = a * 86400;
        double y = b * 3600;
        return x + y;
    }
}
`
  },
  clean_production: {
    name: '✨ Elite Clean Code (Python)',
    lang: 'python',
    title: 'Secure Account Repository',
    code: `import os
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class UserProfile:
    user_id: int
    username: str
    email_address: str

class SecureAccountRepository:
    def __init__(self, connection_pool):
        self._pool = connection_pool
        self._api_secret = os.environ.get("ACCOUNT_API_KEY", "")

    def find_user_by_id(self, user_id: int) -> Optional[UserProfile]:
        query_statement = """
            SELECT id, username, email 
            FROM users 
            WHERE id = :user_id
        """
        try:
            with self._pool.acquire() as connection:
                record = connection.fetch_one(query_statement, {"user_id": user_id})
                if not record:
                    return None
                return UserProfile(
                    user_id=record["id"],
                    username=record["username"],
                    email_address=record["email"]
                )
        except Exception as database_error:
            logger.error(f"Database error while querying user {user_id}: {database_error}")
            raise
`
  }
};

export default function EditorPanel({ 
  code, 
  setCode, 
  language, 
  setLanguage, 
  title, 
  setTitle, 
  onReview, 
  loading,
  liveRealTimeMode = true,
  setLiveRealTimeMode,
  realTimeLatencyMs = 16
}) {
  const [copied, setCopied] = useState(false);

  const lineCount = (code.split('\n') || ['']).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadTemplate = (templateKey) => {
    const template = PRESET_TEMPLATES[templateKey];
    if (template) {
      setCode(template.code);
      setLanguage(template.lang);
      setTitle(template.title);
    }
  };

  return (
    <div className="glass-panel overflow-hidden flex flex-col h-full min-h-[560px] border border-slate-800/90 shadow-2xl bg-[#0a0f1d]/90">
      {/* Editor Top Bar */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        {/* Title & Language */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 outline-none cursor-pointer"
            >
              <option value="python" className="bg-slate-950">Python</option>
              <option value="javascript" className="bg-slate-950">JavaScript</option>
              <option value="typescript" className="bg-slate-950">TypeScript</option>
              <option value="java" className="bg-slate-950">Java</option>
              <option value="c++" className="bg-slate-950">C++</option>
              <option value="go" className="bg-slate-950">Go</option>
              <option value="rust" className="bg-slate-950">Rust</option>
              <option value="sql" className="bg-slate-950">SQL</option>
              <option value="c#" className="bg-slate-950">C#</option>
              <option value="php" className="bg-slate-950">PHP</option>
              <option value="ruby" className="bg-slate-950">Ruby</option>
            </select>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review Title..."
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Template Selector & Utilities */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) handleLoadTemplate(e.target.value);
            }}
            defaultValue=""
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs px-2 py-1 rounded-lg outline-none cursor-pointer font-mono"
          >
            <option value="" disabled>Load Test Scenario...</option>
            <option value="vulnerable_sql">🚨 SQL Injection &amp; Secrets</option>
            <option value="n_plus_one">⚡ N+1 Queries in Loop</option>
            <option value="architecture_flaws">🏗️ Bare Except &amp; Disabled SSL</option>
            <option value="style_magic_numbers">📏 Single-Char Vars &amp; Magic Nos</option>
            <option value="clean_production">✨ Elite Clean Code (10/10)</option>
          </select>

          <button
            onClick={handleCopy}
            title="Copy Source Code"
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs flex items-center gap-1 px-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => setCode('')}
            title="Clear Code"
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors px-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time continuous status bar */}
      <div className="px-3 py-1.5 bg-[#050811] border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>REAL-TIME AUDIT STREAM:</span>
          <span className="text-slate-300">ACTIVE ({realTimeLatencyMs}ms)</span>
        </div>

        {setLiveRealTimeMode && (
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={liveRealTimeMode}
              onChange={(e) => setLiveRealTimeMode(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span>Auto-evaluate on typing</span>
          </label>
        )}
      </div>

      {/* High-Contrast Code Editor Body */}
      <div className="relative flex-1 min-h-[380px] flex overflow-hidden bg-[#070b14] font-mono text-xs">
        {loading && <div className="animate-scanline" />}

        {/* Line Numbers */}
        <div className="py-3 pl-3 pr-2 bg-[#050811] border-r border-slate-800/80 select-none overflow-hidden text-right min-w-[36px]">
          {Array.from({ length: Math.max(18, lineCount) }).map((_, i) => (
            <div key={i} className="h-5 leading-5 text-slate-600 text-[11px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Input with Crisp Syntax Contrast */}
        <div className="flex-1 p-3 overflow-auto bg-[#070b14]">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste or write source code here..."
            spellCheck="false"
            className="w-full h-full min-h-[360px] bg-transparent text-emerald-100 placeholder-slate-600 focus:outline-none leading-5 caret-emerald-400 resize-none"
            style={{
              color: '#ecfdf5',
              caretColor: '#10b981',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              lineHeight: '20px'
            }}
          />
        </div>
      </div>

      {/* Editor Footer / Review Action Bar */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{code.length} chars</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> ML Ensemble Online
          </span>
        </div>

        <button
          onClick={onReview}
          disabled={loading || !code.trim()}
          className={`btn-primary flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
            loading || !code.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Real-Time Auditing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Evaluate Real-Time</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
