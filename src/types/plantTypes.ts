export interface Plant {
  id: string;
  name: string;
  species: string;
  location: 'Indoor' | 'Outdoor';
  wateringFrequencyDays: number;
  lastWateredAt: string; // ISO date string
  wateringHistory: string[]; // Array of ISO date strings
}