/**
 * Manages WebAudio API lifecycle for capturing microphone input.
 * Extracts volume (RMS) and frequency for flight control.
 */
export class VoiceInputManager {
    private static instance: VoiceInputManager;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private dataArray: Uint8Array | null = null;

    private _volume: number = 0;
    private _frequency: number = 0;
    private _isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): VoiceInputManager {
        if (!VoiceInputManager.instance) {
            VoiceInputManager.instance = new VoiceInputManager();
        }
        return VoiceInputManager.instance;
    }

    /**
     * Initializes the audio context. Must be called after a user gesture.
     */
    public async init(): Promise<boolean> {
        if (this._isInitialized) return true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this._isInitialized = true;
            console.log('VoiceInputManager: Audio context initialized.');
            return true;
        } catch (err) {
            console.error('VoiceInputManager: Permission denied or no microphone found.', err);
            return false;
        }
    }

    /**
     * Poll-based update to read current audio levels.
     */
    public update(): void {
        if (!this._isInitialized || !this.analyser || !this.dataArray) return;

        this.analyser.getByteFrequencyData(this.dataArray as any);
        
        // 1. Calculate Average Volume (0 to 1)
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        this._volume = sum / (this.dataArray.length * 255);

        // 2. Simple "Dominant Frequency" estimation for pitch
        let maxVal = -1;
        let maxIndex = -1;
        for (let i = 0; i < this.dataArray.length; i++) {
            if (this.dataArray[i] > maxVal) {
                maxVal = this.dataArray[i];
                maxIndex = i;
            }
        }
        // Map frequency bin index to something useful
        this._frequency = maxIndex / this.dataArray.length;
    }

    public get volume(): number { return this._volume; }
    public get frequency(): number { return this._frequency; }
    public get isInitialized(): boolean { return this._isInitialized; }
}
