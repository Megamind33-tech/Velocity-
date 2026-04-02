/**
 * Web Audio capture: RMS volume + estimated fundamental pitch (Hz) for vocal flight.
 * High pitch → upward steering; low pitch → downward. Horizontal is not driven here.
 */
export class VoiceInputManager {
    private static instance: VoiceInputManager;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private mediaStream: MediaStream | null = null;
    private timeDomain: Float32Array | null = null;

    private _volume = 0;
    /** Estimated fundamental frequency in Hz, or 0 if unknown / silent */
    private _pitchHz = 0;
    private _isInitialized = false;
    private _suspended = false;

    private constructor() {}

    public static getInstance(): VoiceInputManager {
        if (!VoiceInputManager.instance) {
            VoiceInputManager.instance = new VoiceInputManager();
        }
        return VoiceInputManager.instance;
    }

    public async init(): Promise<boolean> {
        if (this._isInitialized) return true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.mediaStream = stream;
            const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.audioContext = new AC();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 4096;
            this.analyser.smoothingTimeConstant = 0.65;

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            this.timeDomain = new Float32Array(this.analyser.fftSize);
            this._isInitialized = true;
            console.log('VoiceInputManager: Audio context initialized.');
            return true;
        } catch (err) {
            console.error('VoiceInputManager: Permission denied or no microphone found.', err);
            return false;
        }
    }

    /**
     * Pause capture processing and suspend the audio context (mic effectively idle).
     */
    public pauseMic(): void {
        if (!this._isInitialized) return;
        this._suspended = true;
        this._volume = 0;
        this._pitchHz = 0;
        void this.audioContext?.suspend();
    }

    /**
     * Resume audio context; polling resumes on next update().
     */
    public resumeMic(): void {
        if (!this._isInitialized) return;
        this._suspended = false;
        void this.audioContext?.resume();
    }

    public update(): void {
        if (!this._isInitialized || !this.analyser || !this.timeDomain || this._suspended) {
            if (this._suspended) {
                this._volume = 0;
                this._pitchHz = 0;
            }
            return;
        }

        this.analyser.getFloatTimeDomainData(this.timeDomain);

        let sumSq = 0;
        for (let i = 0; i < this.timeDomain.length; i++) {
            const s = this.timeDomain[i];
            sumSq += s * s;
        }
        this._volume = Math.sqrt(sumSq / this.timeDomain.length);

        const sampleRate = this.audioContext!.sampleRate;
        this._pitchHz = this.estimateFundamentalHz(this.timeDomain, sampleRate);
    }

    /**
     * YIN-style simplified autocorrelation pitch estimate; returns 0 if unstable.
     */
    private estimateFundamentalHz(buffer: Float32Array, sampleRate: number): number {
        const n = buffer.length;
        const threshold = 0.15;
        let rms = 0;
        for (let i = 0; i < n; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / n);
        if (rms < threshold) return 0;

        const minF = 80;
        const maxF = 900;
        const minLag = Math.floor(sampleRate / maxF);
        const maxLag = Math.floor(sampleRate / minF);

        let bestLag = -1;
        let bestCorr = 0;
        for (let lag = minLag; lag <= maxLag; lag++) {
            let c = 0;
            for (let i = 0; i < n - lag; i++) {
                c += buffer[i] * buffer[i + lag];
            }
            if (c > bestCorr) {
                bestCorr = c;
                bestLag = lag;
            }
        }

        if (bestLag <= 0 || bestCorr <= 0) return 0;
        return sampleRate / bestLag;
    }

    public get volume(): number {
        return this._volume;
    }

    public get pitchHz(): number {
        return this._pitchHz;
    }

    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    public get isSuspended(): boolean {
        return this._suspended;
    }
}
