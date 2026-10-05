import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, RotateCcw, 
  CornerDownRight, Clock, X, Sparkles, Send, Copy, Check
} from 'lucide-react';
import type { AnalysisResult, QnAMessage } from '../types/speech';
import { HelpAssistantService } from '../services/helpAssistant';
import { speechRecInstance } from '../services/speechRecognition';
import { Clay3DIcon } from './Clay3DIcon';
import { WaterWaveDecoration } from './WaterWaveDecoration';
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
  const [isResponding, setIsResponding] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<'hi' | 'hinglish' | 'en'>('en');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isVoiceSupported = speechRecInstance.isSupported();

  // Listen for global open event (e.g. from Header or other buttons)
  useEffect(() => {
    const handleOpen = () => setIsChatOpen(true);
    window.addEventListener('open-speech-assistant', handleOpen);
    return () => window.removeEventListener('open-speech-assistant', handleOpen);
  }, []);

  // Prevent background page scrolling when full-screen chatbot is open
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
      : `Hello! I am your **VoxPulse AI Speech Assistant** 🎙️\n\n` +
        `I specialize in oratorical cadence, pitch modulation, eliminating fillers/pauses, and national competition speech benchmarks.\n\n` +
        `• Ask me how to eliminate unnatural pauses or hesitations.\n` +
        `• Ask how to control fast speech and maintain an optimal 125-140 WPM pace.\n` +
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

  // Escape key to close full-screen chatbot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  // Compute dynamic suggested question chips based on actual data
  const dynamicSuggestedChips = useMemo(() => {
    if (result) {
      return HelpAssistantService.getDynamicSuggestedQuestions(result);
    }
    return [
      { label: 'Meri speech me kya galtiyan hain?', category: 'mistakes' },
      { label: 'Fast speech kaise theek karein?', category: 'fast_speech' },
      { label: 'Unnatural pauses kaise hatayein?', category: 'pauses' },
      { label: '5-minute vocal warmup drill batao', category: 'drills' },
      { label: 'Ideal competition speech cadence kya hai?', category: 'baseline' }
    ];
  }, [result]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Stop ongoing speech synthesis if any
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

    if (msgLang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

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
              className={`flex items-start gap-1.5 ${isBullet ? 'pl-2 text-slate-700' : isNumbered ? 'pl-3 font-normal' : ''}`}
            >
              {isBullet && <span className="text-violet-600 font-bold shrink-0">•</span>}
              {isNumbered && <span className="font-bold text-slate-800 shrink-0">{trimmed.match(/^[0-9]+\./)?.[0]}</span>}
              
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
      {/* 1. FLOATING LAUNCHER BUTTON (Bottom Right - PURE ICON ONLY)     */}
      {/* ============================================================== */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white shadow-sugary-violet hover:shadow-glow-violet hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/80 flex items-center justify-center cursor-pointer select-none group"
          title="Ask for Help: Speech Assistant (Click to open full-screen chatbot)"
          aria-label="Open Speech Assistant Chatbot"
        >
          {/* Subtle top glossy highlight */}
          <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-full pointer-events-none" />
          
          <div className="relative flex items-center justify-center">
            <Clay3DIcon name="robot" size="sm" floating />
            {/* Live Green Online Beacon */}
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs"></span>
            </span>
          </div>
        </button>
      )}

      {/* ============================================================== */}
      {/* 2. FULL-SCREEN CHATBOT APPLICATION INTERFACE                   */}
      {/* ============================================================== */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/20 backdrop-blur-2xl animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="VoxPulse Speech Assistant Chatbot"
        >
          {/* Fluid water wave ripple at bottom */}
          <WaterWaveDecoration color="rgba(139, 92, 246, 0.06)" height="h-28" />

          {/* Fullscreen Chatbot Top Header */}
          <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center p-2 shadow-sugary-violet relative">
                <Clay3DIcon name="robot" size="xs" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    VoxPulse Speech Assistant
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold uppercase tracking-wider">
                    AI Chatbot
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>{detectedLanguage === 'hi' ? '🇮🇳 हिंदी में बातचीत' : detectedLanguage === 'hinglish' ? '🇮🇳 Hinglish Mode Active' : '🌐 English & Multilingual'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Online
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleResetChat}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-xs"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 sm:px-4 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-sugary-violet hover:scale-105 active:scale-95 cursor-pointer"
                title="Close chatbot (Esc)"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </header>

          {/* Quick Inquiry Chips Strip */}
          <div className="relative z-10 w-full bg-slate-100/70 border-b border-slate-200/60 px-4 sm:px-8 py-2.5 overflow-x-auto no-scrollbar shrink-0">
            <div className="max-w-4xl mx-auto w-full flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Inquiries:
              </span>
              {dynamicSuggestedChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.label)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 shadow-xs hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 shrink-0 whitespace-nowrap transition-all flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                  <CornerDownRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Messages Stream (Centered Readable Column) */}
          <div className="relative z-10 flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
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
                      <div className="shrink-0 mt-1">
                        <Clay3DIcon name="robot" size="xs" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white rounded-tr-xs shadow-sugary-violet'
                          : 'card-clay card-clay-violet border border-violet-200/60 text-slate-900 rounded-tl-xs'
                      }`}
                    >
                      {/* Message Content */}
                      {isUser ? (
                        <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      ) : (
                        renderFormattedMessage(msg.text)
                      )}

                      {/* Assistant Actions Bar: Copy, Voice Readout, Seek button */}
                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-xs"
                              title="Copy answer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* Voice TTS Button */}
                            <button
                              onClick={() => toggleTextToSpeech(msg)}
                              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-xs ${
                                isSpeaking
                                  ? 'bg-violet-600 text-white border-violet-600 animate-pulse'
                                  : 'bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80'
                              }`}
                              title={isSpeaking ? 'Stop speaking' : 'Listen with voice readout'}
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-3 h-3" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-violet-600" />
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
                              className="px-3 py-1 rounded-lg bg-violet-50 text-violet-800 hover:bg-violet-100 border border-violet-200/80 transition-colors text-[11px] font-bold flex items-center gap-1 shadow-xs ml-auto"
                              title="Seek audio player to flaw region"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Seek Audio to {HelpAssistantService.formatTime(msg.suggestedAction.time!)}</span>
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
                <div className="flex items-center gap-2.5 text-xs text-slate-500 italic pl-10 animate-pulse">
                  <Clay3DIcon name="robot" size="xs" />
                  <span>Speech Assistant is thinking in your language...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Voice Error notice if any */}
          {voiceError && (
            <div className="relative z-10 max-w-3xl mx-auto w-full text-[11px] text-pink-800 bg-pink-50 border border-pink-200 px-4 py-2 rounded-xl mb-2 font-medium flex items-center justify-between">
              <span>{voiceError}</span>
              <button onClick={() => setVoiceError(null)} className="underline ml-2 font-bold">Dismiss</button>
            </div>
          )}

          {/* Bottom Prompt Input Bar (Centered Modern Bar) */}
          <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shrink-0 shadow-lg">
            <div className="max-w-3xl mx-auto space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isListening
                        ? '🎙️ Listening... (Speak in Hindi or English)'
                        : 'Poochiye (Ask about pauses, pacing, pitch, or public speaking in Hindi, Hinglish, or English)...'
                    }
                    className={`w-full py-3 sm:py-3.5 pl-4 pr-12 text-xs sm:text-sm font-medium rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 transition-all ${
                      isListening ? 'border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20' : ''
                    }`}
                  />

                  {/* Voice Microphone */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                          : 'text-slate-400 hover:text-violet-600 hover:bg-slate-200/70'
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
                  className="p-3 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-sugary-violet disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2"
                  title="Send query"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                <span>Speaks Hindi, Hinglish & English • Acoustic contrastive DSP intelligence</span>
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Esc</kbd> to close</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};
