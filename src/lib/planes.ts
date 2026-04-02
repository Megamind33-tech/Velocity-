export interface Plane {
  id: string;
  name: string;
  description: string;
  price: number;
  color: string;
}

export const PLANES: Plane[] = [
  { id: 'default', name: 'Standard Jet', description: 'Reliable and fast.', price: 0, color: 'bg-blue-500' },
  { id: 'speedster', name: 'Speedster', description: 'Built for high-tempo tracks.', price: 5000, color: 'bg-red-500' },
  { id: 'stealth', name: 'Stealth', description: 'Hard to detect, smooth handling.', price: 10000, color: 'bg-slate-700' },
  { id: 'gold', name: 'Golden Eagle', description: 'The ultimate luxury plane.', price: 50000, color: 'bg-amber-500' },
];
