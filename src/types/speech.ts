export type FlawType = 
  | 'fast_speech'
  | 'unnatural_pause'
  | 'mumbling'
  | 'monotone_pitch'
  | 'volume_drop';

export type FlawSeverity = 'low' | 'medium' | 'high';

export interface Flaw {
  id: string;
  type: FlawType;
  start: number; // in seconds
  end: number;   // in seconds
  severity: FlawSeverity;
  explanation: string;
  improvement: string;
  measuredValue?: string;
  baselineValue?: string;
  drillSteps?: string[];
}

export interface MetricBreakdown {
  fluency: number;      // 0-100
  pacing: number;       // 0-100
  articulation: number; // 0-100
  pitchDynamics: number;// 0-100
}

export interface TimeSeriesPoint {
  timestamp: number; // seconds
  participantEnergy: number; // 0-1 normalized RMS
  baselineEnergy: number;
  participantPitch: number; // Hz (0 if unvoiced)
  baselinePitch: number;
  participantRate: number; // estimated WPM or syllables/sec
  baselineRate: number;
  activeFlawType?: FlawType;
}

export interface TranscriptWord {
  id: string;
  word: string;
  start: number;
  end: number;
  flawId?: string;
  flawType?: FlawType;
  flawExplanation?: string;
  measuredMetric?: string;
  severity?: FlawSeverity;
  isPauseAdjacent?: boolean;
  pauseDuration?: number;
  pauseStart?: number;
  pauseEnd?: number;
  originalWord?: string;
}

export interface AnalysisResult {
  overall_score: number;
  breakdown: MetricBreakdown;
  flaws: Flaw[];
  timeSeries: TimeSeriesPoint[];
  duration: number;
  audioBaselineSummary: {
    avgWpm: number;
    pauseRatio: number;
    pitchRangeHz: number;
    medianRms: number;
  };
  participantSummary: {
    avgWpm: number;
    pauseRatio: number;
    pitchRangeHz: number;
    medianRms: number;
  };
  transcript?: TranscriptWord[];
}

export interface SampleSpeech {
  id: string;
  title: string;
  category: 'Declamation' | 'Persuasive Oratory' | 'Extempore' | 'Benchmark Baseline';
  description: string;
  durationSec: number;
  precomputedResult: AnalysisResult;
  transcriptText: string;
  synthTonePattern: {
    baseFreq: number;
    speedFactor: number;
    pauseIntervals: [number, number][];
    fastIntervals: [number, number][];
    mumbleIntervals: [number, number][];
  };
}

export interface QnAMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestedAction?: {
    type: 'seek' | 'filter_flaw';
    time?: number;
    flawId?: string;
  };
  dataGrounding?: {
    title?: string;
    flawType?: FlawType;
    severity?: FlawSeverity;
    timeRange?: string;
    durationSec?: number;
    measuredValue?: string;
    baselineValue?: string;
    affectedWords?: string;
    rootCause?: string;
    contestImpact?: string;
    prescriptiveDrill?: string;
    seekTime?: number;
    flawId?: string;
  };
}
