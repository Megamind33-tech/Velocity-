export interface LyricNote {
  word: string;
  note: number; // MIDI note number
  duration?: number; // Duration in beats, optional for now
  phraseStart?: boolean; // New property
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  sequence: LyricNote[];
  type: 'easy' | 'medium' | 'hard';
  difficulty: 'easy' | 'medium' | 'hard';
  tempo: number; // BPM
}

export const SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    type: 'easy',
    difficulty: 'easy',
    tempo: 100,
    sequence: [
      { word: 'Twin-', note: 60, duration: 1, phraseStart: true }, // C4
      { word: '-kle', note: 60, duration: 1 },
      { word: 'twin-', note: 67, duration: 1 }, // G4
      { word: '-kle', note: 67, duration: 1 },
      { word: 'lit-', note: 69, duration: 1 }, // A4
      { word: '-tle', note: 69, duration: 1 },
      { word: 'star', note: 67, duration: 2 }, // G4
      { word: 'How', note: 65, duration: 1, phraseStart: true }, // F4
      { word: 'I', note: 65, duration: 1 },
      { word: 'won-', note: 64, duration: 1 }, // E4
      { word: '-der', note: 64, duration: 1 },
      { word: 'what', note: 62, duration: 1 }, // D4
      { word: 'you', note: 62, duration: 1 },
      { word: 'are', note: 60, duration: 2 }, // C4
      { word: 'Up', note: 67, duration: 1, phraseStart: true }, // G4
      { word: 'a-', note: 67, duration: 1 },
      { word: '-bove', note: 65, duration: 1 }, // F4
      { word: 'the', note: 65, duration: 1 },
      { word: 'world', note: 64, duration: 1 }, // E4
      { word: 'so', note: 64, duration: 1 },
      { word: 'high', note: 62, duration: 2 }, // D4
      { word: 'Like', note: 67, duration: 1, phraseStart: true }, // G4
      { word: 'a', note: 67, duration: 1 },
      { word: 'dia-', note: 65, duration: 1 }, // F4
      { word: '-mond', note: 65, duration: 1 },
      { word: 'in', note: 64, duration: 1 }, // E4
      { word: 'the', note: 64, duration: 1 },
      { word: 'sky', note: 62, duration: 2 }, // D4
      { word: 'Twin-', note: 60, duration: 1, phraseStart: true }, // C4
      { word: '-kle', note: 60, duration: 1 },
      { word: 'twin-', note: 67, duration: 1 }, // G4
      { word: '-kle', note: 67, duration: 1 },
      { word: 'lit-', note: 69, duration: 1 }, // A4
      { word: '-tle', note: 69, duration: 1 },
      { word: 'star', note: 67, duration: 2 }, // G4
      { word: 'How', note: 65, duration: 1, phraseStart: true }, // F4
      { word: 'I', note: 65, duration: 1 },
      { word: 'won-', note: 64, duration: 1 }, // E4
      { word: '-der', note: 64, duration: 1 },
      { word: 'what', note: 62, duration: 1 }, // D4
      { word: 'you', note: 62, duration: 1 },
      { word: 'are', note: 60, duration: 2 }, // C4
    ]
  },
  {
    id: 'row-boat',
    title: 'Row Your Boat',
    artist: 'Traditional',
    type: 'easy',
    difficulty: 'easy',
    tempo: 80,
    sequence: [
      { word: 'Row', note: 60 },
      { word: 'row', note: 60 },
      { word: 'row', note: 60 },
      { word: 'your', note: 62 },
      { word: 'boat', note: 64 },
      { word: 'Gen-', note: 64 },
      { word: '-tly', note: 62 },
      { word: 'down', note: 64 },
      { word: 'the', note: 65 },
      { word: 'stream', note: 67 },
      { word: 'Mer-', note: 72 }, // C5
      { word: '-ri-', note: 72 },
      { word: '-ly', note: 72 },
      { word: 'mer-', note: 67 }, // G4
      { word: '-ri-', note: 67 },
      { word: '-ly', note: 67 },
      { word: 'mer-', note: 64 }, // E4
      { word: '-ri-', note: 64 },
      { word: '-ly', note: 64 },
      { word: 'mer-', note: 60 }, // C4
      { word: '-ri-', note: 60 },
      { word: '-ly', note: 60 },
      { word: 'life', note: 67 }, // G4
      { word: 'is', note: 65 }, // F4
      { word: 'but', note: 64 }, // E4
      { word: 'a', note: 62 }, // D4
      { word: 'dream', note: 60 }, // C4
    ]
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    type: 'medium',
    difficulty: 'medium',
    tempo: 110,
    sequence: [
      { word: 'Joy', note: 64 },
      { word: 'ful', note: 64 },
      { word: 'joy', note: 65 },
      { word: 'ful', note: 67 },
      { word: 'we', note: 67 },
      { word: 'a-', note: 65 },
      { word: '-dore', note: 64 },
      { word: 'thee', note: 62 },
      { word: 'God', note: 60 },
      { word: 'of', note: 60 },
      { word: 'glo-', note: 62 },
      { word: '-ry', note: 64 },
      { word: 'Lord', note: 64 },
      { word: 'of', note: 62 },
      { word: 'love', note: 62 },
      { word: 'Hearts', note: 64 },
      { word: 'un-', note: 64 },
      { word: '-fold', note: 65 },
      { word: 'like', note: 67 },
      { word: 'flow-', note: 67 },
      { word: '-ers', note: 65 },
      { word: 'be-', note: 64 },
      { word: '-fore', note: 62 },
      { word: 'thee', note: 60 },
      { word: 'o-', note: 60 },
      { word: '-pening', note: 62 },
      { word: 'to', note: 64 },
      { word: 'the', note: 62 },
      { word: 'sun', note: 60 },
      { word: 'a-', note: 60 },
      { word: '-bove', note: 60 },
    ]
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    type: 'medium',
    difficulty: 'medium',
    tempo: 120,
    sequence: [
      { word: 'Hap-', note: 60 }, // C4
      { word: '-py', note: 60 },
      { word: 'birth-', note: 62 }, // D4
      { word: '-day', note: 60 }, // C4
      { word: 'to', note: 65 }, // F4
      { word: 'you', note: 64 }, // E4
      { word: 'Hap-', note: 60 }, // C4
      { word: '-py', note: 60 },
      { word: 'birth-', note: 62 }, // D4
      { word: '-day', note: 60 }, // C4
      { word: 'to', note: 67 }, // G4
      { word: 'you', note: 65 }, // F4
      { word: 'Hap-', note: 60 }, // C4
      { word: '-py', note: 60 },
      { word: 'birth-', note: 72 }, // C5
      { word: '-day', note: 69 }, // A4
      { word: 'dear', note: 65 }, // F4
      { word: 'play-', note: 64 }, // E4
      { word: '-er', note: 62 }, // D4
      { word: 'Hap-', note: 70 }, // Bb4
      { word: '-py', note: 70 },
      { word: 'birth-', note: 69 }, // A4
      { word: '-day', note: 65 }, // F4
      { word: 'to', note: 67 }, // G4
      { word: 'you', note: 65 }, // F4
    ]
  },
  {
    id: 'mary-lamb',
    title: 'Mary Had a Little Lamb',
    artist: 'Traditional',
    type: 'medium',
    difficulty: 'medium',
    tempo: 90,
    sequence: [
      { word: 'Ma-', note: 64 }, // E4
      { word: '-ry', note: 62 }, // D4
      { word: 'had', note: 60 }, // C4
      { word: 'a', note: 62 }, // D4
      { word: 'lit-', note: 64 }, // E4
      { word: '-tle', note: 64 }, // E4
      { word: 'lamb', note: 64 }, // E4
      { word: 'lit-', note: 62 }, // D4
      { word: '-tle', note: 62 }, // D4
      { word: 'lamb', note: 62 }, // D4
      { word: 'lit-', note: 64 }, // E4
      { word: '-tle', note: 67 }, // G4
      { word: 'lamb', note: 67 }, // G4
      { word: 'Ma-', note: 64 }, // E4
      { word: '-ry', note: 62 }, // D4
      { word: 'had', note: 60 }, // C4
      { word: 'a', note: 62 }, // D4
      { word: 'lit-', note: 64 }, // E4
      { word: '-tle', note: 64 }, // E4
      { word: 'lamb', note: 64 }, // E4
      { word: 'whose', note: 64 }, // E4
      { word: 'fleece', note: 62 }, // D4
      { word: 'was', note: 62 }, // D4
      { word: 'white', note: 64 }, // E4
      { word: 'as', note: 62 }, // D4
      { word: 'snow', note: 60 }, // C4
    ]
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    artist: 'James Lord Pierpont',
    type: 'hard',
    difficulty: 'hard',
    tempo: 130,
    sequence: [
      { word: 'Jin-', note: 64 }, // E4
      { word: '-gle', note: 64 }, // E4
      { word: 'bells', note: 64 }, // E4
      { word: 'jin-', note: 64 }, // E4
      { word: '-gle', note: 64 }, // E4
      { word: 'bells', note: 64 }, // E4
      { word: 'jin-', note: 64 }, // E4
      { word: '-gle', note: 67 }, // G4
      { word: 'all', note: 60 }, // C4
      { word: 'the', note: 62 }, // D4
      { word: 'way', note: 64 }, // E4
      { word: 'Oh', note: 65 }, // F4
      { word: 'what', note: 65 }, // F4
      { word: 'fun', note: 65 }, // F4
      { word: 'it', note: 65 }, // F4
      { word: 'is', note: 64 }, // E4
      { word: 'to', note: 64 }, // E4
      { word: 'ride', note: 64 }, // E4
      { word: 'in', note: 64 }, // E4
      { word: 'a', note: 62 }, // D4
      { word: 'one', note: 62 }, // D4
      { word: 'horse', note: 64 }, // E4
      { word: 'o-', note: 62 }, // D4
      { word: '-pen', note: 67 }, // G4
      { word: 'sleigh', note: 60 }, // C4
    ]
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    artist: 'Traditional',
    type: 'hard',
    difficulty: 'hard',
    tempo: 95,
    sequence: [
      { word: 'Frè-', note: 60 }, // C4
      { word: '-re', note: 62 }, // D4
      { word: 'Jac-', note: 64 }, // E4
      { word: '-ques', note: 60 }, // C4
      { word: 'Frè-', note: 60 }, // C4
      { word: '-re', note: 62 }, // D4
      { word: 'Jac-', note: 64 }, // E4
      { word: '-ques', note: 60 }, // C4
      { word: 'Dor-', note: 64 }, // E4
      { word: '-mez', note: 65 }, // F4
      { word: 'vous', note: 67 }, // G4
      { word: 'Dor-', note: 64 }, // E4
      { word: '-mez', note: 65 }, // F4
      { word: 'vous', note: 67 }, // G4
      { word: 'Son-', note: 67 }, // G4
      { word: '-nez', note: 69 }, // A4
      { word: 'les', note: 67 }, // G4
      { word: 'ma-', note: 65 }, // F4
      { word: '-ti-', note: 64 }, // E4
      { word: '-nes', note: 60 }, // C4
      { word: 'Son-', note: 67 }, // G4
      { word: '-nez', note: 69 }, // A4
      { word: 'les', note: 67 }, // G4
      { word: 'ma-', note: 65 }, // F4
      { word: '-ti-', note: 64 }, // E4
      { word: '-nes', note: 60 }, // C4
      { word: 'Ding', note: 60 }, // C4
      { word: 'dang', note: 55 }, // G3
      { word: 'dong', note: 60 }, // C4
      { word: 'Ding', note: 60 }, // C4
      { word: 'dang', note: 55 }, // G3
      { word: 'dong', note: 60 }, // C4
    ]
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'John Newton',
    type: 'hard',
    difficulty: 'hard',
    tempo: 85,
    sequence: [
      { word: 'A-', note: 60 }, // C4
      { word: 'ma-', note: 65 }, // F4
      { word: '-zing', note: 69 }, // A4
      { word: 'grace', note: 65 }, // F4
      { word: 'how', note: 69 }, // A4
      { word: 'sweet', note: 67 }, // G4
      { word: 'the', note: 65 }, // F4
      { word: 'sound', note: 62 }, // D4
      { word: 'that', note: 60 }, // C4
      { word: 'saved', note: 65 }, // F4
      { word: 'a', note: 69 }, // A4
      { word: 'wretch', note: 65 }, // F4
      { word: 'like', note: 69 }, // A4
      { word: 'me', note: 72 }, // C5
      { word: 'I', note: 60 }, // C4
      { word: 'once', note: 65 }, // F4
      { word: 'was', note: 69 }, // A4
      { word: 'lost', note: 65 }, // F4
      { word: 'but', note: 69 }, // A4
      { word: 'now', note: 67 }, // G4
      { word: 'am', note: 65 }, // F4
      { word: 'found', note: 62 }, // D4
      { word: 'was', note: 60 }, // C4
      { word: 'blind', note: 65 }, // F4
      { word: 'but', note: 69 }, // A4
      { word: 'now', note: 65 }, // F4
      { word: 'I', note: 69 }, // A4
      { word: 'see', note: 72 }, // C5
    ]
  },
  {
    id: 'london-bridge',
    title: 'London Bridge Is Falling Down',
    artist: 'Traditional',
    type: 'easy',
    difficulty: 'easy',
    tempo: 100,
    sequence: [
      { word: 'Lon-', note: 60 },
      { word: '-don', note: 62 },
      { word: 'bridge', note: 64 },
      { word: 'is', note: 62 },
      { word: 'fal-', note: 60 },
      { word: '-ling', note: 62 },
      { word: 'down', note: 64 },
    ]
  },
  {
    id: 'wheels-on-bus',
    title: 'The Wheels on the Bus',
    artist: 'Traditional',
    type: 'medium',
    difficulty: 'medium',
    tempo: 110,
    sequence: [
      { word: 'The', note: 60 },
      { word: 'wheels', note: 65 },
      { word: 'on', note: 65 },
      { word: 'the', note: 65 },
      { word: 'bus', note: 72 },
      { word: 'go', note: 69 },
      { word: 'round', note: 65 },
      { word: 'and', note: 67 },
      { word: 'round', note: 67 },
      { word: 'round', note: 69 },
      { word: 'and', note: 69 },
      { word: 'round', note: 67 },
      { word: 'The', note: 65 },
      { word: 'wheels', note: 72 },
      { word: 'on', note: 69 },
      { word: 'the', note: 65 },
    ]
  },
  {
    id: 'bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    type: 'hard',
    difficulty: 'hard',
    tempo: 140,
    sequence: [
      { word: 'Is', note: 60 },
      { word: 'this', note: 62 },
      { word: 'the', note: 64 },
      { word: 're-', note: 65 },
      { word: '-al', note: 67 },
      { word: 'life', note: 69 },
      { word: 'Is', note: 72 },
      { word: 'this', note: 71 },
      { word: 'just', note: 69 },
      { word: 'fan-', note: 67 },
      { word: '-ta-', note: 65 },
      { word: '-sy', note: 64 },
      { word: 'Caught', note: 62 },
      { word: 'in', note: 60 },
      { word: 'a', note: 59 },
      { word: 'land-', note: 60 },
      { word: '-slide', note: 62 },
      { word: 'No', note: 64 },
      { word: 'es-', note: 65 },
      { word: '-cape', note: 67 },
      { word: 'from', note: 69 },
      { word: 're-', note: 72 },
      { word: '-al-', note: 71 },
      { word: '-i-', note: 69 },
      { word: '-ty', note: 67 }
    ]
  },
  {
    id: 'imagine',
    title: 'Imagine',
    artist: 'John Lennon',
    type: 'medium',
    difficulty: 'medium',
    tempo: 75,
    sequence: [
      { word: 'I-', note: 60 },
      { word: '-ma-', note: 62 },
      { word: '-gine', note: 64 },
      { word: 'there\'s', note: 67 },
      { word: 'no', note: 65 },
      { word: 'hea-', note: 64 },
      { word: '-ven', note: 62 },
    ]
  },
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    type: 'medium',
    difficulty: 'medium',
    tempo: 143,
    sequence: [
      { word: 'When', note: 60 },
      { word: 'I', note: 62 },
      { word: 'find', note: 64 },
      { word: 'my-', note: 65 },
      { word: '-self', note: 67 },
      { word: 'in', note: 69 },
      { word: 'times', note: 72 },
      { word: 'of', note: 71 },
      { word: 'trou-', note: 69 },
      { word: '-ble', note: 67 },
    ]
  },
  {
    id: 'somewhere-over-rainbow',
    title: 'Somewhere Over the Rainbow',
    artist: 'Judy Garland',
    type: 'hard',
    difficulty: 'hard',
    tempo: 75,
    sequence: [
      { word: 'Some-', note: 60 },
      { word: '-where', note: 64 },
      { word: 'o-', note: 67 },
      { word: '-ver', note: 69 },
      { word: 'the', note: 67 },
      { word: 'rain-', note: 65 },
      { word: '-bow', note: 64 },
      { word: 'way', note: 62 },
      { word: 'up', note: 60 },
      { word: 'high', note: 64 },
    ]
  },
  {
    id: 'old-macdonald',
    title: 'Old MacDonald Had a Farm',
    artist: 'Traditional',
    type: 'easy',
    difficulty: 'easy',
    tempo: 110,
    sequence: [
      { word: 'Old', note: 60 },
      { word: 'Mac-', note: 60 },
      { word: '-Don-', note: 60 },
      { word: '-ald', note: 64 },
      { word: 'had', note: 64 },
      { word: 'a', note: 62 },
      { word: 'farm', note: 62 },
      { word: 'E-', note: 60 },
    ]
  },
  {
    id: 'eye-of-the-tiger',
    title: 'Eye of the Tiger',
    artist: 'Survivor',
    type: 'hard',
    difficulty: 'hard',
    tempo: 109,
    sequence: [
      { word: 'Ris-', note: 60 },
      { word: '-in\'', note: 60 },
      { word: 'up', note: 62 },
      { word: 'back', note: 60 },
      { word: 'on', note: 62 },
      { word: 'the', note: 60 },
      { word: 'street', note: 64 },
      { word: 'Did', note: 60 },
      { word: 'my', note: 62 },
      { word: 'time', note: 60 },
      { word: 'took', note: 64 },
      { word: 'my', note: 62 },
      { word: 'chances', note: 60 },
    ]
  },
  {
    id: 'yellow-submarine',
    title: 'Yellow Submarine',
    artist: 'The Beatles',
    type: 'easy',
    difficulty: 'easy',
    tempo: 110,
    sequence: [
      { word: 'In', note: 60 },
      { word: 'the', note: 62 },
      { word: 'town', note: 64 },
      { word: 'where', note: 65 },
      { word: 'I', note: 67 },
      { word: 'was', note: 69 },
      { word: 'born', note: 72 },
    ]
  },
  {
    id: 'stayin-alive',
    title: 'Stayin\' Alive',
    artist: 'Bee Gees',
    type: 'medium',
    difficulty: 'medium',
    tempo: 103,
    sequence: [
      { word: 'Well', note: 60 },
      { word: 'you', note: 62 },
      { word: 'can', note: 64 },
      { word: 'tell', note: 65 },
      { word: 'by', note: 67 },
      { word: 'the', note: 69 },
      { word: 'way', note: 72 },
    ]
  },
  {
    id: 'dont-stop-me-now',
    title: 'Don\'t Stop Me Now',
    artist: 'Queen',
    type: 'hard',
    difficulty: 'hard',
    tempo: 156,
    sequence: [
      { word: 'To-', note: 60 },
      { word: '-night', note: 62 },
      { word: 'I\'m', note: 64 },
      { word: 'gon-', note: 65 },
      { word: '-na', note: 67 },
      { word: 'have', note: 69 },
      { word: 'my-', note: 72 },
      { word: '-self', note: 71 },
      { word: 'a', note: 69 },
      { word: 'real', note: 67 },
      { word: 'good', note: 65 },
      { word: 'time', note: 64 },
    ]
  },
  {
    id: 'lean-on-me',
    title: 'Lean on Me',
    artist: 'Bill Withers',
    type: 'medium',
    difficulty: 'medium',
    tempo: 90,
    sequence: [
      { word: 'Some-', note: 60 },
      { word: '-times', note: 62 },
      { word: 'in', note: 64 },
      { word: 'our', note: 65 },
      { word: 'lives', note: 67 },
      { word: 'we', note: 69 },
      { word: 'all', note: 72 },
    ]
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    type: 'hard',
    difficulty: 'hard',
    tempo: 123,
    sequence: [
      { word: 'I\'m', note: 55 },
      { word: 'gon-', note: 55 },
      { word: '-na', note: 58 },
      { word: 'fight', note: 55 },
      { word: 'em', note: 53 },
      { word: 'off', note: 51 },
      { word: 'A', note: 50 },
    ]
  },
  {
    id: 'shosholoza',
    title: 'Shosholoza',
    artist: 'Traditional African',
    type: 'medium',
    difficulty: 'medium',
    tempo: 100,
    sequence: [
      { word: 'Sho-', note: 60, duration: 1, phraseStart: true },
      { word: '-sho-', note: 62, duration: 1 },
      { word: '-lo-', note: 64, duration: 1 },
      { word: '-za', note: 65, duration: 2 },
      { word: 'Ku-', note: 67, duration: 1, phraseStart: true },
      { word: '-le', note: 69, duration: 1 },
      { word: 'zo-', note: 72, duration: 1 },
      { word: '-ng', note: 71, duration: 2 }
    ]
  },
  {
    id: 'pata-pata',
    title: 'Pata Pata',
    artist: 'Miriam Makeba',
    type: 'hard',
    difficulty: 'hard',
    tempo: 120,
    sequence: [
      { word: 'Pa-', note: 60, duration: 0.5, phraseStart: true },
      { word: '-ta', note: 60, duration: 0.5 },
      { word: 'Pa-', note: 62, duration: 0.5 },
      { word: '-ta', note: 62, duration: 0.5 },
      { word: 'i-', note: 64, duration: 0.5 },
      { word: '-di', note: 64, duration: 0.5 },
      { word: 'la', note: 65, duration: 1, phraseStart: true },
      { word: 'Pa-', note: 67, duration: 0.5 },
      { word: '-ta', note: 67, duration: 0.5 }
    ]
  },
  {
    id: 'jerusalema',
    title: 'Jerusalema',
    artist: 'Master KG',
    type: 'medium',
    difficulty: 'medium',
    tempo: 122,
    sequence: [
      { word: 'Je-', note: 60, duration: 1, phraseStart: true },
      { word: '-ru-', note: 62, duration: 1 },
      { word: '-sa-', note: 64, duration: 1 },
      { word: '-le-', note: 65, duration: 1 },
      { word: '-ma', note: 67, duration: 2, phraseStart: true },
      { word: 'i-', note: 69, duration: 1 },
      { word: '-khaya', note: 72, duration: 2 }
    ]
  },
  {
    id: 'circle-of-life',
    title: 'Circle of Life',
    artist: 'Elton John',
    type: 'hard',
    difficulty: 'hard',
    tempo: 80,
    sequence: [
      { word: 'From', note: 60, duration: 1, phraseStart: true },
      { word: 'the', note: 62, duration: 1 },
      { word: 'day', note: 64, duration: 1 },
      { word: 'we', note: 65, duration: 1 },
      { word: 'ar-', note: 67, duration: 1 },
      { word: '-rive', note: 69, duration: 2, phraseStart: true },
      { word: 'on', note: 72, duration: 1 },
      { word: 'the', note: 71, duration: 1 },
      { word: 'pla-', note: 69, duration: 1 },
      { word: '-net', note: 67, duration: 2 }
    ]
  },
  {
    id: 'hakuna-matata',
    title: 'Hakuna Matata',
    artist: 'Nathan Lane',
    type: 'easy',
    difficulty: 'easy',
    tempo: 110,
    sequence: [
      { word: 'Ha-', note: 60, duration: 1, phraseStart: true },
      { word: '-ku-', note: 62, duration: 1 },
      { word: '-na', note: 64, duration: 1 },
      { word: 'Ma-', note: 65, duration: 1 },
      { word: '-ta-', note: 67, duration: 1 },
      { word: '-ta', note: 69, duration: 2, phraseStart: true },
      { word: 'What', note: 72, duration: 1 },
      { word: 'a', note: 71, duration: 1 },
      { word: 'won-', note: 69, duration: 1 },
      { word: '-derful', note: 67, duration: 2 }
    ]
  },
  {
    id: 'aweah',
    title: 'Aweah',
    artist: 'Yo Maps',
    type: 'medium',
    difficulty: 'medium',
    tempo: 115,
    sequence: [
      { word: 'A-', note: 60, duration: 1, phraseStart: true },
      { word: '-we-', note: 62, duration: 1 },
      { word: '-ah', note: 64, duration: 2 },
      { word: 'ni', note: 65, duration: 1, phraseStart: true },
      { word: 'kan-', note: 67, duration: 1 },
      { word: '-tu', note: 69, duration: 1 },
      { word: 'ka-', note: 72, duration: 1 },
      { word: '-be', note: 72, duration: 2 }
    ]
  },
  {
    id: 'single',
    title: 'Single',
    artist: 'Yo Maps',
    type: 'easy',
    difficulty: 'easy',
    tempo: 105,
    sequence: [
      { word: 'Sin-', note: 60, duration: 1, phraseStart: true },
      { word: '-gle', note: 62, duration: 1 },
      { word: 'ni', note: 64, duration: 1 },
      { word: 'ka-', note: 65, duration: 1 },
      { word: '-le', note: 67, duration: 2, phraseStart: true },
      { word: 'sin-', note: 69, duration: 1 },
      { word: '-gle', note: 72, duration: 1 },
      { word: 'ni', note: 72, duration: 1 },
      { word: 'ka-', note: 71, duration: 1 },
      { word: '-le', note: 69, duration: 2 }
    ]
  },
  {
    id: 'komando',
    title: 'Komando',
    artist: 'Yo Maps',
    type: 'hard',
    difficulty: 'hard',
    tempo: 130,
    sequence: [
      { word: 'Ndi', note: 60, duration: 0.5, phraseStart: true },
      { word: 'ko-', note: 62, duration: 0.5 },
      { word: '-man-', note: 64, duration: 0.5 },
      { word: '-do', note: 65, duration: 0.5 },
      { word: 'ndi', note: 67, duration: 0.5 },
      { word: 'ko-', note: 69, duration: 0.5 },
      { word: '-man-', note: 72, duration: 1, phraseStart: true },
      { word: '-do', note: 71, duration: 0.5 }
    ]
  },
  {
    id: 'blessings',
    title: 'Blessings',
    artist: 'Yo Maps',
    type: 'medium',
    difficulty: 'medium',
    tempo: 95,
    sequence: [
      { word: 'Bless-', note: 60, duration: 1, phraseStart: true },
      { word: '-ings', note: 62, duration: 1 },
      { word: 'fol-', note: 64, duration: 1 },
      { word: '-low', note: 65, duration: 1 },
      { word: 'me', note: 67, duration: 2, phraseStart: true },
      { word: 'eve-', note: 69, duration: 1 },
      { word: '-ry-', note: 72, duration: 1 },
      { word: '-where', note: 72, duration: 2 }
    ]
  },
  {
    id: 'pick-it-up',
    title: 'Pick It Up',
    artist: 'Yo Maps',
    type: 'hard',
    difficulty: 'hard',
    tempo: 125,
    sequence: [
      { word: 'Pick', note: 60, duration: 0.5, phraseStart: true },
      { word: 'it', note: 62, duration: 0.5 },
      { word: 'up', note: 64, duration: 0.5 },
      { word: 'pick', note: 65, duration: 0.5 },
      { word: 'it', note: 67, duration: 0.5 },
      { word: 'up', note: 69, duration: 0.5 },
      { word: 'now', note: 72, duration: 1, phraseStart: true },
      { word: 'don\'t', note: 71, duration: 0.5 },
      { word: 'stop', note: 69, duration: 0.5 }
    ]
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    type: 'easy',
    difficulty: 'easy',
    tempo: 96,
    sequence: [
      { word: 'I\'m', note: 61, duration: 0.5, phraseStart: true },
      { word: 'in', note: 61, duration: 0.5 },
      { word: 'love', note: 61, duration: 0.5 },
      { word: 'with', note: 61, duration: 0.5 },
      { word: 'the', note: 61, duration: 0.5 },
      { word: 'shape', note: 64, duration: 0.5 },
      { word: 'of', note: 64, duration: 0.5 },
      { word: 'you', note: 64, duration: 1 }
    ]
  },
  {
    id: 'despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    type: 'medium',
    difficulty: 'medium',
    tempo: 89,
    sequence: [
      { word: 'Des-', note: 62, duration: 1, phraseStart: true },
      { word: '-pa-', note: 66, duration: 1 },
      { word: '-ci-', note: 69, duration: 1 },
      { word: '-to', note: 69, duration: 2 }
    ]
  },
  {
    id: 'take-on-me',
    title: 'Take On Me',
    artist: 'a-ha',
    type: 'hard',
    difficulty: 'hard',
    tempo: 169,
    sequence: [
      { word: 'Take', note: 66, duration: 1, phraseStart: true },
      { word: 'on', note: 66, duration: 1 },
      { word: 'me', note: 66, duration: 2 },
      { word: 'Take', note: 66, duration: 1, phraseStart: true },
      { word: 'me', note: 66, duration: 1 },
      { word: 'on', note: 66, duration: 2 },
      { word: 'I\'ll', note: 66, duration: 1, phraseStart: true },
      { word: 'be', note: 66, duration: 1 },
      { word: 'gone', note: 78, duration: 2 }
    ]
  },
  {
    id: 'waka-waka',
    title: 'Waka Waka',
    artist: 'Shakira',
    type: 'medium',
    difficulty: 'medium',
    tempo: 127,
    sequence: [
      { word: 'Tsa-', note: 60, duration: 0.5, phraseStart: true },
      { word: '-mi-', note: 60, duration: 0.5 },
      { word: '-na', note: 60, duration: 0.5 },
      { word: 'mi-', note: 60, duration: 0.5 },
      { word: '-na', note: 60, duration: 0.5 },
      { word: 'eh', note: 64, duration: 0.5 },
      { word: 'eh', note: 64, duration: 1 },
      { word: 'Wa-', note: 67, duration: 0.5, phraseStart: true },
      { word: '-ka', note: 67, duration: 0.5 },
      { word: 'wa-', note: 67, duration: 0.5 },
      { word: '-ka', note: 67, duration: 0.5 },
      { word: 'eh', note: 64, duration: 0.5 },
      { word: 'eh', note: 64, duration: 1 }
    ]
  },
  {
    id: 'chilailai',
    title: 'Chilailai',
    artist: 'Slapdee ft. Yo Maps',
    type: 'hard',
    difficulty: 'hard',
    tempo: 110,
    sequence: [
      { word: 'Chi-', note: 60, duration: 0.5, phraseStart: true },
      { word: '-lai-', note: 62, duration: 0.5 },
      { word: '-lai', note: 64, duration: 1 },
      { word: 'chi-', note: 65, duration: 0.5 },
      { word: '-lai-', note: 67, duration: 0.5 },
      { word: '-lai', note: 69, duration: 1 }
    ]
  }
];
