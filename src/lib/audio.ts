export class AudioController {
  audioCtx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  mediaStream: MediaStream | null = null;
  source: MediaStreamAudioSourceNode | null = null;
  backgroundMusicSource: AudioBufferSourceNode | null = null;

  pitch: number = 0;
  volume: number = 0;
  isSinging: boolean = false;
  currentNote: string = '--';
  currentCents: number = 0;

  async init() {
    if (this.audioCtx && this.mediaStream) return;
    
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      
      this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.source.connect(this.analyser);
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
    } catch (err) {
      console.error("Microphone access denied", err);
      throw err;
    }
  }

  async playBackgroundMusic(url: string) {
    if (!this.audioCtx) return;
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    
    this.backgroundMusicSource = this.audioCtx.createBufferSource();
    this.backgroundMusicSource.buffer = audioBuffer;
    this.backgroundMusicSource.loop = true;
    this.backgroundMusicSource.connect(this.audioCtx.destination);
    this.backgroundMusicSource.start();
  }
  
  stopBackgroundMusic() {
    this.backgroundMusicSource?.stop();
    this.backgroundMusicSource = null;
  }

  async resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  stop() {
    this.mediaStream?.getTracks().forEach(t => t.stop());
    if (this.audioCtx?.state !== 'closed') {
      this.audioCtx?.close();
    }
  }

  update() {
    if (!this.analyser || !this.audioCtx) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    this.volume = rms;

    this.isSinging = rms > 0.015;

    if (this.isSinging) {
      const detectedPitch = this.autoCorrelate(buffer, this.audioCtx.sampleRate);
      if (detectedPitch !== -1) {
        this.pitch = detectedPitch;
        this.updateNote(detectedPitch);
      }
    } else {
      this.currentNote = '--';
      this.currentCents = 0;
    }
  }

  updateNote(frequency: number) {
    if (!isFinite(frequency) || frequency <= 0) {
      this.currentNote = '--';
      this.currentCents = 0;
      return;
    }
    const noteNum = 12 * (Math.log2(frequency / 440)) + 69;
    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const roundedNote = Math.round(noteNum);
    this.currentCents = Math.floor((noteNum - roundedNote) * 100);
    const octave = Math.floor(roundedNote / 12) - 1;
    const noteIndex = ((roundedNote % 12) + 12) % 12;
    const noteName = noteStrings[noteIndex];
    this.currentNote = `${noteName}${octave}`;
  }

  autoCorrelate(buf: Float32Array, sampleRate: number) {
    let SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      let val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
      if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    // Optimization: Only check up to half the buffer size
    const maxPeriod = Math.floor(SIZE / 2);
    let c = new Float32Array(maxPeriod).fill(0);
    for (let i = 0; i < maxPeriod; i++)
      for (let j = 0; j < SIZE - i; j++)
        c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < maxPeriod; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    if (T0 <= 0) return -1;

    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }
}
