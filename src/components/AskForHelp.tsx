import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
   Mic, MicOff, Volume2, VolumeX, RotateCcw, 
   CornerDownRight, Clock
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isVoiceSupported = speechRecInstance.isSupported();

  // Initialize or re-initialize welcome message whenever result changes
  useEffect(() => {
    const primaryFlaw = result.flaws[0];
    const lowestMetric = Object.entries(result.breakdown).sort((a, b) => a[1] - b[1])[0];

    const initialText = primaryFlaw
      ? `Hello! I analyzed your speech audio against competition standards.\n\n` +
        `• **Overall Score**: **${result.overall_score}/100**\n` +
        `• **Lowest Area**: **${lowestMetric ? lowestMetric[0].toUpperCase() : 'Pacing'}** (${lowestMetric ? lowestMetric[1] : 60}/100)\n` +
        `• **Primary Detected Flaw**: **${primaryFlaw.type.replace('_', ' ').toUpperCase()}** at **${HelpAssistantService.formatTime(primaryFlaw.start)}** (${primaryFlaw.measuredValue || primaryFlaw.severity})\n\n` +
        `Ask me anything about your delivery flaws, timestamps, or root-cause problems below!`
      : `Hello! I analyzed your speech audio against competition standards. Your delivery scored an impressive **${result.overall_score}/100** with no critical flaws detected! Ask me anything about your acoustic cadence or pre-competition drills.`;

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Compute dynamic suggested question chips based on actual data
  const dynamicSuggestedChips = useMemo(() => {
    return HelpAssistantService.getDynamicSuggestedQuestions(result);
  }, [result]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Stop ongoing speech synthesis if any
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const userMsg: QnAMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    const assistantMsg = HelpAssistantService.generateAnswer(query, result);

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInputText('');
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
      }
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
    utterance.rate = 1.05;
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
        text: `Chat reset. I am ready to analyze your delivery data. Ask a question or click any starter pill below!`,
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
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Empty line
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
    <div className="card-clay p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/80 space-y-4 sm:space-y-5 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <Clay3DIcon name="robot" size="sm" withPedestal floating />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Ask for Help: Speech Assistant
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100/70 border border-violet-200 text-violet-800 text-[10px] font-bold uppercase shadow-sm">
                FR-6 & FR-8
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Data-grounded delivery diagnosis, root-cause analysis & voice follow-ups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="btn-clay-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            title="Reset assistant conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">Reset</span>
          </button>

          <span className="text-xs bg-emerald-50/90 px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5 shadow-clay-pill">
            <Clay3DIcon name="tick" size="xs" />
            <span>Acoustic Grounded</span>
          </span>
        </div>
      </div>

      {/* Suggested Question Chips (FR-6.4: Dynamically derived from actual weak points) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <Clay3DIcon name="bulb" size="xs" />
          <span>Suggested Questions (Grounded in your weak points):</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {dynamicSuggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip.label)}
              className="text-xs px-3.5 py-1.5 rounded-full bg-white/95 text-slate-700 font-semibold border border-slate-200/90 shadow-clay-pill hover:border-violet-300 hover:bg-violet-50/50 hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center gap-1.5"
            >
              <span>{chip.label}</span>
              <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="clay-inset-well p-4 sm:p-5 h-80 sm:h-96 overflow-y-auto space-y-4 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="shrink-0 mt-0.5">
                  <Clay3DIcon name="robot" size="xs" withPedestal />
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[82%] text-xs sm:text-sm ${
                  isUser
                    ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-3xl rounded-tr-sm shadow-sugary-violet p-4 sm:p-5 font-medium relative overflow-hidden'
                    : 'card-clay text-slate-800 rounded-3xl rounded-tl-sm border border-white/90 p-4 sm:p-5 space-y-3.5'
                }`}
              >
                {/* User Bubble Top Gloss Sheen */}
                {isUser && (
                  <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/25 to-transparent rounded-full pointer-events-none" />
                )}

                {/* Text Content */}
                {isUser ? (
                  <p className="whitespace-pre-line relative z-10">{msg.text}</p>
                ) : (
                  renderFormattedText(msg.text)
                )}

                {/* Structured Causal Acoustic Diagnostic Attachment (FR-6.2 & FR-6.3) */}
                {!isUser && msg.dataGrounding && (
                  <div className="clay-inset-well p-3.5 space-y-2.5 mt-2 text-xs">
                    
                    {/* Diagnostic Attachment Header */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                        <span className="uppercase tracking-wider text-[11px] text-pink-700 font-black">
                          {msg.dataGrounding.title || 'Acoustic Diagnosis Grounding'}
                        </span>
                      </div>

                      {msg.dataGrounding.timeRange && (
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-mono font-semibold text-slate-700 flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{msg.dataGrounding.timeRange}</span>
                          {msg.dataGrounding.durationSec && (
                            <span className="text-slate-400 font-normal">({msg.dataGrounding.durationSec}s)</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Measured Data Comparison Pill */}
                    {(msg.dataGrounding.measuredValue || msg.dataGrounding.baselineValue) && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        {msg.dataGrounding.measuredValue && (
                          <span className="px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-800 font-bold shadow-sm">
                            Measured: {msg.dataGrounding.measuredValue}
                          </span>
                        )}
                        {msg.dataGrounding.baselineValue && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-sm">
                            Ideal Baseline: {msg.dataGrounding.baselineValue}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Affected Words in Transcript */}
                    {msg.dataGrounding.affectedWords && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-slate-800 shadow-sm">
                        <span className="text-[10px] font-bold uppercase text-amber-700 block">
                          Spoken Words Flagged:
                        </span>
                        <span className="italic font-bold font-serif text-xs text-slate-900">
                          {msg.dataGrounding.affectedWords}
                        </span>
                      </div>
                    )}

                    {/* Contest Impact */}
                    {msg.dataGrounding.contestImpact && (
                      <div className="text-[11px] text-slate-700 font-normal">
                        <strong className="font-bold text-pink-700">Contest Impact: </strong>
                        <span>{msg.dataGrounding.contestImpact}</span>
                      </div>
                    )}

                    {/* Action Seek Audio Button */}
                    {msg.dataGrounding.seekTime !== undefined && (
                      <div className="pt-1">
                        <button
                          onClick={() => onSeek(msg.dataGrounding!.seekTime!)}
                          className="btn-clay-primary px-3.5 py-1.5 text-xs inline-flex items-center gap-1.5 font-bold"
                        >
                          <Clay3DIcon name="play" size="xs" />
                          <span>Play Flaw Segment ({HelpAssistantService.formatTime(msg.dataGrounding.seekTime)})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Assistant Footer: Seek to Timestamp & Voice Read Aloud (FR-8.2) */}
                {!isUser && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {msg.suggestedAction && msg.suggestedAction.time !== undefined && !msg.dataGrounding?.seekTime && (
                        <button
                          onClick={() => onSeek(msg.suggestedAction!.time!)}
                          className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-bold hover:bg-violet-100 shadow-clay-pill transition-all flex items-center gap-1.5"
                        >
                          <Clay3DIcon name="play" size="xs" />
                          <span>Jump to {HelpAssistantService.formatTime(msg.suggestedAction.time)}</span>
                        </button>
                      )}
                    </div>

                    {/* Text-To-Speech Play / Stop (FR-8.2) */}
                    <button
                      onClick={() => handleToggleReadAloud(msg.id, msg.text)}
                      className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-clay-pill ${
                        isSpeaking
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sugary-violet animate-pulse'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Read answer aloud with Web Speech API'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">Speaking... (Stop)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="shrink-0 mt-0.5">
                  <Clay3DIcon name="speech" size="xs" withPedestal />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {voiceError && (
        <div className="text-xs text-pink-800 bg-pink-50 border border-pink-200 p-2.5 rounded-2xl font-medium flex items-center justify-between shadow-sm">
          <span>{voiceError}</span>
          <button onClick={() => setVoiceError(null)} className="underline ml-2 font-bold">Dismiss</button>
        </div>
      )}

      {/* Input Bar with Text & Voice (FR-8.1) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening 
                ? '🎙️ Listening to your microphone... (Speak your question)' 
                : 'Ask: "Where are my flaws?", "Why did pacing drop?", "Explain pause at 00:09"...'
            }
            className={`w-full py-3.5 pl-4 pr-12 text-xs sm:text-sm font-medium rounded-2xl bg-white border border-slate-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${
              isListening ? 'border-pink-500 bg-pink-50/30 ring-2 ring-pink-500/20' : ''
            }`}
          />
          
          {/* FR-8.1: Voice Mic Button */}
          {isVoiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-pink-600 text-white shadow-sugary-pink animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isListening ? 'Stop voice recording' : 'Ask question with voice (Web Speech API)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-clay-primary px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <span className="hidden sm:inline">Ask Assistant</span>
          <span className="sm:hidden">Ask</span>
          <Clay3DIcon name="rocket" size="xs" />
        </button>
      </form>

    </div>
  );
};
