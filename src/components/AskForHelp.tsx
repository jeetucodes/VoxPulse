import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, RotateCcw, 
  Clock, X, Sparkles, Send, Copy, Check, Maximize2, Minimize2,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import type { AnalysisResult, QnAMessage } from '../types/speech';
import { HelpAssistantService } from '../services/helpAssistant';
import { speechRecInstance } from '../services/speechRecognition';
import { Clay3DIcon } from './Clay3DIcon';
import { SAMPLE_SPEECHES } from '../services/sampleData';

interface AskForHelpProps {
  result?: AnalysisResult | null;
  onSeek?: (time: number) => void;
}

export const AskForHelp: React.FC<AskForHelpProps> = ({ result, onSeek }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<QnAMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<'hi' | 'hinglish' | 'en'>('en');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isVoiceSupported = speechRecInstance.isSupported();

  // Listen for global open event (e.g. from Header or other buttons)
  useEffect(() => {
    const handleOpen = () => {
      setIsChatOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };
    window.addEventListener('open-speech-assistant', handleOpen);
    return () => window.removeEventListener('open-speech-assistant', handleOpen);
  }, []);

  // Prevent background scrolling when open on mobile
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isChatOpen]);

  // Initialize welcome message whenever result changes
  useEffect(() => {
    const primaryFlaw = result?.flaws?.[0];
    const lowestMetric = result ? Object.entries(result.breakdown).sort((a, b) => a[1] - b[1])[0] : null;

    const initialText = result
      ? (primaryFlaw
          ? `Hello! I analyzed your speech audio against competition standards.\n\n` +
            `• **Overall Score**: **${result.overall_score}/100**\n` +
            `• **Lowest Area**: **${lowestMetric ? lowestMetric[0].toUpperCase() : 'Pacing'}** (${lowestMetric ? lowestMetric[1] : 60}/100)\n` +
            `• **Primary Detected Flaw**: **${primaryFlaw.type.replace('_', ' ').toUpperCase()}** at **${HelpAssistantService.formatTime(primaryFlaw.start)}** (${primaryFlaw.measuredValue || primaryFlaw.severity})\n\n` +
            `Ask me anything in **Hindi (हिंदी), Hinglish, or English**! I will reply in the exact same language you talk in.`
          : `Hello! I analyzed your speech audio against competition standards. Your delivery scored an impressive **${result.overall_score}/100** with no critical flaws detected! Ask me anything in **Hindi, Hinglish, or English** about your acoustic cadence or pre-competition drills.`)
      : `Hello! I am your **VoxPulse AI Speech Coach** 🎙️\n\n` +
        `I specialize in oratorical cadence, pitch modulation, eliminating fillers/pauses, and national competition speech benchmarks.\n\n` +
        `• Ask how to eliminate awkward pauses or hesitations.\n` +
        `• Ask how to control fast speech and keep an optimal 125-140 WPM pace.\n` +
        `• Ask for a 5-minute pre-competition vocal warmup drill.\n\n` +
        `Aap mujhse **Hindi (हिंदी), Hinglish ya English** kisi bhi bhasha me pooch sakte hain!`;

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: initialText,
        timestamp: new Date(),
        suggestedAction: (primaryFlaw && onSeek) ? {
          type: 'seek',
          time: primaryFlaw.start,
          flawId: primaryFlaw.id
        } : undefined
      }
    ]);
  }, [result, onSeek]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  // Dynamic suggested question chips
  const dynamicSuggestedChips = useMemo(() => {
    if (result) {
      return HelpAssistantService.getDynamicSuggestedQuestions(result);
    }
    return [
      { label: 'Meri speech me kya galtiyan hain?', category: 'mistakes' },
      { label: 'Fast speech kaise theek karein?', category: 'fast_speech' },
      { label: 'Unnatural pauses kaise hatayein?', category: 'pauses' },
      { label: '5-minute vocal warmup drill batao', category: 'drills' },
      { label: 'Ideal competition cadence kya hai?', category: 'baseline' }
    ];
  }, [result]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const lang = HelpAssistantService.detectLanguage(query);
    setDetectedLanguage(lang);

    const userMsg: QnAMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setInputText('');
    setMessages(prev => [...prev, userMsg]);
    setIsResponding(true);

    if (!isChatOpen) {
      setIsChatOpen(true);
    }

    try {
      const activeResult = result || SAMPLE_SPEECHES[0].precomputedResult;
      const assistantMsg = await HelpAssistantService.generateAnswerAsync(query, activeResult);
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: lang === 'hi' 
            ? 'Maaf kijiye, javab process karne me takleef hui. Kripya punah prayas karein.'
            : lang === 'hinglish'
            ? 'Sorry, jawab prepare karne me issue aaya. Please ek baar dobara pooch lijiye.'
            : 'Sorry, I encountered an issue preparing your guidance. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleChipClick = (chipLabel: string) => {
    handleSendMessage(chipLabel);
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      speechRecInstance.stopListening();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const langCode = detectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    speechRecInstance.startListening(
      (text: string) => {
        setInputText(prev => (prev ? `${prev} ${text}` : text));
        const detected = HelpAssistantService.detectLanguage(text);
        setDetectedLanguage(detected);
      },
      (err: string) => {
        setVoiceError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      langCode
    );

    setIsListening(true);
  };

  const toggleTextToSpeech = (msg: QnAMessage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (speakingMessageId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = msg.text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\[.*?\]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const msgLang = HelpAssistantService.detectLanguage(msg.text);

    utterance.lang = msgLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);

    const primaryFlaw = result?.flaws?.[0];
    const lowestMetric = result ? Object.entries(result.breakdown).sort((a, b) => a[1] - b[1])[0] : null;

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: result
          ? (primaryFlaw
              ? `Conversation reset! Ready for your inquiries.\n\n` +
                `• **Score**: **${result.overall_score}/100**\n` +
                `• **Lowest Area**: **${lowestMetric ? lowestMetric[0].toUpperCase() : 'Pacing'}**\n` +
                `• **Primary Flaw**: **${primaryFlaw.type.replace('_', ' ').toUpperCase()}** (${primaryFlaw.measuredValue || primaryFlaw.severity})\n\n` +
                `Ask in **Hindi (हिंदी), Hinglish, or English**!`
              : `Conversation reset! Your speech scored **${result.overall_score}/100** with no critical flaws. Ask anything about competitive delivery or vocal pacing!`)
          : `Conversation reset! I am ready to answer your speech questions in **Hindi (हिंदी), Hinglish, or English**!`,
        timestamp: new Date()
      }
    ]);
  };

  const renderFormattedMessage = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lIdx} className="h-1.5" />;
          }

          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
          const isNumbered = /^[0-9]+\.\s/.test(trimmed);

          const content = isBullet ? trimmed.replace(/^[•-]\s*/, '') : isNumbered ? trimmed.replace(/^[0-9]+\.\s*/, '') : trimmed;
          const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);

          return (
            <div 
              key={lIdx} 
              className={`flex items-start gap-1.5 ${isBullet ? 'pl-2 text-slate-700' : isNumbered ? 'pl-2 text-slate-800' : ''}`}
            >
              {isBullet && <span className="text-violet-600 font-bold shrink-0 mt-0.5">•</span>}
              {isNumbered && <span className="font-bold text-slate-800 shrink-0 text-xs">{trimmed.match(/^[0-9]+\./)?.[0]}</span>}
              
              <p className="flex-1">
                {parts.map((p, pIdx) => {
                  if (p.startsWith('**') && p.endsWith('**')) {
                    return <strong key={pIdx} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>;
                  }
                  if (p.startsWith('*') && p.endsWith('*')) {
                    return <em key={pIdx} className="text-slate-800 font-semibold italic bg-amber-50 px-1 rounded">{p.slice(1, -1)}</em>;
                  }
                  return p;
                })}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (Bottom Right - Mobile Friendly)    */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (Prominent & Modern AI Coach Pill)  */}
      {/* ============================================================== */}
      {!isChatOpen && (
        <button
          onClick={() => {
            setIsChatOpen(true);
            setTimeout(() => inputRef.current?.focus(), 150);
          }}
          className="fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-40 p-2 sm:px-5 sm:py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-violet-500/35 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/90 flex items-center gap-3 cursor-pointer select-none group"
          title="Ask Speech Coach AI"
          aria-label="Open Speech Coach Chatbot"
        >
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-xs shrink-0">
            <Clay3DIcon name="robot" size="sm" floating />
            {/* Live Green Online Beacon */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div className="text-left hidden xs:block pr-1">
            <div className="flex items-center gap-1.5">
              <span className="block text-xs sm:text-sm font-black tracking-tight leading-tight font-heading">
                Speech Coach AI
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                Live
              </span>
            </div>
            <span className="block text-[11px] text-violet-100 font-medium">
              Ask about your score & drills
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider border border-white/30 group-hover:bg-white group-hover:text-violet-700 transition-colors">
            Ask AI
          </span>
        </button>
      )}

      {/* ============================================================== */}
      {/* 2. CHATBOT WINDOW (Full-screen Mobile + Expanded Desktop Modal) */}
      {/* ============================================================== */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs animate-fade-in p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="VoxPulse Speech Assistant Chatbot"
        >
          {/* Chat Window Container: Full screen on mobile, Spacious on Desktop */}
          <div 
            className={`w-full flex flex-col bg-white shadow-2xl transition-all duration-300 overflow-hidden ${
              isFullScreen
                ? 'fixed inset-0 h-[100dvh] rounded-none'
                : 'h-[100dvh] sm:h-[88vh] sm:max-h-[820px] sm:max-w-3xl lg:max-w-4xl sm:rounded-3xl sm:border sm:border-slate-200/90'
            }`}
          >
            {/* Header */}
            <header className="w-full border-b border-slate-200/90 bg-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="sm:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                  title="Close chat"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 border border-violet-200 flex items-center justify-center p-1 shrink-0 relative shadow-xs">
                  <Clay3DIcon name="robot" size="sm" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">
                      Speech Coach AI
                    </h2>
                    <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200 uppercase tracking-wider">
                      Bilingual
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{detectedLanguage === 'hi' ? 'हिंदी में सक्रिय (Bilingual Active)' : detectedLanguage === 'hinglish' ? 'Hinglish & English Active' : 'English & Hindi Active'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={handleResetChat}
                  className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200/80"
                  title="New Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>

                {/* Desktop Fullscreen toggle */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
                  title={isFullScreen ? 'Minimize window' : 'Full-screen'}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200/80"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Quick Inquiry Chips Strip (Touch-scrollable on mobile) */}
            <div className="w-full bg-slate-50/80 border-b border-slate-200/80 px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick:
                </span>
                {dynamicSuggestedChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip.label)}
                    className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-2xs hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 shrink-0 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{chip.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-5 space-y-4 bg-slate-50/70">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSpeaking = speakingMessageId === msg.id;
                const isCopied = copiedMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Clay3DIcon name="robot" size="xs" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[84%] rounded-2xl p-4 sm:p-5 text-sm sm:text-[15px] shadow-xs transition-all leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs shadow-md font-medium'
                          : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs shadow-sm'
                      }`}
                    >
                      {/* Message Content */}
                      {isUser ? (
                        <p className="font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      ) : (
                        renderFormattedMessage(msg.text)
                      )}

                      {/* Assistant Actions Bar: Copy, Voice Readout, Seek button */}
                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copy answer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* Voice TTS Button */}
                            <button
                              onClick={() => toggleTextToSpeech(msg)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                                isSpeaking
                                  ? 'bg-violet-600 text-white border-violet-600 animate-pulse'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                              title={isSpeaking ? 'Stop speaking' : 'Listen with voice readout'}
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-violet-600" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Jump to flaw in audio timeline */}
                          {msg.suggestedAction && msg.suggestedAction.type === 'seek' && msg.suggestedAction.time !== undefined && onSeek && (
                            <button
                              onClick={() => {
                                onSeek(msg.suggestedAction!.time!);
                                setIsChatOpen(false);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 hover:bg-violet-100 border border-violet-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Jump to flaw in audio player"
                            >
                              <Clock className="w-3.5 h-3.5 text-violet-600" />
                              <span>Jump to {HelpAssistantService.formatTime(msg.suggestedAction.time!)}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Responding animation indicator */}
              {isResponding && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-10">
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse delay-75"></span>
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse delay-150"></span>
                  <span className="ml-1 text-xs">Coach is preparing guidance...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Error notice if any */}
            {voiceError && (
              <div className="text-xs text-rose-800 bg-rose-50 border-t border-rose-200 px-4 py-2 font-medium flex items-center justify-between shrink-0">
                <span>{voiceError}</span>
                <button onClick={() => setVoiceError(null)} className="underline ml-2 font-bold cursor-pointer">Dismiss</button>
              </div>
            )}

            {/* Bottom Prompt Input Bar (Mobile-safe with keyboard padding) */}
            <footer className="w-full border-t border-slate-200/90 bg-white px-4 sm:px-6 py-3.5 sm:py-4 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isListening
                        ? '🎙️ Listening... (Speak in Hindi or English)'
                        : 'Ask about pauses, pacing, or drills...'
                    }
                    className={`w-full py-3 sm:py-3.5 pl-4 sm:pl-5 pr-12 text-sm sm:text-base font-medium rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      isListening ? 'border-rose-400 bg-rose-50/30' : ''
                    }`}
                  />

                  {/* Voice Microphone */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-violet-600 hover:bg-slate-200/60'
                      }`}
                      title={isListening ? 'Stop voice listening' : 'Voice input in Hindi or English'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-11 sm:h-12 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  title="Send message"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="hidden sm:flex items-center justify-between text-xs text-slate-400 font-medium px-1 pt-2">
                <span>Hindi, Hinglish & English Supported</span>
                <span>Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[10px]">Esc</kbd> to exit</span>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};
