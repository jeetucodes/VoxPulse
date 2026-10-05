import React, { useState, useEffect, useRef } from 'react';
import { Clay3DIcon } from './Clay3DIcon';

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
  const menuRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Modern App Icon & Branding */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative group cursor-pointer" onClick={handleLogoClick}>
            <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-2xl bg-white shadow-clay-card flex items-center justify-center p-1 transition-all duration-300 group-hover:scale-105 border border-slate-200/90 relative overflow-hidden">
              <img 
                src="/app-icon.png" 
                alt="VoxPulse App Icon" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            {/* Status Live Beacon */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white shadow-xs"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 
                onClick={handleLogoClick}
                className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-heading flex items-center cursor-pointer select-none"
              >
                Vox<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Pulse</span>
              </h1>
              <span className="hidden min-[380px]:inline-flex px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-200/80 shadow-clay-pill items-center gap-1">
                <Clay3DIcon name="sparkles" size="xs" />
                Speech AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden md:flex items-center gap-1.5">
              <span>Contrastive Speech Analytics & Delivery Diagnostics</span>
            </p>
          </div>
        </div>

        {/* Desktop Action Controls (hidden on mobile, shown on sm+) */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
          {/* View switcher between Landing and Studio */}
          {currentView === 'landing' ? (
            <button
              onClick={() => onNavigateView?.('studio')}
              className="btn-clay-primary px-4 py-2 text-xs font-bold text-white shadow-sugary-violet flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <Clay3DIcon name="mic" size="xs" />
              <span>Launch Studio</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateView?.('landing')}
              className="btn-clay-secondary px-3.5 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:text-violet-600 transition-colors"
              title="Return to Landing Page"
            >
              <Clay3DIcon name="sparkles" size="xs" />
              <span>Home</span>
            </button>
          )}

          {currentView === 'studio' && hasAudio && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs text-slate-700 font-semibold shadow-clay-pill">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <Clay3DIcon name="music" size="xs" />
              <span className="truncate max-w-[150px] lg:max-w-[200px]">
                {activeSampleTitle || 'Custom Audio'}
              </span>
            </div>
          )}

          {/* Privacy Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-clay-pill">
            <Clay3DIcon name="tick" size="xs" />
            <span>100% Client-Side DSP</span>
          </div>

          {/* PRD Data Contract Button */}
          <button
            onClick={onOpenJsonModal}
            className="btn-clay-secondary flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-slate-700"
            title="Inspect or Export JSON Data Contract"
          >
            <Clay3DIcon name="document" size="xs" />
            <span>Data Contract</span>
          </button>

          {/* Reset / New Speech Button in Studio */}
          {currentView === 'studio' && hasAudio && (
            <button
              onClick={onReset}
              className="btn-clay-secondary flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-slate-700"
              title="Reset and analyze new speech"
            >
              <Clay3DIcon name="refresh" size="xs" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile Action Controls (< sm screens) */}
        <div className="flex sm:hidden items-center space-x-2">
          {currentView === 'landing' ? (
            <button
              onClick={() => onNavigateView?.('studio')}
              className="btn-clay-primary px-3 py-1.5 text-xs flex items-center gap-1 font-bold text-white shadow-sugary-violet"
            >
              <Clay3DIcon name="mic" size="xs" />
              <span className="text-[11px]">Studio</span>
            </button>
          ) : hasAudio ? (
            <button
              onClick={onReset}
              className="btn-clay-secondary px-2.5 py-1.5 text-xs flex items-center gap-1 font-bold text-slate-700"
              title="Reset Analysis"
            >
              <Clay3DIcon name="refresh" size="xs" />
              <span className="text-[11px]">Reset</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateView?.('landing')}
              className="btn-clay-secondary px-2.5 py-1.5 text-xs flex items-center gap-1 font-bold text-slate-700"
              title="Return Home"
            >
              <Clay3DIcon name="sparkles" size="xs" />
              <span className="text-[11px]">Home</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-clay-card flex flex-col items-center justify-center gap-1 text-slate-700 hover:text-violet-600 focus:outline-hidden transition-all active:scale-95"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
            {/* Live Audio indicator dot on hamburger */}
            {hasAudio && !isMobileMenuOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Subtle Backdrop Overlay */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs sm:hidden z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Drawer Content */}
          <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-pop-lg p-4 sm:hidden z-50 animate-pop-in space-y-3.5 max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            {/* View Switcher in Mobile Drawer */}
            <div>
              {currentView === 'landing' ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateView?.('studio');
                  }}
                  className="w-full btn-clay-primary py-2.5 px-3 rounded-2xl flex items-center justify-between text-xs font-bold text-white shadow-sugary-violet"
                >
                  <div className="flex items-center gap-2">
                    <Clay3DIcon name="mic" size="xs" />
                    <span>Launch Speech Studio</span>
                  </div>
                  <span>→</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateView?.('landing');
                  }}
                  className="w-full btn-clay-secondary py-2.5 px-3 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Clay3DIcon name="sparkles" size="xs" />
                    <span>Return to Home / Overview</span>
                  </div>
                  <span>→</span>
                </button>
              )}
            </div>

            {/* Audio Status Card */}
            {hasAudio ? (
              <div className="p-3 rounded-2xl bg-violet-50/80 border border-violet-100 shadow-clay-card flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-violet-200/70 flex items-center justify-center shrink-0 shadow-xs">
                    <Clay3DIcon name="music" size="xs" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <p className="text-[11px] font-bold text-violet-900">Active Audio</p>
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
                  className="btn-clay-secondary px-3 py-1.5 text-xs flex items-center gap-1 font-bold text-rose-600 border-rose-200 shrink-0"
                >
                  <Clay3DIcon name="refresh" size="xs" />
                  <span>Reset</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-clay-card flex items-center gap-2.5 text-xs text-slate-600">
                <Clay3DIcon name="sparkles" size="xs" />
                <span>Ready for audio · Select a speech or record live</span>
              </div>
            )}

            {/* Quick Section Navigation (Only if results are visible) */}
            {hasResult && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Dashboard Sections
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => scrollToSection('section-scores')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-violet-300 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Clay3DIcon name="trophy" size="xs" />
                    <span className="text-xs font-bold text-slate-800">Scores</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-player')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-violet-300 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Clay3DIcon name="music" size="xs" />
                    <span className="text-xs font-bold text-slate-800">Waveform</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-chart')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-violet-300 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Clay3DIcon name="chart" size="xs" />
                    <span className="text-xs font-bold text-slate-800">Dynamics</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-flaws')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-violet-300 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Clay3DIcon name="target" size="xs" />
                    <span className="text-xs font-bold text-slate-800">Flaws</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('section-transcript')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-violet-300 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Clay3DIcon name="speech" size="xs" />
                    <span className="text-xs font-bold text-slate-800">Transcript</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('open-speech-assistant'));
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-violet-300 text-left flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Clay3DIcon name="robot" size="xs" />
                    <span className="text-xs font-bold text-slate-800">AI Coach</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions: JSON Data Contract */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenJsonModal();
                }}
                className="w-full btn-clay-secondary py-2.5 px-3 flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200/60 flex items-center justify-center shrink-0">
                    <Clay3DIcon name="document" size="xs" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 leading-tight">PRD Data Contract</p>
                    <p className="text-[10px] text-slate-500 font-normal">Inspect or export full JSON schema</p>
                  </div>
                </div>
                <span className="text-violet-600 text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200">
                  JSON
                </span>
              </button>
            </div>

            {/* Privacy & Security Guarantee */}
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <div className="flex items-center gap-1.5">
                <Clay3DIcon name="tick" size="xs" />
                <span>100% Client-Side DSP · Private</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v1.2</span>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
