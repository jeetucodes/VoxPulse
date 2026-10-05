// Live Audio Recorder Service using MediaRecorder and Web Audio API

export interface LiveRecorderOptions {
  lang?: string; // 'en-IN' | 'hi-IN' | 'en-US'
  onTimeUpdate?: (seconds: number) => void;
  onTranscriptUpdate?: (interim: string, final: string) => void;
  onError?: (error: string) => void;
}

export class LiveRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private speechRecognition: any | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime = 0;
  private timerInterval: any = null;
  private isRecording = false;

  private accumulatedFinalTranscript = '';
  private currentSessionFinal = '';
  private currentSessionInterim = '';
  private currentLanguage = 'en-IN';

  public isSpeechRecognitionAvailable(): boolean {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    return !!(win?.SpeechRecognition || win?.webkitSpeechRecognition);
  }

  private initSpeechRecognition(lang: string = 'en-IN'): any {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;
      return recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization notice:', e);
      return null;
    }
  }

  public async startRecording(options: LiveRecorderOptions): Promise<boolean> {
    if (this.isRecording) return false;

    try {
      this.accumulatedFinalTranscript = '';
      this.currentSessionFinal = '';
      this.currentSessionInterim = '';
      this.audioChunks = [];
      this.currentLanguage = options.lang || 'en-IN';

      // 1. Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      // 2. Setup Web Audio API analyser for live visualizer
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      source.connect(this.analyserNode);

      // 3. Setup MediaRecorder with a MIME type that decodeAudioData can handle.
      // Priority order (best → fallback):
      //   audio/webm;codecs=pcm   → Chrome/Edge: raw linear PCM, always decodable
      //   audio/ogg;codecs=opus   → Firefox: natively supported by decodeAudioData
      //   audio/ogg               → Firefox fallback
      //   audio/mp4               → Safari: AAC in MP4
      //   audio/webm              → last resort (opus-coded webm may fail decodeAudioData)
      const mimePreference = [
        'audio/webm;codecs=pcm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
        'audio/webm',
      ];
      const mimeType = mimePreference.find(m => MediaRecorder.isTypeSupported(m)) ?? '';

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.mediaStream, { mimeType })
        : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(200); // 200ms slice
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      // 4. Timer interval
      this.timerInterval = setInterval(() => {
        const elapsed = (Date.now() - this.recordingStartTime) / 1000;
        options.onTimeUpdate?.(elapsed);
      }, 100);

      // 5. Start live speech recognition with user selected language
      this.speechRecognition = this.initSpeechRecognition(this.currentLanguage);
      if (this.speechRecognition) {
        this.speechRecognition.onresult = (event: any) => {
          let interim = '';
          let finalAcc = '';
          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              finalAcc += res[0].transcript + ' ';
            } else {
              interim += res[0].transcript;
            }
          }
          this.currentSessionFinal = finalAcc;
          this.currentSessionInterim = interim;

          const totalTrans = [this.accumulatedFinalTranscript, this.currentSessionFinal, interim]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          options.onTranscriptUpdate?.(interim, totalTrans);
        };

        this.speechRecognition.onerror = (e: any) => {
          console.debug('Speech recognition event:', e?.error);
        };

        this.speechRecognition.onend = () => {
          // Commit current session's finalized text so it is never lost across pauses
          if (this.currentSessionFinal.trim()) {
            this.accumulatedFinalTranscript = [this.accumulatedFinalTranscript, this.currentSessionFinal]
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            this.currentSessionFinal = '';
            this.currentSessionInterim = '';
          }

          // Restart recognition if still actively recording (browsers time out on natural silence)
          if (this.isRecording && this.speechRecognition) {
            try {
              this.speechRecognition.start();
            } catch {
              // ignore if already running or stopped
            }
          }
        };

        try {
          this.speechRecognition.start();
        } catch {
          // ignore speech recognition start failure
        }
      }

      return true;
    } catch (err: any) {
      options.onError?.(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
          : `Failed to access microphone: ${err.message}`
      );
      this.cleanup();
      return false;
    }
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  public stopRecording(): Promise<{ blob: Blob; transcript: string; duration: number }> {
    return new Promise((resolve) => {
      if (!this.isRecording || !this.mediaRecorder) {
        resolve({ blob: new Blob(), transcript: '', duration: 0 });
        return;
      }

      const duration = (Date.now() - this.recordingStartTime) / 1000;

      if (this.speechRecognition) {
        try {
          this.speechRecognition.onend = null;
          this.speechRecognition.stop();
        } catch {
          // ignore
        }
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const transcript = [this.accumulatedFinalTranscript, this.currentSessionFinal, this.currentSessionInterim]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        this.cleanup();
        resolve({ blob, transcript, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  public cancelRecording(): void {
    if (this.speechRecognition) {
      try { 
        this.speechRecognition.onend = null;
        this.speechRecognition.stop(); 
      } catch { /* ignore */ }
    }
    if (this.mediaRecorder && this.isRecording) {
      try { this.mediaRecorder.stop(); } catch { /* ignore */ }
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isRecording = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch { /* ignore */ }
      this.audioContext = null;
    }
    this.analyserNode = null;
  }
}

export const liveRecorderInstance = new LiveRecorderService();
