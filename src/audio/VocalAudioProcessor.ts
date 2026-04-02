import { EventBus } from '../events/EventBus';

/**
 * VocalAudioProcessor: Advanced audio processing for vocal enhancement
 * Uses Web Audio API with multiple noise reduction strategies:
 * - High-pass filter to remove sub-100Hz rumble/noise
 * - Parametric EQ to boost vocal frequencies (500Hz-5000Hz)
 * - Gate/threshold to suppress silence and background noise
 * - Compressor for consistent vocal levels
 */
export class VocalAudioProcessor {
    private static instance: VocalAudioProcessor;

    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private analyser: AnalyserNode | null = null;

    // Filter chain nodes
    private highPassFilter: BiquadFilterNode | null = null;
    private lowPassFilter: BiquadFilterNode | null = null;
    private vocalBoostEQ: BiquadFilterNode | null = null;
    private compressor: DynamicsCompressor | null = null;
    private noiseGate: GainNode | null = null;

    // Analysis
    private frequencyData: Uint8Array | null = null;
    private rmsValue: number = 0;
    private enabled: boolean = false;

    private constructor() {}

    /**
     * Get singleton instance
     */
    public static getInstance(): VocalAudioProcessor {
        if (!VocalAudioProcessor.instance) {
            VocalAudioProcessor.instance = new VocalAudioProcessor();
        }
        return VocalAudioProcessor.instance;
    }

    /**
     * Initialize the audio processor with a media stream
     * Should be called after microphone permission is granted
     */
    public async init(mediaStream: MediaStream): Promise<boolean> {
        try {
            this.mediaStream = mediaStream;
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create source from microphone
            this.sourceNode = this.audioContext.createMediaStreamSource(mediaStream);

            // Create analysis node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            // Build filter chain: Source → HighPass → LowPass → VocalEQ → Compressor → NoiseGate → Analyser
            this.setupFilters();

            // Connect the chain
            this.sourceNode.connect(this.highPassFilter!);
            this.highPassFilter!.connect(this.lowPassFilter!);
            this.lowPassFilter!.connect(this.vocalBoostEQ!);
            this.vocalBoostEQ!.connect(this.compressor!);
            this.compressor!.connect(this.noiseGate!);
            this.noiseGate!.connect(this.analyser!);

            // Connect to destination for audio output (optional - for monitoring)
            this.analyser!.connect(this.audioContext.destination);

            this.enabled = true;
            console.log('✓ VocalAudioProcessor initialized successfully');
            return true;
        } catch (error) {
            console.error('✗ Failed to initialize VocalAudioProcessor:', error);
            return false;
        }
    }

    /**
     * Setup all audio filters in the processing chain
     */
    private setupFilters(): void {
        if (!this.audioContext) return;

        // 1. High-Pass Filter: Remove rumble and low-frequency noise (< 80Hz)
        // Cuts sub-bass noise, wind noise, room rumble
        this.highPassFilter = this.audioContext.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.value = 80;  // 80Hz cutoff
        this.highPassFilter.Q.value = 0.7;

        // 2. Low-Pass Filter: Remove high-frequency hiss (> 12kHz)
        // Natural human voice doesn't extend much above 12kHz
        this.lowPassFilter = this.audioContext.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = 12000;  // 12kHz cutoff
        this.lowPassFilter.Q.value = 0.7;

        // 3. Vocal Boost EQ: Peaking filter at 2kHz (vocal clarity range)
        // Vocals sit around 1kHz-4kHz; boost at 2kHz enhances intelligibility
        this.vocalBoostEQ = this.audioContext.createBiquadFilter();
        this.vocalBoostEQ.type = 'peaking';
        this.vocalBoostEQ.frequency.value = 2000;  // 2kHz (vocal presence peak)
        this.vocalBoostEQ.gain.value = 6;  // +6dB boost
        this.vocalBoostEQ.Q.value = 1.5;  // Moderate width

        // 4. Compressor: Even out vocal dynamics
        // Prevents clipping and maintains consistent levels
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -40;  // Compress above -40dB
        this.compressor.knee.value = 40;  // Smooth compression curve
        this.compressor.ratio.value = 3;  // 3:1 compression
        this.compressor.attack.value = 0.003;  // 3ms attack (quick)
        this.compressor.release.value = 0.25;  // 250ms release (smooth)

        // 5. Noise Gate: Attenuate silence and very quiet noise
        // Reduces background noise floor when voice is quiet/absent
        this.noiseGate = this.audioContext.createGain();
        this.noiseGate.gain.value = 1.0;  // Will be modulated by gate logic
    }

    /**
     * Update the noise gate based on current RMS level
     * This suppresses very quiet background noise while allowing voice through
     */
    public updateNoiseGate(): void {
        if (!this.analyser || !this.noiseGate) return;

        this.analyser.getByteFrequencyData(this.frequencyData!);

        // Calculate RMS from frequency data (approximate)
        let sum = 0;
        for (let i = 0; i < this.frequencyData!.length; i++) {
            const normalized = this.frequencyData![i] / 255;
            sum += normalized * normalized;
        }
        this.rmsValue = Math.sqrt(sum / this.frequencyData!.length);

        // Gate threshold: if RMS is below threshold, reduce gain
        const gateThreshold = 0.08;  // ~8% of max level
        const gateAttenuation = 0.3;  // Reduce to 30% gain when below threshold

        if (this.rmsValue < gateThreshold) {
            this.noiseGate.gain.value = gateAttenuation;
        } else {
            this.noiseGate.gain.value = 1.0;
        }
    }

    /**
     * Get current RMS (loudness) value
     */
    public getRMSLevel(): number {
        return this.rmsValue;
    }

    /**
     * Get frequency spectrum data for visualization
     */
    public getFrequencyData(): Uint8Array | null {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.frequencyData!);
        return this.frequencyData;
    }

    /**
     * Adjust vocal EQ boost (0 = no boost, 12 = max boost in dB)
     */
    public setVocalBoost(gainDB: number): void {
        if (this.vocalBoostEQ) {
            this.vocalBoostEQ.gain.value = Math.max(0, Math.min(12, gainDB));
        }
    }

    /**
     * Adjust compressor threshold for more aggressive noise reduction
     */
    public setNoiseReductionLevel(level: number): void {
        // level: 0 = no compression, 1 = max compression
        if (this.compressor) {
            const threshold = -40 + (level * 30);  // Ranges from -40 to -10dB
            this.compressor.threshold.value = threshold;
        }
    }

    /**
     * Toggle all audio processing on/off
     */
    public setEnabled(enabled: boolean): void {
        if (!this.noiseGate) return;
        this.enabled = enabled;
        this.noiseGate.gain.value = enabled ? 1.0 : 0.0;
        console.log(`VocalAudioProcessor: ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get current processing state
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Cleanup and disconnect
     */
    public async cleanup(): Promise<void> {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }

        if (this.audioContext && this.audioContext.state !== 'closed') {
            await this.audioContext.close();
        }

        this.audioContext = null;
        this.sourceNode = null;
        this.analyser = null;
        this.highPassFilter = null;
        this.lowPassFilter = null;
        this.vocalBoostEQ = null;
        this.compressor = null;
        this.noiseGate = null;
        this.mediaStream = null;

        console.log('✓ VocalAudioProcessor cleaned up');
    }
}
