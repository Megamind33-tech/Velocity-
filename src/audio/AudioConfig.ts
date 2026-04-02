/**
 * Audio Processing Configuration
 * Tuned for optimal vocal recognition in noisy environments
 */

export const AUDIO_CONFIG = {
  // High-Pass Filter (removes rumble and low-frequency noise)
  highPass: {
    frequency: 80,      // Hz - Cut everything below 80Hz (rumble, wind)
    Q: 0.7,            // Filter steepness
  },

  // Low-Pass Filter (removes high-frequency hiss)
  lowPass: {
    frequency: 12000,   // Hz - Cut everything above 12kHz (hiss, sibilance)
    Q: 0.7,
  },

  // Vocal Presence EQ (peaking filter around vocal fundamentals)
  vocalEQ: {
    frequency: 2000,    // Hz - Peak at 2kHz (vocal clarity)
    gain: 6,            // dB - How much to boost (+6dB)
    Q: 1.5,             // Width of the boost
  },

  // Dynamic Range Compressor (evening out vocal levels)
  compressor: {
    threshold: -40,     // dB - Start compressing above this level
    knee: 40,           // dB - Smoothness of compression curve
    ratio: 3,           // 3:1 compression ratio
    attack: 0.003,      // seconds - How fast to engage
    release: 0.25,      // seconds - How fast to release
  },

  // Noise Gate (suppresses silence and background noise)
  gate: {
    threshold: 0.08,    // RMS level (0-1) - Gate below this value
    attenuation: 0.3,   // Gain reduction when gated (0-1)
  },

  // Analysis settings
  analysis: {
    fftSize: 2048,      // Sample size for frequency analysis
    updateRate: 50,     // Hz - How often to update RMS level
  },
};

/**
 * Preset configurations for different use cases
 */
export const AUDIO_PRESETS = {
  // Balanced for general vocal recognition
  default: {
    vocalBoost: 6,
    noiseReduction: 0.5,
    gateThreshold: 0.08,
  },

  // More aggressive noise reduction for very noisy environments
  noisy: {
    vocalBoost: 8,      // Boost vocals more
    noiseReduction: 0.8, // More aggressive compression
    gateThreshold: 0.12, // Higher gate threshold = more noise reduction
  },

  // Light processing for quiet environments
  clean: {
    vocalBoost: 3,      // Minimal boost
    noiseReduction: 0.2, // Light compression
    gateThreshold: 0.05, // Lower threshold = less gating
  },

  // Maximum vocal enhancement
  voiceOptimized: {
    vocalBoost: 10,     // Maximum boost
    noiseReduction: 0.9, // Maximum compression
    gateThreshold: 0.15, // Aggressive gating
  },
};

/**
 * Frequency bands for visualization
 */
export const FREQUENCY_BANDS = {
  subBass: { min: 20, max: 60, label: 'Sub-Bass' },
  bass: { min: 60, max: 250, label: 'Bass' },
  lowMid: { min: 250, max: 500, label: 'Low-Mid' },
  mid: { min: 500, max: 2000, label: 'Mid' },
  presence: { min: 2000, max: 4000, label: 'Presence' },
  brilliance: { min: 4000, max: 8000, label: 'Brilliance' },
  hiss: { min: 8000, max: 20000, label: 'Hiss' },
};

/**
 * Voice detection thresholds
 */
export const VOICE_DETECTION = {
  // RMS level thresholds
  silence: 0.02,           // Anything below this is silence
  quiet: 0.05,             // Quiet speech
  normal: 0.12,            // Normal speaking level
  loud: 0.25,              // Loud/shouting level
  clipping: 0.95,          // Very close to clipping

  // Pitch detection confidence
  minConfidence: 0.8,      // Minimum confidence to report pitch
  minFrequency: 50,        // Hz - Minimum expected vocal frequency
  maxFrequency: 400,       // Hz - Maximum expected vocal fundamental
};
