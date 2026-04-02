/**
 * PitchDetector: McLeod Pitch Method using Pitchy library
 *
 * Replaces the basic YIN autocorrelation with Pitchy's superior pitch detection.
 * McLeod method is optimized for:
 * - Vocal singing (primary use case)
 * - Real-time performance
 * - Accuracy within ±5Hz
 * - Low latency
 */

import { PitchDetector as PitchyDetector } from 'pitchy';

/**
 * Wrapper around Pitchy's McLeod pitch detection algorithm
 */
export class PitchDetector {
    private pitchyDetector: PitchyDetector<Float32Array>;
    private sampleRate: number;

    // Pitch detection thresholds
    private minFrequency: number = 50;      // Minimum expected vocal frequency (Hz)
    private maxFrequency: number = 400;     // Maximum expected vocal fundamental (Hz)
    private minConfidence: number = 0.8;    // Minimum confidence (0-1) to report pitch

    constructor(sampleRate: number, bufferLength: number = 4096) {
        this.sampleRate = sampleRate;
        // Create Pitchy's PitchDetector instance using the static factory method
        // forFloat32Array requires the input buffer length (typically FFT size)
        this.pitchyDetector = PitchyDetector.forFloat32Array(bufferLength);
    }

    /**
     * Detect pitch using Pitchy's McLeod algorithm
     * Returns: { frequency (Hz), confidence (0-1) }
     */
    public detectPitch(audioBuffer: Float32Array): { frequency: number; confidence: number } {
        try {
            // Pitchy returns [frequency, clarity] where clarity is confidence
            const [frequency, clarity] = this.pitchyDetector.findPitch(audioBuffer, this.sampleRate);

            // Validate detected pitch
            if (!this.isValidPitch(frequency, clarity)) {
                return { frequency: 0, confidence: 0 };
            }

            return {
                frequency: frequency,
                confidence: clarity,
            };
        } catch (error) {
            console.warn('PitchDetector: Error during pitch detection', error);
            return { frequency: 0, confidence: 0 };
        }
    }

    /**
     * Validate if detected pitch is within expected vocal range
     */
    private isValidPitch(frequency: number, confidence: number): boolean {
        // Must have sufficient confidence
        if (confidence < this.minConfidence) {
            return false;
        }

        // Must be within expected vocal range
        if (frequency < this.minFrequency || frequency > this.maxFrequency) {
            return false;
        }

        // Must be a valid number
        if (isNaN(frequency) || !isFinite(frequency)) {
            return false;
        }

        return true;
    }

    /**
     * Set minimum confidence threshold (0-1)
     * Higher = stricter, fewer false positives but may miss quiet notes
     */
    public setMinConfidence(confidence: number): void {
        this.minConfidence = Math.max(0, Math.min(1, confidence));
    }

    /**
     * Set vocal frequency range bounds
     */
    public setFrequencyRange(minHz: number, maxHz: number): void {
        this.minFrequency = Math.max(20, minHz);
        this.maxFrequency = Math.min(20000, maxHz);
    }

    /**
     * Get current detection parameters for debugging
     */
    public getDebugInfo(): string {
        return `Pitchy Detector: Min=${this.minFrequency}Hz, Max=${this.maxFrequency}Hz, Confidence=${this.minConfidence.toFixed(2)}`;
    }
}

/**
 * Standard vocal frequency ranges for reference
 */
export const VOCAL_RANGES = {
    // Fundamental frequency ranges (Hz)
    soprano: { min: 250, max: 400 },      // High female voice
    alto: { min: 200, max: 300 },         // Mid-high female voice
    tenor: { min: 130, max: 250 },        // High male voice
    baritone: { min: 100, max: 160 },     // Mid male voice
    bass: { min: 80, max: 120 },          // Low male voice

    // Unified ranges for game
    child: { min: 150, max: 300 },        // Children (high)
    female: { min: 150, max: 300 },       // Female voices
    male: { min: 80, max: 180 },          // Male voices
    universal: { min: 50, max: 400 },     // Accept all vocals
};

