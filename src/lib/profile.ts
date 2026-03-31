export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: number; // XP
  isDaily?: boolean;
}

export interface PlayerProfile {
  username: string;
  level: number;
  xp: number;
  totalScore: number;
  songsPlayed: number;
  perfectGates: number;
  highScores: Record<string, number>; // songId_difficulty -> score
  challenges: Challenge[];
  dailyChallenge?: Challenge;
  lastDailyChallengeDate?: string;
}

import { ACHIEVEMENTS } from './achievements';

export const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'First Flight', description: 'Play your first song', target: 1, progress: 0, completed: false, reward: 100 },
  { id: 'c2', title: 'High Scorer', description: 'Score over 10,000 in a single run', target: 10000, progress: 0, completed: false, reward: 500 },
  { id: 'c3', title: 'Elite Pilot', description: 'Play 5 games on Hard difficulty', target: 5, progress: 0, completed: false, reward: 1000 },
  { id: 'c4', title: 'Perfect Pitch', description: 'Pass 50 gates perfectly', target: 50, progress: 0, completed: false, reward: 800 },
  { id: 'c5', title: 'Combo Master', description: 'Reach a combo of 20', target: 20, progress: 0, completed: false, reward: 600 },
  ...ACHIEVEMENTS,
];

const DAILY_CHALLENGE_OPTIONS = [
  { title: 'Early Bird', description: 'Play 3 songs', target: 3, reward: 500 },
  { title: 'Night Owl', description: 'Play 3 songs', target: 3, reward: 500 },
  { title: 'Perfect Streak', description: 'Get 10 perfect gates in one run', target: 10, reward: 750 },
  { title: 'High Flyer', description: 'Reach a score of 20,000', target: 20000, reward: 1000 },
];

export const generateDailyChallenge = (): Challenge => {
  const challenge = DAILY_CHALLENGE_OPTIONS[Math.floor(Math.random() * DAILY_CHALLENGE_OPTIONS.length)];
  return {
    id: 'daily',
    ...challenge,
    progress: 0,
    completed: false,
    isDaily: true,
  };
};

export const loadProfile = (): PlayerProfile => {
  const stored = localStorage.getItem('vocal_flight_profile');
  let profile: PlayerProfile;
  if (stored) {
    try {
      profile = JSON.parse(stored);
      
      // Ensure all required properties exist
      if (!profile.challenges) profile.challenges = [];
      if (!profile.highScores) profile.highScores = {};
      if (profile.xp === undefined) profile.xp = 0;
      if (profile.level === undefined) profile.level = 1;
      
      // Merge new challenges if any
      const existingChallengeIds = new Set(profile.challenges.map((c: Challenge) => c.id));
      const newChallenges = DEFAULT_CHALLENGES.filter(c => !existingChallengeIds.has(c.id));
      if (newChallenges.length > 0) {
        profile.challenges = [...profile.challenges, ...newChallenges];
      }
    } catch (e) {
      console.error('Failed to parse profile', e);
      profile = createDefaultProfile();
    }
  } else {
    profile = createDefaultProfile();
  }

  // Daily challenge logic
  const today = new Date().toDateString();
  if (profile.lastDailyChallengeDate !== today) {
    profile.dailyChallenge = generateDailyChallenge();
    profile.lastDailyChallengeDate = today;
    saveProfile(profile);
  }

  return profile;
};

const createDefaultProfile = (): PlayerProfile => ({
  username: 'Guest Pilot',
  level: 1,
  xp: 0,
  totalScore: 0,
  songsPlayed: 0,
  perfectGates: 0,
  highScores: {},
  challenges: [...DEFAULT_CHALLENGES],
  dailyChallenge: generateDailyChallenge(),
  lastDailyChallengeDate: new Date().toDateString(),
});

export const saveProfile = (profile: PlayerProfile) => {
  localStorage.setItem('vocal_flight_profile', JSON.stringify(profile));
};

export const updateChallengeProgress = (profile: PlayerProfile, challengeId: string, amount: number, isAbsolute: boolean = false) => {
  let challenge = profile.challenges.find(c => c.id === challengeId);
  if (!challenge && profile.dailyChallenge?.id === challengeId) {
    challenge = profile.dailyChallenge;
  }
  
  if (challenge && !challenge.completed) {
    if (isAbsolute) {
      challenge.progress = Math.max(challenge.progress, amount);
    } else {
      challenge.progress += amount;
    }
    
    if (challenge.progress >= challenge.target) {
      challenge.progress = challenge.target;
      challenge.completed = true;
      addXp(profile, challenge.reward);
    }
  }
};

export const addXp = (profile: PlayerProfile, amount: number) => {
  profile.xp += amount;
  const xpNeeded = profile.level * 1000;
  if (profile.xp >= xpNeeded) {
    profile.level += 1;
    profile.xp -= xpNeeded;
  }
};
