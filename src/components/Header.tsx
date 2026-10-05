import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Sparkles, Terminal, ShieldCheck, 
  RotateCcw, Trophy, Activity, ArrowRight,
  Music, Target, FileText, Bot
} from 'lucide-react';

interface HeaderProps {
  currentView?: 'landing' | 'studio';
  onNavigateView?: (view: 'landing' | 'studio') => void;
  onReset: () => void;
  onOpenJsonModal: () => void;
  activeSampleTitle?: string;
  hasAudio: boolean;
  hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = 'landing',
  onNavigateView,
  onReset,
  onOpenJsonModal,
  activeSampleTitle,
  hasAudio,
  hasResult
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Track window scroll for elevated shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (currentView === 'studio' && onNavigateView) {
      onNavigateView('landing');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (toggleBtn && toggleBtn.contains(e.target as Node)) return;
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Smooth scroll helper for quick section navigation
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (currentView !== 'landing' && onNavigateView) {
      onNavigateView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-sm' 
          : 'bg-white/80 backdrop-blur-lg border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
        
        {/* Left: Branding & Status Dot */}
        <div className="flex items-center space-x-3 shrink-0">
          <div 
            className="relative group cursor-pointer" 
            onClick={handleLogoClick}
            title="VoxPulse - Home"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-xs flex items-center justify-center p-1 transition-all duration-300 group-hover:scale-105 border border-slate-200/90 overflow-hidden">
              <img 
                src="/app-icon.png" 
                alt="VoxPulse Logo" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            {/* Live Green Beacon */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500 border-2 border-white shadow-xs"></span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <h1 
              onClick={handleLogoClick}
              className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading cursor-pointer select-none"
            >
              Vox<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Pulse</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-200/80">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>Speech AI</span>
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <div className="hidden md:flex items-center justify-center">
          {currentView === 'landing' ? (
            <nav className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 backdrop-blur-md text-xs font-bold text-slate-600">
              <button
                onClick={() => scrollToSection('section-pipeline')}
                className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              >
                Pipeline
              </button>
              <button
                onClick={() => scrollToSection('section-intelligence')}
                className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              >
                Intelligence
              </button>
              <button
                onClick={() => scrollToSection('section-benchmarks')}
                className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              >
                Benchmarks
              </button>
              <button
                onClick={onOpenJsonModal}
                className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-violet-600" />
                <span>PRD Telemetry</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <button 
                onClick={() => onNavigateView?.('landing')}
                className="hover:text-violet-600 transition-colors cursor-pointer"
              >
                Home
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-violet-700 font-bold px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200">
                Speech Studio
              </span>
            </div>
          )}
        </div>

        {/* Right: Desktop Controls */}
        <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
          
          {/* Active Audio Indicator (Studio view) */}
          {currentView === 'studio' && hasAudio && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[140px]">
                {activeSampleTitle || 'Custom Audio'}
              </span>
            </div>
          )}

          {/* Privacy badge */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% In-Browser DSP</span>
          </div>

          {/* View Switcher Button */}
          {currentView === 'landing' ? (
            <button
              onClick={() => onNavigateView?.('studio')}
              className="group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                boxShadow: '0 4px 15px rgba(124,58,237,0.35)'
              }}
            >
              <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateView?.('landing')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Home</span>
              </button>

              {hasAudio && (
                <button
                  onClick={onReset}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  title="Reset and analyze new speech"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                onClick={onOpenJsonModal}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Inspect PRD JSON Contract"
              >
                <Terminal className="w-3.5 h-3.5 text-violet-600" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Controls (< sm screens) */}
        <div className="flex sm:hidden items-center space-x-2">
          {currentView === 'landing' ? (
            <button
              onClick={() => onNavigateView?.('studio')}
              className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                boxShadow: '0 3px 12px rgba(124,58,237,0.3)'
              }}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateView?.('landing')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Home</span>
            </button>
          )}

          {/* Animated Hamburger Menu Toggle Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-1 text-slate-700 hover:text-violet-600 focus:outline-hidden transition-all active:scale-95"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={`w-4 h-0.5 bg-slate-700 rounded-full transition-all duration-300 transform ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5 bg-violet-600' : ''
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-slate-700 rounded-full transition-all duration-300 transform ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5 bg-violet-600' : ''
              }`}
            />
            {hasAudio && !isMobileMenuOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown Drawer Sheet */}
      {isMobileMenuOpen && (
        <>
          {/* Subtle Backdrop Overlay */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/35 backdrop-blur-xs sm:hidden z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Drawer Sheet */}
          <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 shadow-2xl p-5 sm:hidden z-50 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-b-3xl"
          >
            {/* Primary Action Button */}
            <div>
              {currentView === 'landing' ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateView?.('studio');
                  }}
                  className="w-full py-3 px-4 rounded-2xl flex items-center justify-between text-xs font-black text-white shadow-lg active:scale-98 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                    boxShadow: '0 6px 20px rgba(124,58,237,0.35)'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">Launch Speech Studio</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateView?.('landing');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-between text-xs font-bold transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span className="text-sm">Return to Landing Page</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Section Shortcuts (Landing View) */}
            {currentView === 'landing' && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Explore VoxPulse
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => scrollToSection('section-pipeline')}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex items-center gap-2.5 transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Pipeline</p>
                      <p className="text-[10px] text-slate-400">3-Step Process</p>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('section-intelligence')}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex items-center gap-2.5 transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Intelligence</p>
                      <p className="text-[10px] text-slate-400">Acoustic Rigor</p>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('section-benchmarks')}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex items-center gap-2.5 transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Benchmarks</p>
                      <p className="text-[10px] text-slate-400">Sample Speeches</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenJsonModal();
                    }}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex items-center gap-2.5 transition-all active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Telemetry</p>
                      <p className="text-[10px] text-slate-400">PRD Contract</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Active Audio Card (Studio View) */}
            {currentView === 'studio' && (
              <div className="space-y-2">
                {hasAudio ? (
                  <div className="p-3.5 rounded-2xl bg-violet-50/90 border border-violet-100 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-violet-200 flex items-center justify-center shrink-0 shadow-xs text-violet-600">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                          <p className="text-[11px] font-bold text-violet-900">Active Speech Audio</p>
                        </div>
                        <p className="text-xs text-slate-700 font-medium truncate">
                          {activeSampleTitle || 'Custom Audio'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onReset();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-xs flex items-center gap-1 font-bold text-rose-700 shrink-0 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>Ready for audio · Select benchmark speech or record live</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Section Navigation in Studio (If results are visible) */}
            {currentView === 'studio' && hasResult && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Dashboard Sections
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => scrollToSection('section-scores')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800">Scores</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-player')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Music className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs font-bold text-slate-800">Waveform</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-chart')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Activity className="w-3.5 h-3.5 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">Dynamics</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-flaws')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Target className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">Flaws</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-transcript')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">Transcript</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('open-speech-assistant'));
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">AI Coach</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions: PRD JSON Contract */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenJsonModal();
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 leading-tight">PRD Data Contract</p>
                    <p className="text-[10px] text-slate-500 font-normal">Inspect or export full JSON schema</p>
                  </div>
                </div>
                <span className="text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 border border-violet-200">
                  JSON
                </span>
              </button>
            </div>

            {/* Security Guarantee Strip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-Side Private DSP</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v1.2.0</span>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
