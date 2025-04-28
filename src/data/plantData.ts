import { Plant } from '../types/plantTypes';

export const plantData: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    species: 'Monstera Deliciosa',
    location: 'Indoor',
    wateringFrequencyDays: 7,
    lastWateredAt: '2025-03-24T12:00:00Z',
    wateringHistory: [
      '2025-03-24T12:00:00Z',
      '2025-03-17T12:00:00Z',
      '2025-03-10T12:00:00Z',
      '2025-03-03T12:00:00Z'
    ]
  },
  {
    id: '2',
    name: 'Snake Plant',
    species: 'Snake Plant (Sansevieria)',
    location: 'Indoor',
    wateringFrequencyDays: 14,
    lastWateredAt: '2025-04-01T12:00:00Z',
    wateringHistory: [
      '2025-04-01T12:00:00Z',
      '2025-03-18T12:00:00Z',
      '2025-03-04T12:00:00Z'
    ]
  },
  {
    id: '3',
    name: 'Fiddle Leaf Fig',
    species: 'Fiddle Leaf Fig (Ficus lyrata)',
    location: 'Indoor',
    wateringFrequencyDays: 10,
    lastWateredAt: '2025-03-31T12:00:00Z',
    wateringHistory: [
      '2025-03-31T12:00:00Z',
      '2025-03-21T12:00:00Z',
      '2025-03-11T12:00:00Z'
    ]
  }
];