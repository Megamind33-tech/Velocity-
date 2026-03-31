export interface BackgroundTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const BACKGROUND_MUSIC: BackgroundTrack[] = [
  {
    id: 'ambient-1',
    title: 'Ambient Space',
    artist: 'Cosmic Sounds',
    url: 'https://example.com/ambient1.mp3'
  },
  {
    id: 'synthwave-1',
    title: 'Neon Nights',
    artist: 'Synthwave Master',
    url: 'https://example.com/synthwave1.mp3'
  },
  {
    id: 'lofi-1',
    title: 'Study Beats',
    artist: 'Lofi Girl',
    url: 'https://example.com/lofi1.mp3'
  }
];
