import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { LiveRecorderStudio } from './LiveRecorderStudio';
import { Clay3DIcon, type Clay3DIconName } from './Clay3DIcon';
import { SAMPLE_SPEECHES } from '../services/sampleData';
import type { SampleSpeech } from '../types/speech';

interface AudioUploaderProps {
  onSelectSample: (sample: SampleSpeech) => void;
  onUploadFile: (file: File | Blob, transcript?: string) => void;
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisStage: string;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onSelectSample,
  onUploadFile,
  isAnalyzing,
  analysisProgress,
  analysisStage
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'presets'>('record');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
      setSelectedFile(file);
      setShowTranscriptInput(true);
      setActiveTab('upload');
    } else {
      alert('Please upload a supported audio format (.mp3, .wav, .m4a, .ogg).');
    }
  };

  const handleTriggerCustomAnalyze = () => {
    if (selectedFile) {
      onUploadFile(selectedFile, transcriptText);
    }
  };

  const handleLiveRecordingFinished = (blob: Blob, liveTranscript: string) => {
    onUploadFile(blob, liveTranscript);
  };

  const getPresetCardStyle = (index: number, isBaseline: boolean) => {
    if (isBaseline) {
      return {
        iconName: 'trophy' as Clay3DIconName,
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    const themes = [
      {
        iconName: 'rocket' as Clay3DIconName,
        badgeBg: 'bg-pink-50 text-pink-800 border-pink-200',
      },
      {
        iconName: 'clock' as Clay3DIconName,
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      },
      {
        iconName: 'target' as Clay3DIconName,
        badgeBg: 'bg-violet-50 text-violet-800 border-violet-200',
      }
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 relative">

      {/* Hero Section */}
      <div className="text-center space-y-3.5 py-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-clay-pill text-slate-700 text-xs font-bold tracking-wide hover:border-violet-300 transition-colors">
          <Clay3DIcon name="sparkles" size="xs" />
          <span>Multimodal Speech Analytics & Temporal Diagnostics</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading leading-tight">
          Objective Speech Diagnostics with <br />
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Temporal Flaw Grounding
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
          Record your speech live or upload audio to identify exact millisecond flaw boundaries, causal acoustic discrepancies against ideal champion baselines, and actionable vocal drills.
        </p>
      </div>

      {/* Mode Navigation Tabs (Responsive & Touch-Friendly) */}
      <div className="flex justify-center px-2">
        <div className="clay-inset-well p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 sm:gap-1.5 shadow-inner overflow-x-auto max-w-full no-scrollbar">
          {/* Tab 1: Live Record */}
          <button
            onClick={() => setActiveTab('record')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'record'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Clay3DIcon name="mic" size="xs" />
            <span className="hidden sm:inline">Record Live Speech</span>
            <span className="sm:hidden">Record Live</span>
          </button>

          {/* Tab 2: Upload File */}
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Clay3DIcon name="cloud" size="xs" />
            <span className="hidden sm:inline">Upload Audio File</span>
            <span className="sm:hidden">Upload File</span>
          </button>

          {/* Tab 3: Presets */}
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'presets'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sugary-violet scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Clay3DIcon name="trophy" size="xs" />
            <span className="hidden sm:inline">Benchmark Presets</span>
            <span className="sm:hidden">Presets</span>
          </button>
        </div>
      </div>

      {/* Mode 1: LIVE RECORDING STUDIO (PRIMARY DEFAULT) */}
      {activeTab === 'record' && (
        <div className="animate-pop-in">
          <LiveRecorderStudio
            onRecordingComplete={handleLiveRecordingFinished}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {/* Mode 2: Custom Audio Upload & Analysis */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-pop-in">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[250px] card-clay ${
              dragActive
                ? 'border-violet-500 bg-violet-50/40 ring-4 ring-violet-500/10'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-violet-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center space-y-3">
                <Clay3DIcon name="music" size="xl" floating />
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-heading">{selectedFile.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for contrastive DSP analysis
                  </p>
                </div>
                <span className="text-xs text-violet-600 font-bold underline">Click to choose another file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Clay3DIcon name="cloud" size="xl" floating />
                <div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    Drag and drop your speech recording here, or <span className="text-violet-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Supports MP3, WAV, M4A, OGG (Max 25MB). Processed 100% locally in your browser.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Spoken Speech Words Input for Word Grounding */}
          <div className="card-clay rounded-3xl border border-white/90 overflow-hidden">
            <button
              onClick={() => setShowTranscriptInput(!showTranscriptInput)}
              className="w-full px-6 py-4 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-violet-50/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clay3DIcon name="document" size="sm" withPedestal />
                <div className="text-left">
                  <span className="font-bold block text-slate-900 text-sm">Spoken Speech Words (Transcript Grounding)</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {transcriptText.trim() 
                      ? `${transcriptText.trim().split(/\s+/).length} words ready for alignment`
                      : 'Provide spoken words to enable word-by-word flaw highlighting'}
                  </span>
                </div>
              </div>
              {showTranscriptInput ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showTranscriptInput && (
              <div className="p-6 pt-2 border-t border-slate-100 bg-white/50 space-y-3">
                <p className="text-xs text-slate-500">
                  Paste or type the exact words spoken in this audio. The system will align each word to speech timestamps and highlight flaw regions (fast speech, pauses, mumbling).
                </p>
                <textarea
                  rows={4}
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste or type what is spoken in this audio here (e.g. Good morning everyone, today I want to present...)..."
                  className="w-full p-4 rounded-2xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 shadow-inner leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 font-medium">
                  Tip: If omitted, acoustics are analyzed without word-level highlights, and you can add the spoken words anytime later.
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {selectedFile && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleTriggerCustomAnalyze}
                disabled={isAnalyzing}
                className="btn-clay-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2.5"
              >
                <Clay3DIcon name="play" size="xs" />
                <span>Analyze Speech with Client-side DSP</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Benchmark Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-6 animate-pop-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse"></span>
              Curated Competition Test Cases (Instant 1-Click Evaluation)
            </span>
            <span className="text-xs text-emerald-800 bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1.5 shadow-clay-pill">
              <Clay3DIcon name="tick" size="xs" />
              Pre-calibrated Baselines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {SAMPLE_SPEECHES.map((sample, idx) => {
              const isBaseline = sample.category === 'Benchmark Baseline';
              const cardStyle = getPresetCardStyle(idx, isBaseline);

              return (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="relative p-6 rounded-3xl card-clay border border-white/80 hover:shadow-clay-card-hover hover:-translate-y-1.5 transition-all duration-200 cursor-pointer space-y-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <Clay3DIcon
                        name={cardStyle.iconName}
                        size="md"
                        withPedestal
                        floating={isBaseline}
                      />
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cardStyle.badgeBg} shadow-sm`}>
                          {sample.category}
                        </span>
                        <h3 className="text-base font-black text-slate-900 font-heading mt-1 group-hover:text-violet-700 transition-colors">
                          {sample.title}
                        </h3>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-mono font-bold text-slate-600 flex items-center gap-1.5 shrink-0 shadow-sm">
                      <Clay3DIcon name="clock" size="xs" />
                      <span>{sample.durationSec}s</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div>
                      {isBaseline ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                          <Clay3DIcon name="tick" size="xs" />
                          Zero Flaws Benchmark
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">
                          {sample.precomputedResult.flaws.length} Grounded Flaws Pre-identified
                        </span>
                      )}
                    </div>

                    <span className="text-violet-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Load Case
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DSP Analysis Progress Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-clay p-8 sm:p-10 rounded-3xl border border-white/95 shadow-2xl max-w-md w-full text-center space-y-6 animate-pop-in">
            <div className="mx-auto flex justify-center">
              <Clay3DIcon name="brain" size="xl" floating />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 font-heading tracking-tight">
                DSP Audio Analysis in Progress
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {analysisStage}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100/90 shadow-inner overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-300 shadow-sugary-violet"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-violet-700">
                {analysisProgress}% Complete
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
