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
  private currentSessionInterim = '';
  private currentLanguage = 'en-IN';
  private sttRestartTimeout: any = null;
  private sttBlocked = false;

  public isSpeechRecognitionAvailable(): boolean {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    return !!(win?.SpeechRecognition || win?.webkitSpeechRecognition);
  }

  public isMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private startSpeechRecognition(options: LiveRecorderOptions): void {
    if (this.isMobile()) {
      // Mobile OS (especially Android Chrome) does not allow concurrent microphone hardware access
      // between WebRTC MediaRecorder and native Google Speech Recognition OS service.
      // Launching STT simultaneously causes the Android OS system toast:
      // "Speech Recognition and Synthesis from Google cannot record now as Chrome is recording audio".
      // We safely bypass concurrent STT on mobile and enable post-recording dictation/cadence review instead.
      return;
    }

    const win = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition is not supported in this browser environment.');
      return;
    }

    try {
      this.speechRecognition = new SpeechRecognitionClass();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = this.currentLanguage;
      this.speechRecognition.maxAlternatives = 1;

      this.speechRecognition.onresult = (event: any) => {
        let interim = '';
        let newFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            newFinal += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        if (newFinal.trim()) {
          this.accumulatedFinalTranscript = [this.accumulatedFinalTranscript, newFinal.trim()]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        this.currentSessionInterim = interim.trim();

        // Pass interim words and finalized transcript separately to prevent duplicate text display
        options.onTranscriptUpdate?.(this.currentSessionInterim, this.accumulatedFinalTranscript);
      };

      this.speechRecognition.onerror = (e: any) => {
        console.debug('Speech recognition event:', e?.error);
        // If microphone hardware is locked by OS/browser, permission denied, or service unavailable, permanently halt retries
        if (
          e?.error === 'audio-capture' ||
          e?.error === 'not-allowed' ||
          e?.error === 'service-not-allowed' ||
          e?.error === 'aborted'
        ) {
          this.sttBlocked = true;
          if (this.sttRestartTimeout) {
            clearTimeout(this.sttRestartTimeout);
            this.sttRestartTimeout = null;
          }
        }
      };

      this.speechRecognition.onend = () => {
        if (!this.isRecording || this.sttBlocked) return;

        // Commit any pending interim words
        if (this.currentSessionInterim) {
          this.accumulatedFinalTranscript = [this.accumulatedFinalTranscript, this.currentSessionInterim]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          this.currentSessionInterim = '';
          options.onTranscriptUpdate?.('', this.accumulatedFinalTranscript);
        }

        // Asynchronous delay restart to avoid Chrome InvalidStateError on continuous recognition
        this.sttRestartTimeout = setTimeout(() => {
          if (this.isRecording && !this.sttBlocked) {
            try {
              this.speechRecognition?.start();
            } catch {
              try {
                this.startSpeechRecognition(options);
              } catch {
                // ignore
              }
            }
          }
        }, 120);
      };

      this.speechRecognition.start();
    } catch (e) {
      console.warn('SpeechRecognition initialization notice:', e);
    }
  }

  public async startRecording(options: LiveRecorderOptions): Promise<boolean> {
    if (this.isRecording) return false;

    try {
      this.accumulatedFinalTranscript = '';
      this.currentSessionInterim = '';
      this.audioChunks = [];
      this.currentLanguage = options.lang || 'en-IN';
      this.sttBlocked = false;
      if (this.sttRestartTimeout) {
        clearTimeout(this.sttRestartTimeout);
        this.sttRestartTimeout = null;
      }

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
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch {
          // ignore
        }
      }
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      source.connect(this.analyserNode);

      // 3. Setup MediaRecorder with a MIME type that decodeAudioData can handle.
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

      // 5. Start live speech recognition simultaneously for desktop browsers only.
      // Mobile browsers (Android/iOS) lock hardware microphone exclusively to MediaRecorder,
      // so concurrent STT is safely bypassed on mobile to avoid OS toast conflicts.
      if (!this.isMobile()) {
        this.startSpeechRecognition(options);
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

      this.sttBlocked = true;
      if (this.sttRestartTimeout) {
        clearTimeout(this.sttRestartTimeout);
        this.sttRestartTimeout = null;
      }

      if (this.speechRecognition) {
        try {
          this.speechRecognition.onend = null;
          this.speechRecognition.onerror = null;
          this.speechRecognition.stop();
        } catch {
          // ignore
        }
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const transcript = [this.accumulatedFinalTranscript, this.currentSessionInterim]
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
    this.sttBlocked = true;
    if (this.sttRestartTimeout) {
      clearTimeout(this.sttRestartTimeout);
      this.sttRestartTimeout = null;
    }
    if (this.speechRecognition) {
      try { 
        this.speechRecognition.onend = null;
        this.speechRecognition.onerror = null;
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
    this.sttBlocked = true;
    if (this.sttRestartTimeout) {
      clearTimeout(this.sttRestartTimeout);
      this.sttRestartTimeout = null;
    }
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
