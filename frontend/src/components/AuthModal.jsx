import React, { useState } from 'react';
import { User, Lock, Mail, Sparkles, X, Shield, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { username, email, password, full_name: username }
      : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.user, data.access_token);
        onClose();
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Network connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, data.access_token);
        onClose();
      } else {
        setError(data.detail || 'Failed to authenticate guest');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 lg:p-8 border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] mx-auto shadow-lg shadow-emerald-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold font-display text-slate-100">
            {isRegister ? 'Create Engineer Account' : 'Sign In to Aura 24/7'}
          </h3>
          <p className="text-xs text-slate-400">
            Secure session tracking, quality growth curves, and custom rule enforcement.
          </p>
        </div>

        {/* Guest Demo Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 mb-5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Instant 1-Click Guest Demo Mode</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-[1px] flex-1 bg-slate-800" />
          <span className="text-[10px] font-mono text-slate-500 uppercase">Or Authenticate</span>
          <div className="h-[1px] flex-1 bg-slate-800" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dev_lead"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-emerald-500/50 outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-emerald-500/50 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{isRegister ? 'Create Account' : 'Authenticate'}</span>
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-slate-400">
          {isRegister ? (
            <span>Already have an account? <button onClick={() => setIsRegister(false)} className="text-emerald-400 hover:underline font-bold">Sign In</button></span>
          ) : (
            <span>Need an account? <button onClick={() => setIsRegister(true)} className="text-emerald-400 hover:underline font-bold">Sign Up</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
