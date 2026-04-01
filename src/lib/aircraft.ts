export interface AircraftModel {
  id: string;
  name: string;
  manufacturer: string;
  role: string;
  description: string;
  frameStyle: 'scout' | 'attack' | 'rescue' | 'heavy' | 'sport';
  palette: {
    body: string;
    secondary: string;
    canopy: string;
    accent: string;
    rotor: string;
    skid: string;
    glow: string;
  };
}

export const AIRCRAFT_MODELS: AircraftModel[] = [
  {
    id: 'sky-ranger',
    name: 'Sky Ranger',
    manufacturer: 'Falcon Aero',
    role: 'Utility',
    description: 'Balanced utility helicopter with stable handling.',
    frameStyle: 'rescue',
    palette: {
      body: '#DCE3ED',
      secondary: '#9FB1C8',
      canopy: '#2F5A8A',
      accent: '#43E7FF',
      rotor: '#EAF2FF',
      skid: '#A8B4C8',
      glow: '67,231,255',
    },
  },
  {
    id: 'storm-wasp',
    name: 'Storm Wasp',
    manufacturer: 'Northwind Dynamics',
    role: 'Recon',
    description: 'Fast recon frame with sharp profile and agile feel.',
    frameStyle: 'scout',
    palette: {
      body: '#B4BECD',
      secondary: '#7B889D',
      canopy: '#355D8E',
      accent: '#FFC94A',
      rotor: '#E5EAF5',
      skid: '#8E9BB1',
      glow: '255,201,74',
    },
  },
  {
    id: 'desert-kite',
    name: 'Desert Kite',
    manufacturer: 'Apex Rotorworks',
    role: 'Rescue',
    description: 'Search-and-rescue helicopter tuned for rough weather.',
    frameStyle: 'rescue',
    palette: {
      body: '#E2D6BE',
      secondary: '#BDAA84',
      canopy: '#3F5875',
      accent: '#FF9D5C',
      rotor: '#F0E8D7',
      skid: '#A19476',
      glow: '255,157,92',
    },
  },
  {
    id: 'night-viper',
    name: 'Night Viper',
    manufacturer: 'Arc Sentinel',
    role: 'Stealth',
    description: 'Low-signature midnight platform with a tight silhouette.',
    frameStyle: 'attack',
    palette: {
      body: '#8893A8',
      secondary: '#5F6A82',
      canopy: '#22374F',
      accent: '#7D5CFF',
      rotor: '#C8D2E6',
      skid: '#7A859A',
      glow: '125,92,255',
    },
  },
  {
    id: 'coast-guardian',
    name: 'Coast Guardian',
    manufacturer: 'Bluewater Systems',
    role: 'Patrol',
    description: 'Maritime patrol variant with broad visibility cockpit.',
    frameStyle: 'rescue',
    palette: {
      body: '#D6E3EE',
      secondary: '#92ACC2',
      canopy: '#2A4E79',
      accent: '#6EE7FF',
      rotor: '#EAF6FF',
      skid: '#A0B5C9',
      glow: '110,231,255',
    },
  },
  {
    id: 'ember-hawk',
    name: 'Ember Hawk',
    manufacturer: 'Vector Flight Labs',
    role: 'Attack',
    description: 'Armored tactical helicopter with high-contrast paint.',
    frameStyle: 'attack',
    palette: {
      body: '#B9B6B9',
      secondary: '#7E7885',
      canopy: '#2F2E39',
      accent: '#FF6B6B',
      rotor: '#DDD8DD',
      skid: '#88828F',
      glow: '255,107,107',
    },
  },
  {
    id: 'aurora-lift',
    name: 'Aurora Lift',
    manufacturer: 'Stratos Heavy',
    role: 'Heavy Lift',
    description: 'Heavy-lift platform with reinforced skids and long tail.',
    frameStyle: 'heavy',
    palette: {
      body: '#CDD4DF',
      secondary: '#9BA8B8',
      canopy: '#375679',
      accent: '#B9FF66',
      rotor: '#E7EDF5',
      skid: '#95A2B1',
      glow: '185,255,102',
    },
  },
  {
    id: 'pulse-runner',
    name: 'Pulse Runner',
    manufacturer: 'Ionline Aviation',
    role: 'Sport',
    description: 'Sport helicopter with lightweight frame and vivid trim.',
    frameStyle: 'sport',
    palette: {
      body: '#D7D3E3',
      secondary: '#A39BB8',
      canopy: '#3F4273',
      accent: '#FF4FC3',
      rotor: '#EEE8F8',
      skid: '#9B95AF',
      glow: '255,79,195',
    },
  },
];

export const DEFAULT_AIRCRAFT_ID = AIRCRAFT_MODELS[0].id;

export function getAircraftModel(id?: string): AircraftModel {
  if (!id) return AIRCRAFT_MODELS[0];
  return AIRCRAFT_MODELS.find(model => model.id === id) ?? AIRCRAFT_MODELS[0];
}
