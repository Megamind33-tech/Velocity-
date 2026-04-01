// Velocity: World Progression & Level System
// 5 Worlds × ~100 songs per world × 20 levels per song = 8,000+ levels

export interface World {
  id: number;
  name: string;
  description: string;
  minSongsToUnlock: number; // Beat N songs in previous world
  difficulty: 'novice' | 'intermediate' | 'advanced' | 'master' | 'legend';
  targetAudience: string;
  levelsPerSong: number;
  totalSongs: number;
}

export interface LevelChallenge {
  level: number;
  name: string;
  description: string;
  targetType: 'accuracy' | 'combo' | 'speed' | 'smoothness' | 'vibrato' | 'legato' | 'dynamics' | 'endurance' | 'precision' | 'expression';
  targetValue: number | string;
  hitZones: number; // In semitones
  tempo: number; // % of normal (100 = normal, 120 = 20% faster)
  timeLimit?: number; // In seconds, if applicable
  modifiers: string[]; // ['strict', 'blind', 'ironwill', etc]
  baseXP: number;
  difficultyStars: number; // 1-6 stars for difficulty
}

export interface PlayerProgress {
  currentWorld: number;
  songsCompletedInWorld: number; // Out of minSongsToUnlock
  currentSong?: string;
  currentLevel?: number;
  totalXP: number;
  totalStars: number;
  achievements: string[];
  unlockedCosmetics: string[];
}

// WORLD DEFINITIONS
export const WORLDS: World[] = [
  {
    id: 1,
    name: 'NOVICE SKIES',
    description: 'Begin your vocal journey with simple melodies and basic note matching',
    minSongsToUnlock: 3,
    difficulty: 'novice',
    targetAudience: 'Beginners - just learning pitch control',
    levelsPerSong: 10, // Levels 1-10 in World 1
    totalSongs: 80,
  },
  {
    id: 2,
    name: 'INTERMEDIATE AIRWAYS',
    description: 'Advance to melodic songs with wider vocal range and technical requirements',
    minSongsToUnlock: 3, // Beat any 3 songs in World 1
    difficulty: 'intermediate',
    targetAudience: 'Progressing singers - building technique',
    levelsPerSong: 15, // Levels 1-15 in World 2
    totalSongs: 100,
  },
  {
    id: 3,
    name: 'ADVANCED ALTITUDES',
    description: 'Master complex melodies with rapid note changes and smooth transitions',
    minSongsToUnlock: 3, // Beat any 3 songs in World 2
    difficulty: 'advanced',
    targetAudience: 'Intermediate singers - advanced control',
    levelsPerSong: 15,
    totalSongs: 100,
  },
  {
    id: 4,
    name: 'MASTER FLIGHT',
    description: 'Professional vocal training with vibrato mastery and expression control',
    minSongsToUnlock: 3, // Beat any 3 songs in World 3
    difficulty: 'master',
    targetAudience: 'Advanced singers - professional techniques',
    levelsPerSong: 18,
    totalSongs: 60,
  },
  {
    id: 5,
    name: 'LEGENDARY HEIGHTS',
    description: 'The ultimate challenge - operatic ranges, perfect intonation, and complete expression',
    minSongsToUnlock: 3, // Beat any 3 songs in World 4
    difficulty: 'legend',
    targetAudience: 'Professional singers - perfection training',
    levelsPerSong: 20,
    totalSongs: 60,
  },
];

// LEVEL CHALLENGE DEFINITIONS
export const LEVEL_CHALLENGES: { [key: number]: LevelChallenge } = {
  1: {
    level: 1,
    name: 'Accuracy Starter',
    description: 'Hit 75% of notes correctly - gentle introduction',
    targetType: 'accuracy',
    targetValue: 75,
    hitZones: 3, // ±3 semitones = very forgiving
    tempo: 100,
    modifiers: ['forgiving'],
    baseXP: 50,
    difficultyStars: 1,
  },
  2: {
    level: 2,
    name: 'Perfect Notes',
    description: 'Zero misses allowed - must hit every note',
    targetType: 'accuracy',
    targetValue: 100,
    hitZones: 2,
    tempo: 100,
    timeLimit: 180,
    modifiers: ['strict', 'oneshot'],
    baseXP: 100,
    difficultyStars: 2,
  },
  3: {
    level: 3,
    name: 'Combo Master',
    description: 'Chain 15+ correct notes in a row without breaking',
    targetType: 'combo',
    targetValue: 15,
    hitZones: 2,
    tempo: 100,
    modifiers: ['combo'],
    baseXP: 100,
    difficultyStars: 2,
  },
  4: {
    level: 4,
    name: 'Speed Run',
    description: 'Complete the song in 90 seconds - fast-paced challenge',
    targetType: 'speed',
    targetValue: 90,
    hitZones: 2,
    tempo: 120,
    timeLimit: 90,
    modifiers: ['timer', 'speed'],
    baseXP: 100,
    difficultyStars: 2,
  },
  5: {
    level: 5,
    name: 'Smooth Flight',
    description: 'Eliminate jerky pitch transitions - fly smoothly between notes',
    targetType: 'smoothness',
    targetValue: 95,
    hitZones: 2,
    tempo: 100,
    modifiers: ['smoothness'],
    baseXP: 100,
    difficultyStars: 2,
  },
  6: {
    level: 6,
    name: 'Vibrato Mastery',
    description: 'Use vibrato correctly 3+ times in designated zones',
    targetType: 'vibrato',
    targetValue: 3,
    hitZones: 2,
    tempo: 100,
    modifiers: ['vibrato'],
    baseXP: 100,
    difficultyStars: 2,
  },
  7: {
    level: 7,
    name: 'Legato Control',
    description: 'Sing with perfect legato - smooth, connected note transitions',
    targetType: 'legato',
    targetValue: 90,
    hitZones: 1.5,
    tempo: 100,
    modifiers: ['legato'],
    baseXP: 150,
    difficultyStars: 2,
  },
  8: {
    level: 8,
    name: 'Dynamic Expression',
    description: 'Perform dynamic range - soft passages then loud sections',
    targetType: 'dynamics',
    targetValue: 80,
    hitZones: 2,
    tempo: 100,
    modifiers: ['dynamics'],
    baseXP: 150,
    difficultyStars: 2,
  },
  9: {
    level: 9,
    name: 'Endurance Master',
    description: 'Maintain vocal quality throughout - no fatigue degradation',
    targetType: 'endurance',
    targetValue: 85,
    hitZones: 2,
    tempo: 100,
    modifiers: ['endurance'],
    baseXP: 150,
    difficultyStars: 3,
  },
  10: {
    level: 10,
    name: 'Novice Perfection',
    description: 'All targets combined - 85% accuracy + smooth + good combo',
    targetType: 'accuracy',
    targetValue: 85,
    hitZones: 1.5,
    tempo: 100,
    modifiers: ['multi'],
    baseXP: 200,
    difficultyStars: 3,
  },
  11: {
    level: 11,
    name: 'Advanced Combo',
    description: 'Chain 20+ notes in a row - intermediate difficulty',
    targetType: 'combo',
    targetValue: 20,
    hitZones: 1,
    tempo: 110,
    modifiers: ['combo', 'harder'],
    baseXP: 200,
    difficultyStars: 3,
  },
  12: {
    level: 12,
    name: 'Daily Challenge',
    description: 'Special modifier that changes daily - community challenge',
    targetType: 'accuracy',
    targetValue: 80,
    hitZones: 1,
    tempo: 100,
    modifiers: ['random', 'community'],
    baseXP: 250,
    difficultyStars: 3,
  },
  13: {
    level: 13,
    name: 'Expert Accuracy',
    description: '95% accuracy required - tight precision needed',
    targetType: 'accuracy',
    targetValue: 95,
    hitZones: 0.75,
    tempo: 100,
    modifiers: ['strict', 'expert'],
    baseXP: 250,
    difficultyStars: 3,
  },
  14: {
    level: 14,
    name: 'Speed Demon',
    description: 'Sing at 120% tempo - faster, more challenging',
    targetType: 'speed',
    targetValue: 120,
    hitZones: 1.5,
    tempo: 120,
    modifiers: ['speed', 'fast'],
    baseXP: 300,
    difficultyStars: 4,
  },
  15: {
    level: 15,
    name: 'Master Challenge',
    description: 'All techniques combined - 90% accuracy + smooth + vibrato',
    targetType: 'accuracy',
    targetValue: 90,
    hitZones: 1,
    tempo: 100,
    modifiers: ['multi', 'master'],
    baseXP: 300,
    difficultyStars: 4,
  },
  16: {
    level: 16,
    name: 'Blind Challenge',
    description: 'No visual aids - rely on ear training and musical knowledge',
    targetType: 'precision',
    targetValue: 85,
    hitZones: 1,
    tempo: 100,
    modifiers: ['blind', 'noui'],
    baseXP: 350,
    difficultyStars: 4,
  },
  17: {
    level: 17,
    name: 'Iron Will',
    description: 'One miss = instant failure - ultimate precision test',
    targetType: 'accuracy',
    targetValue: 100,
    hitZones: 1,
    tempo: 100,
    modifiers: ['ironwill', 'oneshot'],
    baseXP: 400,
    difficultyStars: 5,
  },
  18: {
    level: 18,
    name: 'Perfect Intonation',
    description: '±0.25 semitone accuracy - professional standard',
    targetType: 'precision',
    targetValue: 98,
    hitZones: 0.25,
    tempo: 100,
    modifiers: ['perfect', 'professional'],
    baseXP: 400,
    difficultyStars: 5,
  },
  19: {
    level: 19,
    name: 'Legendary Performance',
    description: '98% accuracy + perfect expression + zero jerky transitions',
    targetType: 'expression',
    targetValue: 98,
    hitZones: 0.5,
    tempo: 100,
    modifiers: ['legend', 'expression'],
    baseXP: 500,
    difficultyStars: 5,
  },
  20: {
    level: 20,
    name: 'The Ultimate Challenge',
    description: 'Everything combined - perfection across all dimensions',
    targetType: 'accuracy',
    targetValue: 100,
    hitZones: 0.25,
    tempo: 150, // Even faster!
    timeLimit: undefined,
    modifiers: ['ultimate', 'extreme', 'all'],
    baseXP: 1000,
    difficultyStars: 6,
  },
};

// PROGRESSION HELPER FUNCTIONS
export function getWorldInfo(worldId: number): World | undefined {
  return WORLDS.find(w => w.id === worldId);
}

export function getLevelInfo(levelNumber: number): LevelChallenge | undefined {
  return LEVEL_CHALLENGES[levelNumber];
}

export function canUnlockNextWorld(currentWorld: number, songsCompletedInWorld: number): boolean {
  const world = getWorldInfo(currentWorld);
  if (!world) return false;
  return songsCompletedInWorld >= world.minSongsToUnlock;
}

export function getTotalLevelsInGame(): number {
  // World 1: 80 songs × 10 levels = 800
  // World 2: 100 songs × 15 levels = 1,500
  // World 3: 100 songs × 15 levels = 1,500
  // World 4: 60 songs × 18 levels = 1,080
  // World 5: 60 songs × 20 levels = 1,200
  // TOTAL: 6,080 levels
  return 800 + 1500 + 1500 + 1080 + 1200;
}

export function calculateXPMultiplier(
  streakDays: number,
  difficulty: 'novice' | 'intermediate' | 'advanced' | 'master' | 'legend',
  worldNumber: number
): number {
  let multiplier = 1.0;

  // Daily streak bonus (1.1x to 2.5x)
  multiplier *= Math.min(1.1 + streakDays * 0.05, 2.5);

  // World difficulty multiplier
  const diffMultipliers = {
    novice: 1.0,
    intermediate: 1.25,
    advanced: 1.5,
    master: 1.75,
    legend: 2.0,
  };
  multiplier *= diffMultipliers[difficulty];

  return multiplier;
}

export default {
  WORLDS,
  LEVEL_CHALLENGES,
  getWorldInfo,
  getLevelInfo,
  canUnlockNextWorld,
  getTotalLevelsInGame,
  calculateXPMultiplier,
};
