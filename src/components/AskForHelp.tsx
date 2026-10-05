import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, RotateCcw, 
  CornerDownRight, Clock, X, Minus, Sparkles, Send, MessageSquare
} from 'lucide-react';
import type { AnalysisResult, QnAMessage } from '../types/speech';
import { HelpAssistantService } from '../services/helpAssistant';
import { speechRecInstance } from '../services/speechRecognition';
import { Clay3DIcon } from './Clay3DIcon';

interface AskForHelpProps {
  result: AnalysisResult;
  onSeek: (time: number) => void;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isVoiceSupported = speechRecInstance.isSupported();

  // Initialize welcome message whenever result changes
  useEffect(() => {
    const primaryFlaw = result.flaws[0];
    const lowestMetric = Object.entries(result.breakdown).sort((a, b) => a[1] - b[1])[0];

    const initialText = primaryFlaw
      ? `Hello! I analyzed your speech audio against competition standards.\n\n` +
        `• **Overall Score**: **${result.overall_score}/100**\n` +
        `• **Lowest Area**: **${lowestMetric ? lowestMetric[0].toUpperCase() : 'Pacing'}** (${lowestMetric ? lowestMetric[1] : 60}/100)\n` +
        `• **Primary Detected Flaw**: **${primaryFlaw.type.replace('_', ' ').toUpperCase()}** at **${HelpAssistantService.formatTime(primaryFlaw.start)}** (${primaryFlaw.measuredValue || primaryFlaw.severity})\n\n` +
        `Ask me anything in **Hindi, Hinglish, or English**! I will reply in the same language you talk in.`
      : `Hello! I analyzed your speech audio against competition standards. Your delivery scored an impressive **${result.overall_score}/100** with no critical flaws detected! Ask me anything in **Hindi, Hinglish, or English** about your acoustic cadence or pre-competition drills.`;

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: initialText,
        timestamp: new Date(),
        suggestedAction: primaryFlaw ? {
          type: 'seek',
          time: primaryFlaw.start,
          flawId: primaryFlaw.id
        } : undefined
      }
    ]);
  }, [result]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Escape key to close floating chatbot
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
    return HelpAssistantService.getDynamicSuggestedQuestions(result);
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

    // Auto-open chatbot if closed
    if (!isChatOpen) {
      setIsChatOpen(true);
    }

    try {
      const assistantMsg = await HelpAssistantService.generateAnswerAsync(query, result);
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const fallback = HelpAssistantService.generateAnswer(query, result);
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  const toggleVoiceRecording = () => {
    setVoiceError(null);

    if (isListening) {
      speechRecInstance.stopListening();
      setIsListening(false);
      return;
    }

    const started = speechRecInstance.startListening(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      (errorMsg) => {
        setVoiceError(errorMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      'en-IN' // Accurately captures both Indian English and Hindi words
    );

    if (started) {
      setIsListening(true);
    }
  };

  const handleToggleReadAloud = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for natural TTS speech
    const cleanText = text
      .replace(/[*_#•|`]/g, '')
      .replace(/-+/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const lang = HelpAssistantService.detectLanguage(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    const primaryFlaw = result.flaws[0];
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. I am ready to answer your questions in Hindi, Hinglish, or English. Ask about your flaws, pacing, or score below!`,
        timestamp: new Date(),
        suggestedAction: primaryFlaw ? {
          type: 'seek',
          time: primaryFlaw.start,
          flawId: primaryFlaw.id
        } : undefined
      }
    ]);
  };

  // Helper to render markdown-like formatting
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={lIdx} className="h-1" />;
          }

          // Table row detector
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
            const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
            if (isSeparator) return null;

            return (
              <div key={lIdx} className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100 text-[11px] font-medium text-slate-700">
                {cells.map((cell, cIdx) => (
                  <span key={cIdx} className={cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-600'}>
                    {cell.replace(/\*\*/g, '')}
                  </span>
                ))}
              </div>
            );
          }

          // Bullet point
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
          // Numbered item
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
      {/* 1. INLINE PAGE BANNER CARD (Mounted at section-coach) */}
      <div className="card-clay p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/80 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <Clay3DIcon name="robot" size="sm" withPedestal floating />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                  Ask for Help: Speech Assistant
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100/70 border border-violet-200 text-violet-800 text-[10px] font-bold uppercase shadow-sm">
                  FR-6 & FR-8 • Multi-Lingual
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Ask in <strong>Hindi, Hinglish, or English</strong>. Our assistant detects your language and responds in the same language.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsChatOpen(prev => !prev)}
              className="btn-clay-primary px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isChatOpen ? 'Minimize Assistant' : 'Open Speech Assistant 💬'}</span>
            </button>
          </div>
        </div>

        {/* Quick starter question chips directly on page */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Quick Inquiries (Click to ask assistant):
          </span>
          <div className="flex flex-wrap gap-2">
            {dynamicSuggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsChatOpen(true);
                  handleChipClick(chip.label);
                }}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white/95 text-slate-700 font-semibold border border-slate-200/90 shadow-clay-pill hover:border-violet-300 hover:bg-violet-50/50 hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center gap-1.5"
              >
                <span>{chip.label}</span>
                <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FLOATING LAUNCHER BUTTON (Side Float when minimized) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-5 sm:right-6 z-50 group flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-sugary-violet hover:scale-105 active:scale-95 transition-all duration-300 border border-white/40 overflow-hidden animate-pop-in cursor-pointer"
          title="Click to open Speech Assistant (Hindi • Hinglish • English)"
        >
          <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
          <div className="relative">
            <Clay3DIcon name="robot" size="xs" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
            </span>
          </div>
          <div className="text-left hidden min-[400px]:block">
            <span className="text-xs font-black tracking-tight block leading-tight">Ask Speech Coach</span>
            <span className="text-[10px] text-violet-200 font-semibold block leading-tight">Hindi • Hinglish • English</span>
          </div>
        </button>
      )}

      {/* 3. FLOATING CHATBOT WINDOW (Opens when clicked) */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[440px] md:w-[480px] h-[580px] max-h-[85vh] card-clay rounded-3xl border border-white/95 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-pop-in">
          
          {/* Floating Chat Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between shadow-sm relative shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Clay3DIcon name="robot" size="xs" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white"></span>
              </div>
              <div>
                <h4 className="font-heading font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>VoxPulse Speech Coach</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white uppercase">AI</span>
                </h4>
                <p className="text-[10px] text-violet-200 font-medium">
                  {detectedLanguage === 'hi' ? '🇮🇳 हिंदी में बातचीत' : detectedLanguage === 'hinglish' ? '🇮🇳 Hinglish Mode' : '🌐 English & Multilingual'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Minimize chat"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Inquiry Chips Carousel at top of chat */}
          <div className="p-2 sm:p-2.5 bg-slate-50/90 border-b border-slate-200/80 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Try:
            </span>
            {dynamicSuggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.label)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 shadow-xs hover:border-violet-300 hover:bg-violet-50 shrink-0 whitespace-nowrap transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = speakingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="shrink-0 mt-0.5">
                      <Clay3DIcon name="robot" size="xs" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] text-xs sm:text-sm ${
                      isUser
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md p-3 sm:p-3.5 font-medium'
                        : 'card-clay text-slate-800 rounded-2xl rounded-tl-sm border border-white/95 p-3.5 sm:p-4 space-y-2.5 shadow-sm'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isUser ? 'text-violet-200' : 'text-slate-400'}`}>
                        {isUser ? 'You' : 'Speech Coach AI'}
                      </span>

                      {!isUser && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleReadAloud(msg.id, msg.text)}
                            className={`p-1 rounded-md transition-colors ${
                              isSpeaking 
                                ? 'text-violet-600 bg-violet-100 animate-pulse' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                            title={isSpeaking ? 'Stop reading' : 'Read aloud in detected language'}
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Text Body */}
                    {isUser ? (
                      <p className="leading-relaxed">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}

                    {/* Grounded Flaw Card & Quick Audio Seek */}
                    {msg.dataGrounding && (
                      <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-100 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-violet-900">
                          <span>{msg.dataGrounding.title}</span>
                          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-full border border-violet-200">
                            {msg.dataGrounding.timeRange}
                          </span>
                        </div>
                        {msg.dataGrounding.affectedWords && (
                          <p className="text-slate-600 italic">
                            Words: {msg.dataGrounding.affectedWords}
                          </p>
                        )}
                        {msg.suggestedAction && typeof msg.suggestedAction.time === 'number' && (
                          <button
                            onClick={() => onSeek(msg.suggestedAction!.time!)}
                            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-violet-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm hover:bg-violet-700 transition-colors"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Play & Seek to {HelpAssistantService.formatTime(msg.suggestedAction.time)}</span>
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
              <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-6 animate-pulse">
                <Clay3DIcon name="robot" size="xs" />
                <span>Coach is thinking in your language...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Error notice if any */}
          {voiceError && (
            <div className="text-[11px] text-pink-800 bg-pink-50 border-t border-pink-200 px-3 py-1.5 font-medium flex items-center justify-between">
              <span>{voiceError}</span>
              <button onClick={() => setVoiceError(null)} className="underline ml-2 font-bold">Dismiss</button>
            </div>
          )}

          {/* Chat Footer with Input & Voice Mic */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200/90 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? '🎙️ Listening... (Speak in Hindi or English)'
                    : 'Poochiye (Ask in Hindi, Hinglish, or English)...'
                }
                className={`w-full py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${
                  isListening ? 'border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20' : ''
                }`}
              />

              {/* Voice Mic Button */}
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
                  }`}
                  title={isListening ? 'Stop voice listening' : 'Voice input in Hindi or English'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
