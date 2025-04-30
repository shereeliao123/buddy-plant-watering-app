import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Plant } from '../types/plantTypes';
import { supabase } from '../lib/supabase';
import SearchableDropdown from './SearchableDropdown';

interface PlantEditModalProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlant: Plant) => void;
  onDelete: (plantId: string) => void;
}

const PlantEditModal: React.FC<PlantEditModalProps> = ({ plant, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: plant.name,
    species: plant.species,
    location: plant.location,
    wateringFrequencyDays: plant.wateringFrequencyDays,
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
      ...plant,
      ...formData,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(plant.id);
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
        
        <h2 className="text-xl font-bold mb-4 text-buddy-brown">Edit Plant Details</h2>
        
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
              onChange={(e) => setFormData({ ...formData, wateringFrequencyDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-buddy-brown/20 rounded-md focus:outline-none focus:ring-2 focus:ring-buddy-green"
              required
            />
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
              aria-label="Delete plant"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-buddy-brown bg-buddy-pink/30 rounded-md hover:bg-buddy-pink/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-buddy-green rounded-md hover:bg-opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantEditModal;