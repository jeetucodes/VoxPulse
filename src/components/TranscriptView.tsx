import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, X, Copy, Check, Edit3, ArrowRight, CornerDownRight, Loader2
} from 'lucide-react';
import { TranslatorService } from '../services/translator';
import { Clay3DIcon } from './Clay3DIcon';
import { WaterWaveDecoration } from './WaterWaveDecoration';
import type { TranscriptWord, FlawType, Flaw } from '../types/speech';

interface TranscriptViewProps {
  transcript: TranscriptWord[];
  currentTime: number;
  duration?: number;
  onSeek: (time: number) => void;
  activeFlawId?: string | null;
  onPlaySegment?: (start: number, end: number, flawId: string) => void;
  flaws?: Flaw[];
  onUpdateTranscript?: (newTranscriptText: string) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcript,
  currentTime,
  onSeek,
  activeFlawId,
  onPlaySegment,
  flaws = [],
  onUpdateTranscript
}) => {
  // State for filtering highlights
  const [selectedFilter, setSelectedFilter] = useState<'all' | FlawType | 'all_flaws'>('all');
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // State for auto-scroll toggle
  const [autoScroll, setAutoScroll] = useState(true);

  // State for inspected word
  const [inspectedWordId, setInspectedWordId] = useState<string | null>(null);

  // State for hovering tooltip
  const [hoveredWord, setHoveredWord] = useState<TranscriptWord | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // State for copy feedback
  const [copied, setCopied] = useState(false);

  // State for inline transcript editor
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [draftTranscriptText, setDraftTranscriptText] = useState('');

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // User manual scrolling states (prevents fighting user and page locking)
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUserScrolledAway, setIsUserScrolledAway] = useState(false);

  // Translation state (English <-> Hindi)
  const [activeLang, setActiveLang] = useState<'original' | 'hi' | 'en'>('original');
  const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptWord[] | null>(null);
  const [fullSentenceTranslation, setFullSentenceTranslation] = useState<string>('');
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);
  const [wordDisplayMode, setWordDisplayMode] = useState<'original' | 'translated'>('original');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Speech dictation state
  const [isDictating, setIsDictating] = useState(false);

  const handleStartDictation = () => {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type or paste your transcript.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isOriginalHindi ? 'hi-IN' : 'en-IN';

      setIsDictating(true);
      setIsEditingTranscript(true);

      recognition.onresult = (e: any) => {
        let text = '';
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0].transcript + ' ';
        }
        setDraftTranscriptText(text.trim());
      };

      recognition.onerror = () => {
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognition.start();
    } catch {
      setIsDictating(false);
    }
  };

  // Check if original words are Hindi
  const isOriginalHindi = useMemo(() => {
    if (!transcript || transcript.length === 0) return false;
    const text = transcript.map(w => w.word).join(' ');
    return TranslatorService.isHindiText(text);
  }, [transcript]);

  // Reset translation if transcript changes
  useEffect(() => {
    setTranslatedTranscript(null);
    setActiveLang('original');
    setTranslationError(null);
  }, [transcript]);

  // Active displayed words (either translated or original)
  const displayTranscript = useMemo(() => {
    if (activeLang !== 'original' && wordDisplayMode === 'translated' && translatedTranscript && translatedTranscript.length > 0) {
      return translatedTranscript;
    }
    return transcript;
  }, [activeLang, wordDisplayMode, translatedTranscript, transcript]);

  // Calculate current playing word
  const activeWord = useMemo(() => {
    return displayTranscript.find(tw => currentTime >= tw.start && currentTime <= tw.end) || null;
  }, [displayTranscript, currentTime]);

  // Selected word details
  const inspectedWord = useMemo(() => {
    if (inspectedWordId) {
      return displayTranscript.find(w => w.id === inspectedWordId) || null;
    }
    return activeWord;
  }, [inspectedWordId, activeWord, displayTranscript]);

  // Track user manual scrolling in the container so we never lock or hijack their scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleUserScroll = () => {
      isUserScrollingRef.current = true;
      setIsUserScrolledAway(true);

      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      // After 3.5 seconds of idle, auto-sync can gently resume
      userScrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
        setIsUserScrolledAway(false);
      }, 3500);
    };

    container.addEventListener('wheel', handleUserScroll, { passive: true });
    container.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleUserScroll);
      container.removeEventListener('touchmove', handleUserScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll ONLY within container to active word as audio plays (NEVER scrolls the window)
  useEffect(() => {
    if (!autoScroll || isUserScrollingRef.current || !activeWord || !containerRef.current) return;
    const container = containerRef.current;
    const el = wordRefs.current[activeWord.id];
    if (el) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();

      // Check if word is outside visible bounds of container with 35px safety margin
      const isAbove = eRect.top < cRect.top + 35;
      const isBelow = eRect.bottom > cRect.bottom - 35;

      if (isAbove || isBelow) {
        // Scroll ONLY the container div directly! NEVER touch window.scroll!
        const currentScroll = container.scrollTop;
        const targetScroll = currentScroll + (eRect.top - cRect.top) - (cRect.height / 2) + (eRect.height / 2);
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [activeWord, autoScroll]);

  // Auto-scroll when activeFlawId changes from parent Flaw Card click (container-only)
  useEffect(() => {
    if (!activeFlawId || !containerRef.current) return;
    const firstMatchingWord = displayTranscript.find(w => w.flawId === activeFlawId);
    if (firstMatchingWord) {
      setInspectedWordId(firstMatchingWord.id);
      const el = wordRefs.current[firstMatchingWord.id];
      if (el && containerRef.current) {
        const container = containerRef.current;
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        const currentScroll = container.scrollTop;
        const targetScroll = currentScroll + (eRect.top - cRect.top) - (cRect.height / 2) + (eRect.height / 2);
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [activeFlawId, displayTranscript]);

  // Copy transcript text to clipboard
  const handleCopyTranscript = () => {
    const fullText = displayTranscript.map(w => w.word).join(' ');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy translated text
  const handleCopyTranslation = () => {
    if (!fullSentenceTranslation) return;
    navigator.clipboard.writeText(fullSentenceTranslation).then(() => {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    });
  };

  // Speak translated text via TTS
  const handleSpeakTranslation = () => {
    if (!fullSentenceTranslation || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeakingTranslation) {
      window.speechSynthesis.cancel();
      setIsSpeakingTranslation(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullSentenceTranslation);
    utterance.lang = activeLang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeakingTranslation(false);
    utterance.onerror = () => setIsSpeakingTranslation(false);

    setIsSpeakingTranslation(true);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Auto-Translation between English and Hindi
  const handleToggleTranslation = async () => {
    const targetLang: 'hi' | 'en' = isOriginalHindi ? 'en' : 'hi';

    if (activeLang !== 'original') {
      setActiveLang('original');
      setWordDisplayMode('original');
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingTranslation(false);
      return;
    }

    if (fullSentenceTranslation && translatedTranscript && translatedTranscript.length > 0) {
      setActiveLang(targetLang);
      setWordDisplayMode('translated');
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);
    try {
      const result = await TranslatorService.translateTranscriptWords(transcript, targetLang);
      setTranslatedTranscript(result.translatedWords);
      setFullSentenceTranslation(result.fullSentenceTranslation);
      setActiveLang(targetLang);
      setWordDisplayMode('translated');
    } catch (err: any) {
      setTranslationError(err?.message || 'Translation failed. Please check your network connection.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Submit edited transcript
  const handleSaveTranscript = () => {
    if (onUpdateTranscript && draftTranscriptText.trim().length > 0) {
      onUpdateTranscript(draftTranscriptText.trim());
      setIsEditingTranscript(false);
    }
  };

  // Counts for filter pills
  const counts = useMemo(() => {
    const total = displayTranscript.length;
    const fast = displayTranscript.filter(w => w.flawType === 'fast_speech').length;
    const pauses = displayTranscript.filter(w => w.isPauseAdjacent || w.flawType === 'unnatural_pause').length;
    const mumbled = displayTranscript.filter(w => w.flawType === 'mumbling').length;
    const allFlaws = displayTranscript.filter(w => !!w.flawType || w.isPauseAdjacent).length;
    return { total, fast, pauses, mumbled, allFlaws };
  }, [displayTranscript]);

  // Search match ids
  const searchMatchingIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const query = searchQuery.trim().toLowerCase();
    const matched = new Set<string>();
    displayTranscript.forEach(w => {
      if (w.word.toLowerCase().includes(query)) {
        matched.add(w.id);
      }
    });
    return matched;
  }, [searchQuery, displayTranscript]);

  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  // If transcript is empty, show interactive Empty-State with paste action
  if (!transcript || transcript.length === 0) {
    return (
      <div className="card-clay card-clay-violet p-6 rounded-2xl relative overflow-hidden space-y-4">
        <WaterWaveDecoration color="rgba(139, 92, 246, 0.08)" height="h-20" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clay3DIcon name="document" size="xs" withPedestal />
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Transcript Grounding (FR-9)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              Acoustic-only Mode
            </span>
          </div>

        <div className="p-6 rounded-xl bg-slate-50/70 border border-dashed border-slate-300 text-center space-y-3">
          <div className="flex items-center justify-center">
            <Clay3DIcon name="document" size="lg" withPedestal floating />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">No Transcript Available</h4>
            <p className="text-xs text-slate-500 font-medium">
              Audio flaw timestamps are fully grounded acoustics-first. You can paste your speech text below to enable word-by-word visual alignment.
            </p>
          </div>

          {!isEditingTranscript ? (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => {
                  setDraftTranscriptText('');
                  setIsEditingTranscript(true);
                }}
                className="btn-candy-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Paste Speech Transcript</span>
              </button>

              <button
                onClick={handleStartDictation}
                className="btn-candy-secondary px-4 py-2 text-xs inline-flex items-center gap-1.5"
              >
                <Clay3DIcon name="mic" size="xs" />
                <span>{isDictating ? 'Listening...' : 'Dictate / Auto-Transcribe'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-left max-w-lg mx-auto pt-2">
              <textarea
                value={draftTranscriptText}
                onChange={(e) => setDraftTranscriptText(e.target.value)}
                placeholder="Paste or type speech transcript here..."
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingTranscript(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTranscript}
                  disabled={!draftTranscriptText.trim()}
                  className="btn-candy-primary px-4 py-1.5 text-xs disabled:opacity-50"
                >
                  Align & Ground
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-clay card-clay-violet p-4 sm:p-7 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-5 relative overflow-hidden">
      <WaterWaveDecoration color="rgba(139, 92, 246, 0.08)" height="h-28" />

      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Header with Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <Clay3DIcon name="document" size="sm" floating />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight">
                Transcript Grounding
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shadow-clay-pill text-[10px] font-bold uppercase tracking-wider shrink-0">
                FR-9
              </span>
              {activeLang !== 'original' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs shrink-0">
                  <Clay3DIcon name="globe" size="xs" />
                  <span>{activeLang === 'hi' ? 'Hindi Active' : 'English Active'}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Word-level acoustic alignment & temporal flaw mapping
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          {/* Auto Translate Toggle (English <-> Hindi) */}
          {transcript.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleToggleTranslation}
                disabled={isTranslating}
                className={`py-1 px-2.5 sm:px-3 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0 ${
                  activeLang !== 'original'
                    ? 'bg-violet-600 text-white border-violet-600 shadow-glow-violet'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={activeLang !== 'original' ? 'Switch back to original speech' : `Translate speech to ${isOriginalHindi ? 'English' : 'Hindi'}`}
              >
                {isTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Clay3DIcon name="globe" size="xs" />
                )}
                <span className="text-[11px] font-bold">
                  {isTranslating
                    ? 'Translating...'
                    : activeLang !== 'original'
                    ? 'Original'
                    : isOriginalHindi
                    ? 'To English'
                    : 'To हिंदी'}
                </span>
              </button>

              {activeLang !== 'original' && (
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setWordDisplayMode('translated')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      wordDisplayMode === 'translated'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Show translated words in karaoke player"
                  >
                    {activeLang === 'hi' ? 'हिंदी' : 'English'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWordDisplayMode('original')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      wordDisplayMode === 'original'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Show original spoken words in karaoke player"
                  >
                    Original
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`py-1 px-2.5 rounded-xl border transition-all text-xs font-medium flex items-center gap-1 shrink-0 ${
              isSearchOpen || searchQuery ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Search words in transcript"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Search</span>
          </button>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`py-1 px-2.5 rounded-xl border transition-all text-[11px] font-semibold flex items-center gap-1.5 shrink-0 ${
              autoScroll ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title="Automatically scroll to keep playing word centered"
          >
            <Clay3DIcon name="clock" size="xs" />
            <span className="hidden sm:inline">Auto-Scroll:</span>
            <span>{autoScroll ? 'ON' : 'OFF'}</span>
          </button>

          {/* Copy Transcript */}
          <button
            onClick={handleCopyTranscript}
            className="py-1 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all text-xs font-medium flex items-center gap-1 shrink-0"
            title="Copy full transcript to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Copy</span>
              </>
            )}
          </button>

          {/* Edit Transcript */}
          {onUpdateTranscript && (
            <button
              onClick={() => {
                setDraftTranscriptText(transcript.map(w => w.word).join(' '));
                setIsEditingTranscript(true);
              }}
              className="py-1 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all text-xs font-medium flex items-center gap-1 shrink-0"
              title="Edit or paste speech transcript"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Translation Error Notice */}
      {translationError && (
        <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-pink-800 text-xs flex items-center justify-between">
          <span>{translationError}</span>
          <button onClick={() => setTranslationError(null)} className="text-pink-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm animate-pop-in">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a word to highlight in transcript..."
            className="flex-1 bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-violet-500"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[11px] font-semibold text-slate-500 px-1.5">
              {searchMatchingIds.size} found
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            className="p-1 hover:bg-slate-200 rounded-md text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Flaw Highlight Filter Buttons (FR-9.4: Mobile Scroll-Optimized) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs font-semibold no-scrollbar px-1 pr-10 -mx-1">
        <span className="text-[11px] text-slate-400 mr-1 uppercase font-bold shrink-0">
          Highlight:
        </span>

        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-2.5 py-1 rounded-full border transition-all shrink-0 ${
            selectedFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All ({counts.total})
        </button>

        <button
          onClick={() => setSelectedFilter('fast_speech')}
          className={`px-2.5 py-1 rounded-full border transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'fast_speech'
              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
              : 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
          }`}
        >
          <Clay3DIcon name="rocket" size="xs" />
          <span>Fast ({counts.fast})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('unnatural_pause')}
          className={`px-2.5 py-1 rounded-full border transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'unnatural_pause'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <Clay3DIcon name="clock" size="xs" />
          <span>Pauses ({counts.pauses})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('mumbling')}
          className={`px-2.5 py-1 rounded-full border transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'mumbling'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <Clay3DIcon name="mic" size="xs" />
          <span>Muffled ({counts.mumbled})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('all_flaws')}
          className={`px-2.5 py-1 rounded-full border transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'all_flaws'
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
          }`}
        >
          <Clay3DIcon name="warning" size="xs" />
          <span>Flaws Only ({counts.allFlaws})</span>
        </button>
      </div>

      {/* Synchronized Transcript Text Container */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="clay-inset-well p-5 max-h-76 sm:max-h-84 overflow-y-auto leading-loose text-sm select-text relative scroll-smooth focus:outline-none"
          tabIndex={0}
        >
          <div className="flex flex-wrap items-center gap-y-2 gap-x-1.5">
            {displayTranscript.map((tw) => {
              const isCurrentlyPlaying = currentTime >= tw.start && currentTime <= tw.end;
              const isSelected = inspectedWordId === tw.id;
              const isFlawCardActive = activeFlawId && tw.flawId === activeFlawId;
              const isSearchMatched = searchMatchingIds.has(tw.id);

              // Filter check
              let isDimmed = false;
              if (selectedFilter === 'fast_speech' && tw.flawType !== 'fast_speech') isDimmed = true;
              if (selectedFilter === 'unnatural_pause' && !tw.isPauseAdjacent && tw.flawType !== 'unnatural_pause') isDimmed = true;
              if (selectedFilter === 'mumbling' && tw.flawType !== 'mumbling') isDimmed = true;
              if (selectedFilter === 'all_flaws' && !tw.flawType && !tw.isPauseAdjacent) isDimmed = true;

              // Determine flaw visual styling (Refined, elegant pastel accents instead of black boxes!)
              let flawStyle = '';

              if (tw.flawType === 'fast_speech') {
                flawStyle = 'bg-pink-100/80 text-pink-950 border-b-2 border-pink-500 font-bold hover:bg-pink-200/80';
              } else if (tw.flawType === 'unnatural_pause') {
                flawStyle = 'bg-amber-100/80 text-amber-950 border-b-2 border-amber-500 font-bold hover:bg-amber-200/80';
              } else if (tw.flawType === 'mumbling') {
                flawStyle = 'bg-emerald-100/80 text-emerald-950 border-b-2 border-emerald-500 font-bold hover:bg-emerald-200/80';
              }

              return (
                <React.Fragment key={tw.id}>
                  {/* Visual Pause Indicator between words (FR-9.1 requirement) */}
                  {tw.isPauseAdjacent && tw.pauseDuration && tw.pauseDuration > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const seekTo = tw.pauseStart ?? Math.max(0, tw.start - tw.pauseDuration!);
                        onSeek(seekTo);
                      }}
                      title={`Unnatural Pause: ${tw.pauseDuration}s dead air between words. Click to listen.`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 my-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] shadow-sm hover:bg-amber-200 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>⏸️</span>
                      <span>{tw.pauseDuration}s pause</span>
                    </button>
                  )}

                  {/* Individual Word Chip */}
                  <span
                    ref={(el) => { wordRefs.current[tw.id] = el; }}
                    onClick={() => {
                      setInspectedWordId(tw.id);
                      onSeek(tw.start);
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoverPosition({ x: rect.left, y: rect.top - 8 });
                      setHoveredWord(tw);
                    }}
                    onMouseLeave={() => {
                      setHoveredWord(null);
                    }}
                    className={`relative cursor-pointer px-2 py-0.5 rounded-lg transition-all duration-150 text-xs sm:text-sm inline-block select-none ${
                      isCurrentlyPlaying
                        ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-black shadow-glow-violet scale-110 z-20 ring-2 ring-violet-300'
                        : isFlawCardActive
                        ? 'bg-violet-100 text-violet-900 font-bold ring-2 ring-violet-500 z-10'
                        : isSelected
                        ? 'bg-slate-200 text-slate-900 font-bold ring-1 ring-slate-400'
                        : isSearchMatched
                        ? 'bg-amber-200 text-amber-950 font-bold ring-1 ring-amber-400'
                        : tw.flawType
                        ? flawStyle
                        : 'text-slate-800 font-normal hover:bg-slate-200/60'
                    } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                  >
                    {tw.word}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Floating "Resume Auto-Sync" pill when user is reading / scrolling independently */}
        {isUserScrolledAway && autoScroll && activeWord && (
          <button
            type="button"
            onClick={() => {
              isUserScrollingRef.current = false;
              setIsUserScrolledAway(false);
              if (containerRef.current && wordRefs.current[activeWord.id]) {
                const container = containerRef.current;
                const el = wordRefs.current[activeWord.id]!;
                const cRect = container.getBoundingClientRect();
                const eRect = el.getBoundingClientRect();
                container.scrollTo({
                  top: container.scrollTop + (eRect.top - cRect.top) - (cRect.height / 2),
                  behavior: 'smooth'
                });
              }
            }}
            className="absolute bottom-3 right-4 z-20 px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-clay-card flex items-center gap-1.5 animate-pop-in transition-all active:scale-95"
          >
            <Clay3DIcon name="target" size="xs" />
            <span>Resume Auto-Sync</span>
          </button>
        )}
      </div>

      {/* Neural Translation Card (Bilingual Grounding) */}
      {activeLang !== 'original' && fullSentenceTranslation && (
        <div className="card-clay p-6 rounded-3xl border border-violet-200/90 bg-gradient-to-br from-violet-50/95 via-purple-50/80 to-indigo-50/90 space-y-4 animate-pop-in">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200/60 pb-3">
            <div className="flex items-center gap-3">
              <Clay3DIcon name="globe" size="sm" withPedestal floating />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-violet-950 font-heading flex items-center gap-2">
                  <span>{activeLang === 'hi' ? 'संपूर्ण हिंदी अनुवाद (Natural Hindi Translation)' : 'English Speech Translation'}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white shadow-sugary-violet text-[10px] font-mono font-bold">
                    Neural AI
                  </span>
                </h4>
                <p className="text-[10px] text-violet-700/80 font-medium">
                  {activeLang === 'hi' 
                    ? 'प्राकृतिक हिंदी वाक्य रचना • वाक् प्रवाह और समय सीमा के साथ समन्वयित'
                    : 'Natural English syntax • Synchronized with audio cadence'}
                </p>
              </div>
            </div>

            {/* Quick Action Controls: TTS Listen, Copy, Word Chip Mode */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Chip Mode Switcher */}
              <div className="inline-flex p-0.5 rounded-lg bg-white/90 border border-violet-200 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setWordDisplayMode('translated')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    wordDisplayMode === 'translated'
                      ? 'bg-violet-600 text-white font-bold shadow-xs'
                      : 'text-violet-700 hover:text-violet-900'
                  }`}
                  title="Show translated Hindi words in the karaoke player above"
                >
                  {activeLang === 'hi' ? '🇮🇳 हिंदी Chips' : '🇺🇸 English Chips'}
                </button>
                <button
                  type="button"
                  onClick={() => setWordDisplayMode('original')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    wordDisplayMode === 'original'
                      ? 'bg-violet-600 text-white font-bold shadow-xs'
                      : 'text-violet-700 hover:text-violet-900'
                  }`}
                  title="Show original spoken words in the karaoke player above"
                >
                  🔤 Original Chips
                </button>
              </div>

              {/* Speak / TTS Button */}
              <button
                type="button"
                onClick={handleSpeakTranslation}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSpeakingTranslation
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm animate-pulse'
                    : 'bg-white hover:bg-violet-100/70 border-violet-200 text-violet-800'
                }`}
                title="Listen to full translated speech using browser native voice"
              >
                <Clay3DIcon name="speaker" size="xs" />
                <span>{isSpeakingTranslation ? 'Stop Voice' : 'Listen (सुनें)'}</span>
              </button>

              {/* Copy Translation Button */}
              <button
                type="button"
                onClick={handleCopyTranslation}
                className="px-2.5 py-1 rounded-lg border border-violet-200 bg-white hover:bg-violet-100/70 text-violet-800 text-xs font-semibold flex items-center gap-1 transition-all"
                title="Copy translated text to clipboard"
              >
                {copiedTranslation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-violet-600" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Full Sentence Translated Text */}
          <div className="p-3.5 rounded-lg bg-white/90 border border-violet-100 shadow-2xs">
            <p className="text-sm sm:text-base font-normal text-slate-900 leading-relaxed tracking-normal select-text font-sans">
              {fullSentenceTranslation}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-violet-700/80 font-medium pt-0.5">
            <span>
              💡 <strong>Karaoke Grounding:</strong> Click any word in the box above to seek audio and inspect delivery flaws.
            </span>
            <span>
              {fullSentenceTranslation.split(/\s+/).filter(Boolean).length} translated words
            </span>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip (FR-9.3) */}
      {hoveredWord && hoverPosition && (hoveredWord.flawType || hoveredWord.isPauseAdjacent) && (
        <div 
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl max-w-xs text-xs animate-pop-in space-y-1"
          style={{ left: hoverPosition.x + 30, top: hoverPosition.y }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1">
            <span className="font-bold text-amber-300 capitalize flex items-center gap-1.5">
              <Clay3DIcon name="warning" size="xs" />
              {hoveredWord.flawType?.replace('_', ' ') || 'Unnatural Pause'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {formatSec(hoveredWord.start)}
            </span>
          </div>
          {hoveredWord.measuredMetric && (
            <div className="text-[11px] font-semibold text-emerald-300">
              Measurement: {hoveredWord.measuredMetric}
            </div>
          )}
          {hoveredWord.flawExplanation && (
            <p className="text-[10px] text-slate-300 leading-tight">
              {hoveredWord.flawExplanation}
            </p>
          )}
          <div className="text-[9px] text-violet-300 font-medium pt-0.5">
            Click word to seek audio
          </div>
        </div>
      )}

      {/* Word Inspector Card */}
      {inspectedWord && (
        <div className="card-clay p-5 rounded-3xl border border-white/80 space-y-3.5 animate-pop-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-slate-900 font-heading">
                "{inspectedWord.word}"
              </span>
              {inspectedWord.originalWord && inspectedWord.word !== inspectedWord.originalWord && (
                <span className="text-xs text-slate-500 font-normal">
                  (Original: <span className="font-semibold text-slate-700">"{inspectedWord.originalWord}"</span>)
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium shadow-clay-pill">
                {formatSec(inspectedWord.start)} – {formatSec(inspectedWord.end)} ({Math.round((inspectedWord.end - inspectedWord.start) * 10) / 10}s)
              </span>
            </div>

            {/* Play Word / Play Surrounding Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSeek(inspectedWord.start)}
                className="btn-clay-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                title="Seek audio to this exact word"
              >
                <Clay3DIcon name="play" size="xs" />
                <span>Play Word</span>
              </button>

              <button
                onClick={() => {
                  const phraseStart = Math.max(0, inspectedWord.start - 1.5);
                  onSeek(phraseStart);
                }}
                className="btn-candy-secondary px-3 py-1 text-xs flex items-center gap-1.5"
                title="Play 1.5 seconds before this word for context"
              >
                <CornerDownRight className="w-3 h-3" />
                <span>Play Phrase</span>
              </button>

              {inspectedWordId && (
                <button
                  onClick={() => setInspectedWordId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  title="Close word inspection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Diagnosis & Causal Grounding Details */}
          {inspectedWord.flawType ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Grounded Delivery Flaw
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  {inspectedWord.flawType === 'fast_speech' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700">
                      <Clay3DIcon name="rocket" size="xs" />
                      Fast Cadence
                    </span>
                  )}
                  {inspectedWord.flawType === 'unnatural_pause' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                      <Clay3DIcon name="clock" size="xs" />
                      Unnatural Silence
                    </span>
                  )}
                  {inspectedWord.flawType === 'mumbling' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <Clay3DIcon name="mic" size="xs" />
                      Muffled Articulation
                    </span>
                  )}
                  {inspectedWord.severity && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-slate-900 text-white font-bold">
                      {inspectedWord.severity}
                    </span>
                  )}
                </div>
                {inspectedWord.measuredMetric && (
                  <div className="text-[11px] font-mono text-slate-600 font-semibold pt-1">
                    Value: <span className="font-bold text-slate-900">{inspectedWord.measuredMetric}</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-8 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Acoustic Reason & Diagnosis
                </span>
                <p className="text-slate-700 font-normal text-xs leading-relaxed">
                  {inspectedWord.flawExplanation || 'Acoustic parameters in this time slice diverged significantly from optimal competition baseline.'}
                </p>

                {inspectedWord.flawId && onPlaySegment && (
                  <div className="pt-1">
                    {(() => {
                      const matchedFlaw = flaws.find(f => f.id === inspectedWord.flawId);
                      if (matchedFlaw) {
                        return (
                          <button
                            onClick={() => onPlaySegment(matchedFlaw.start, matchedFlaw.end, matchedFlaw.id)}
                            className="text-[11px] font-bold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                          >
                            <span>Jump to full {matchedFlaw.type.replace('_', ' ')} region ({matchedFlaw.start.toFixed(1)}s – {matchedFlaw.end.toFixed(1)}s)</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Optimal cadence: Word conforms to adjudicator baseline pacing and articulation norms.</span>
            </div>
          )}
        </div>
      )}

      {/* Transcript Legend & Quick Instruction */}
      <div className="flex flex-wrap items-center justify-between text-xs font-medium text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span>Fast Speech (180+ WPM)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Silence Gap (&gt;0.7s)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low Clarity / Mumble</span>
          </span>
        </div>

        <span className="text-slate-400 text-[11px]">
          Click any word to seek audio
        </span>
      </div>

      {/* Edit / Paste Transcript Modal */}
      {isEditingTranscript && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl max-w-lg w-full space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  Edit Speech Transcript
                </h4>
              </div>
              <button
                onClick={() => setIsEditingTranscript(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Update the speech transcript text. The system will re-align all words against acoustic timestamps and pause intervals.
            </p>

            <textarea
              value={draftTranscriptText}
              onChange={(e) => setDraftTranscriptText(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 leading-relaxed text-slate-800"
              placeholder="Paste full speech transcript here..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingTranscript(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTranscript}
                disabled={!draftTranscriptText.trim()}
                className="btn-candy-primary px-5 py-2 text-xs disabled:opacity-50"
              >
                Re-Align & Ground
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

    </div>
  );
};
