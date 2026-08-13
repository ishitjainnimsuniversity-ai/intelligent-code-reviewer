import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Flame, 
  Clock, 
  Code2, 
  ExternalLink, 
  ArrowUpRight,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function GrowthDashboard({ token, onLoadSession }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const [growthRes, historyRes] = await Promise.all([
        fetch('/api/analytics/growth', { headers: authHeaders }),
        fetch('/api/reviews/history?limit=30', { headers: authHeaders })
      ]);

      const growthData = await growthRes.json();
      const historyData = await historyRes.json();

      setAnalytics(growthData.analytics || null);
      setHistory(historyData.history || []);
    } catch (err) {
      console.error('Failed to load growth data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 font-mono text-sm">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading persistent session growth data...
      </div>
    );
  }

  const trajectory = analytics?.score_trajectory || [];
  const categoryCounts = analytics?.category_breakdown || {};
  const highlights = analytics?.growth_highlights || {};

  // Line Chart Config for Score Trajectory
  const lineChartData = {
    labels: trajectory.length > 0 ? trajectory.map((t, idx) => `#${idx + 1} (${t.language})`) : ['Initial', 'Review 1'],
    datasets: [
      {
        label: 'Quality Score (1-10)',
        data: trajectory.length > 0 ? trajectory.map((t) => t.score) : [5.0, 7.5],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#060913',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 10,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#34d399',
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono' }
      }
    }
  };

  // Bar Chart Config for Category Mistakes
  const barChartData = {
    labels: ['Security', 'Performance', 'Architecture', 'Style', 'Bugs'],
    datasets: [
      {
        label: 'Anti-Patterns Identified',
        data: [
          categoryCounts.security || 0,
          categoryCounts.performance || 0,
          categoryCounts.architecture || 0,
          categoryCounts.formatting || 0,
          categoryCounts.bug || 0
        ],
        backgroundColor: [
          'rgba(244, 63, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Growth Banner */}
      <div className="glass-panel p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold font-display text-slate-100">
                Developer Growth & Session Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Persistent tracking of your code review sessions, score trends, and anti-pattern mitigation over time.
            </p>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="glass-card p-4 text-center border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Reviews</span>
              <span className="text-xl font-bold font-mono text-slate-100">{analytics?.total_reviews || 0}</span>
            </div>

            <div className="glass-card p-4 text-center border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Average Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{analytics?.average_score || 0.0}/10</span>
            </div>

            <div className="glass-card p-4 text-center border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Growth Delta</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{highlights.score_improvement}</span>
            </div>

            <div className="glass-card p-4 text-center border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Review Streak</span>
              <span className="text-xl font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400" />
                {highlights.active_streak}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Score Trajectory Chart */}
        <div className="lg:col-span-2 glass-panel p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-100">
                Code Quality Score Progression
              </h3>
              <p className="text-xs text-slate-400">
                Standardized 1.0 - 10.0 evaluation ratings mapped across sequential review sessions.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Target: 9.0+ A+
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Right Col: Anti-Pattern Distribution */}
        <div className="glass-panel p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold font-display text-slate-100">
              Anti-Pattern Frequency
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of issues detected in historical reviews.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                  x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Session History Log Table */}
      <div className="glass-panel p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-slate-100">
              Persistent Review Session Records
            </h3>
            <p className="text-xs text-slate-400">
              Saved submissions and audits stored permanently in SQLite database.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{history.length} Sessions Logged</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No previous review sessions recorded yet. Run your first review in the Studio!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3">Session Title</th>
                  <th className="py-3 px-3">Language</th>
                  <th className="py-3 px-3">Quality Score</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      {s.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                        {s.language}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-100">{s.quality_score}</span>
                      <span className="text-slate-500"> / 10.0</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-cyan-400">
                        {s.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {s.created_at}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onLoadSession && onLoadSession(s.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 ml-auto"
                      >
                        <span>Inspect Review</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
