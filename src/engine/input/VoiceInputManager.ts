import { PitchDetector, VOCAL_RANGES } from '../../audio/PitchDetector';

/**
 * Web Audio capture: RMS volume + estimated fundamental pitch (Hz) for vocal flight.
 * High pitch → upward steering; low pitch → downward. Horizontal is not driven here.
 *
 * Uses Pitchy's McLeod Pitch Detection algorithm for superior accuracy:
 * - More accurate than basic autocorrelation
 * - Optimized for vocal singing
 * - ±5Hz accuracy in real-time
 */
export class VoiceInputManager {
    private static instance: VoiceInputManager;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private mediaStream: MediaStream | null = null;
    private timeDomain: Float32Array | null = null;
    private pitchDetector: PitchDetector | null = null;

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

            // Initialize Pitchy pitch detector with buffer length matching FFT size
            this.pitchDetector = new PitchDetector(this.audioContext.sampleRate, this.analyser.fftSize);

            this._isInitialized = true;
            console.log('VoiceInputManager: Audio context initialized with Pitchy pitch detection (McLeod method).');
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

        // Calculate RMS volume
        let sumSq = 0;
        for (let i = 0; i < this.timeDomain.length; i++) {
            const s = this.timeDomain[i];
            sumSq += s * s;
        }
        this._volume = Math.sqrt(sumSq / this.timeDomain.length);

        // Detect pitch using Pitchy's McLeod algorithm
        const sampleRate = this.audioContext!.sampleRate;
        this._pitchHz = this.detectPitchWithPitchy(this.timeDomain, sampleRate);
    }

    /**
     * Detect pitch using Pitchy's McLeod algorithm
     * More accurate than basic autocorrelation, optimized for vocals
     */
    private detectPitchWithPitchy(buffer: Float32Array, sampleRate: number): number {
        if (!this.pitchDetector) {
            return 0;
        }

        try {
            // Set to universal vocal range (accepts all singers)
            this.pitchDetector.setFrequencyRange(
                VOCAL_RANGES.universal.min,
                VOCAL_RANGES.universal.max
            );

            // Detect pitch from audio buffer
            const { frequency, confidence } = this.pitchDetector.detectPitch(buffer);

            // Return frequency if confident enough, 0 otherwise
            if (confidence > 0.8 && frequency > 0) {
                return frequency;
            }

            return 0;
        } catch (error) {
            // Fallback to 0 if Pitchy detection fails
            console.warn('Pitchy pitch detection failed, returning 0:', error);
            return 0;
        }
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
