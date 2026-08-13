import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import CinematicBackground from './components/CinematicBackground';
import CinematicIntro from './components/CinematicIntro';
import EditorPanel from './components/EditorPanel';
import ReviewReport from './components/ReviewReport';
import DiffViewer from './components/DiffViewer';
import HistoricalRulesHub from './components/HistoricalRulesHub';
import GrowthDashboard from './components/GrowthDashboard';
import PRSimulator from './components/PRSimulator';
import AuthModal from './components/AuthModal';
import ApiKeyModal from './components/ApiKeyModal';

const INITIAL_CODE = `import os
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
`;

export default function App() {
  // Intro state: true initially, becomes false when user enters
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'rules', 'growth', 'cicd'
  const [studioSubView, setStudioSubView] = useState('report'); // 'report' or 'diff'

  // Audio State & HTML5 Audio element
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('/opening_song.mp3');
  const audioRef = useRef(null);
  const musicTimerRef = useRef(null);

  // Code state
  const [code, setCode] = useState(INITIAL_CODE);
  const [language, setLanguage] = useState('python');
  const [title, setTitle] = useState('User Profile & Query Handler');

  // Real-time live auto-evaluation toggle & stats
  const [liveRealTimeMode, setLiveRealTimeMode] = useState(true);
  const [realTimeLatencyMs, setRealTimeLatencyMs] = useState(16);
  const debounceTimerRef = useRef(null);

  // Review result state
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Auth & Key State
  const [token, setToken] = useState(localStorage.getItem('aura_jwt_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('aura_gemini_key') || 'AIzaSy-INBUILT-COMMUNITY-FREE-ENGINE-2026');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(selectedTrack);
    audio.loop = false;
    audio.volume = 0.45;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
    };
  }, [selectedTrack]);

  // Audio play/pause handler
  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
    } else {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch((err) => {
        console.warn('Audio play error:', err);
      });
    }
  };

  // When user enters from intro
  const handleEnterApp = () => {
    setShowIntro(false);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);

        // Automatically fade and stop after 14 seconds
        if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
        musicTimerRef.current = setTimeout(() => {
          if (audioRef.current) {
            let vol = audioRef.current.volume;
            const fadeInterval = setInterval(() => {
              vol -= 0.05;
              if (vol <= 0.05) {
                clearInterval(fadeInterval);
                audioRef.current.pause();
                audioRef.current.volume = 0.45;
                setIsAudioPlaying(false);
              } else {
                audioRef.current.volume = vol;
              }
            }, 100);
          }
        }, 14000);
      }).catch((err) => {
        console.warn('Audio playback policy:', err);
      });
    }
  };

  // Fetch current user on mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to verify profile:', err);
      }
    };
    fetchUser();
  }, [token]);

  // Handle Code Evaluation (Real-Time)
  const handleReviewCode = async (isManualClick = false) => {
    if (!code.trim()) return;

    const startTime = performance.now();
    try {
      setLoadingReview(true);
      const res = await fetch('/api/reviews/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: title || 'Source Code Review',
          language,
          source_code: code,
          api_key_override: apiKey || null,
          save_session: true
        })
      });

      const data = await res.json();
      setReviewData(data);
      const latency = Math.round(performance.now() - startTime);
      setRealTimeLatencyMs(latency);

      // Trigger celebration confetti if score is elite (>= 9.0) on manual run
      if (isManualClick && data.quality_score >= 9.0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1']
        });
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setLoadingReview(false);
    }
  };

  // Real-Time Live Auto-Audit Stream on typing (debounced 350ms)
  useEffect(() => {
    if (!liveRealTimeMode) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleReviewCode(false);
    }, 380);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, language, title, liveRealTimeMode]);

  // Handle Login Success
  const handleLoginSuccess = (user, accessToken) => {
    setCurrentUser(user);
    setToken(accessToken);
    localStorage.setItem('aura_jwt_token', accessToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('aura_jwt_token');
  };

  // Load past session into studio
  const handleLoadSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/reviews/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setCode(data.source_code);
      setLanguage(data.language);
      setTitle(data.title);
      setReviewData(data);
      setActiveTab('studio');
      setStudioSubView('report');
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  // 1-Click apply refactored code to editor
  const handleApplyRefactoredCode = (refactoredCode) => {
    if (!refactoredCode) return;
    setCode(refactoredCode);
    setStudioSubView('report');
    setTimeout(() => {
      handleReviewCode(true);
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-16 selection:bg-emerald-500/30 selection:text-emerald-200">
      <CinematicBackground />

      {/* Cinematic Intro Splash Screen */}
      {showIntro && (
        <CinematicIntro onEnterApp={handleEnterApp} />
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenApiKey={() => setApiKeyModalOpen(true)}
        onTriggerIntro={() => setShowIntro(true)}
        hasApiKey={Boolean(apiKey)}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        selectedTrack={selectedTrack}
        onChangeTrack={setSelectedTrack}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-8 mt-4">
        {/* Tab 1: Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* View Sub-Switcher & Real-Time Status Bar */}
            {reviewData && (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStudioSubView('report')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      studioSubView === 'report'
                        ? 'bg-slate-200 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Quality Audit &amp; Findings
                  </button>
                  <button
                    onClick={() => setStudioSubView('diff')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      studioSubView === 'diff'
                        ? 'bg-slate-200 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Side-by-Side Diff &amp; Refactor
                  </button>
                </div>

                {/* Real-time telemetry indicators */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold">LIVE REAL-TIME STREAM</span>
                    <span className="text-slate-400">({realTimeLatencyMs}ms)</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-slate-400">
                    <span>Quality Score:</span>
                    <span className="text-emerald-400 font-bold">{reviewData.quality_score}/10.0</span>
                    <span>(Grade {reviewData.grade})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Split Studio Grid: Editor on Left, Audit/Diff on Right */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Code Studio Editor */}
              <div className="xl:col-span-5 h-[620px]">
                <EditorPanel
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  title={title}
                  setTitle={setTitle}
                  onReview={() => handleReviewCode(true)}
                  loading={loadingReview}
                  liveRealTimeMode={liveRealTimeMode}
                  setLiveRealTimeMode={setLiveRealTimeMode}
                  realTimeLatencyMs={realTimeLatencyMs}
                />
              </div>

              {/* Right Column: Dynamic Report or Diff Viewer */}
              <div className="xl:col-span-7">
                {studioSubView === 'report' ? (
                  <ReviewReport
                    reviewData={reviewData}
                    onViewDiff={() => setStudioSubView('diff')}
                  />
                ) : (
                  <DiffViewer
                    originalCode={code}
                    refactoredCode={reviewData?.refactored_code || ''}
                    language={language}
                    onApplyToEditor={handleApplyRefactoredCode}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Historical Rule Learning Hub */}
        {activeTab === 'rules' && (
          <HistoricalRulesHub token={token} />
        )}

        {/* Tab 3: Developer Growth Analytics */}
        {activeTab === 'growth' && (
          <GrowthDashboard token={token} onLoadSession={handleLoadSession} />
        )}

        {/* Tab 4: 24/7 CI/CD & PR Simulator */}
        {activeTab === 'cicd' && (
          <PRSimulator token={token} />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  );
}
