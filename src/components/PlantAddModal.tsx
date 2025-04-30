import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Plant } from '../types/plantTypes';
import { supabase } from '../lib/supabase';
import SearchableDropdown from './SearchableDropdown';

interface PlantAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPlant: Omit<Plant, 'id'>) => void;
}

const PlantAddModal: React.FC<PlantAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    location: 'Indoor' as const,
    wateringFrequencyDays: '',
  });

  const [plantSpecies, setPlantSpecies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlantSpecies = async () => {
      if (!isOpen) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('plant_species')
          .select('name')
          .order('name');

        if (error) throw error;

        setPlantSpecies(data.map(item => item.name));
      } catch (err) {
        console.error('Error fetching plant species:', err);
        setError('Failed to load plant species');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantSpecies();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      wateringFrequencyDays: parseInt(formData.wateringFrequencyDays as string),
      lastWateredAt: '',
      wateringHistory: [],
    });
    setFormData({
      name: '',
      species: '',
      location: 'Indoor',
      wateringFrequencyDays: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-buddy-brown hover:text-buddy-brown/70"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-buddy-brown">Add New Plant</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-buddy-brown mb-1">
              Plant Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-buddy-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-buddy-green"
              required
              placeholder="Enter plant name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-buddy-brown mb-1">
              Species
            </label>
            <SearchableDropdown
              options={plantSpecies}
              value={formData.species}
              onChange={(value) => setFormData({ ...formData, species: value })}
              placeholder="Search species..."
              isLoading={loading}
              error={error}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-buddy-brown mb-1">
              Location
            </label>
            <div className="flex rounded-lg border border-buddy-brown/20 p-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'Indoor' })}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  formData.location === 'Indoor'
                    ? 'bg-buddy-pink/30 text-buddy-brown'
                    : 'text-buddy-brown/70 hover:text-buddy-brown'
                }`}
              >
                Indoor
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'Outdoor' })}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  formData.location === 'Outdoor'
                    ? 'bg-buddy-brown/10 text-buddy-brown'
                    : 'text-buddy-brown/70 hover:text-buddy-brown'
                }`}
              >
                Outdoor
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-buddy-brown mb-1">
              Watering Frequency (days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.wateringFrequencyDays}
              onChange={(e) => setFormData({ ...formData, wateringFrequencyDays: e.target.value })}
              className="w-full px-3 py-2 border border-buddy-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-buddy-green"
              required
              placeholder="Enter number of days"
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  species: '',
                  location: 'Indoor',
                  wateringFrequencyDays: '',
                });
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-buddy-brown bg-buddy-pink/30 rounded-md hover:bg-buddy-pink/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-buddy-green rounded-md hover:bg-opacity-90"
            >
              Add Plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantAddModal;