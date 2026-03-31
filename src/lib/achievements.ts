import { Challenge } from './profile';

export const ACHIEVEMENTS: Challenge[] = [
  // Songs Played
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `songs_played_${i + 1}`,
    title: `Flight Veteran ${i + 1}`,
    description: `Play ${ (i + 1) * 5 } songs`,
    target: (i + 1) * 5,
    progress: 0,
    completed: false,
    reward: (i + 1) * 100,
  })),
  // Perfect Gates
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `perfect_gates_${i + 1}`,
    title: `Precision Pilot ${i + 1}`,
    description: `Pass ${ (i + 1) * 10 } gates perfectly`,
    target: (i + 1) * 10,
    progress: 0,
    completed: false,
    reward: (i + 1) * 150,
  })),
  // Score Milestones
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `score_milestone_${i + 1}`,
    title: `High Score ${i + 1}`,
    description: `Reach a score of ${ (i + 1) * 5000 }`,
    target: (i + 1) * 5000,
    progress: 0,
    completed: false,
    reward: (i + 1) * 200,
  })),
  // Combo Streaks
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `combo_streak_${i + 1}`,
    title: `Combo Streak ${i + 1}`,
    description: `Reach a combo of ${ (i + 1) * 10 }`,
    target: (i + 1) * 10,
    progress: 0,
    completed: false,
    reward: (i + 1) * 50,
  })),
];
