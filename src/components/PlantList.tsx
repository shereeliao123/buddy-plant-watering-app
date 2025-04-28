import React, { useState, useEffect } from 'react';
import PlantCard from './PlantCard';
import PlantAddModal from './PlantAddModal';
import { Plant } from '../types/plantTypes';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { checkAndNotifyPlantWatering, checkAllPlantsOnce } from '../utils/notifications';

const PlantList: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const { data: plantsData, error: plantsError } = await supabase
          .from('plants')
          .select(`
            *,
            watering_history (
              watered_at
            )
          `)
          .order('created_at', { ascending: false });

        if (plantsError) throw plantsError;

        const formattedPlants = plantsData.map(plant => ({
          ...plant,
          wateringFrequencyDays: plant.watering_frequency_days,
          wateringHistory: plant.watering_history
            .map((wh: any) => wh.watered_at)
            .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())
        }));

        setPlants(formattedPlants);

        // Check all plants once per session
        checkAllPlantsOnce(formattedPlants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const calculateDaysUntilWatering = (plant: Plant): number => {
    const mostRecentWateringDate = plant.wateringHistory?.[0];
    if (!mostRecentWateringDate) return 0; // If never watered, needs water now
    
    const lastWateredDate = new Date(mostRecentWateringDate);
    const today = new Date();
    const daysSinceWatered = Math.floor((today.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, plant.wateringFrequencyDays - daysSinceWatered);
  };

  const sortedPlants = [...plants].sort((a, b) => {
    const daysA = calculateDaysUntilWatering(a);
    const daysB = calculateDaysUntilWatering(b);
    return daysA - daysB;
  });

  const handleUpdatePlant = async (updatedPlant: Plant) => {
    try {
      const { error: plantError } = await supabase
        .from('plants')
        .update({
          name: updatedPlant.name,
          species: updatedPlant.species,
          location: updatedPlant.location,
          watering_frequency_days: updatedPlant.wateringFrequencyDays,
          last_watered_at: updatedPlant.wateringHistory?.[0] || null
        })
        .eq('id', updatedPlant.id);

      if (plantError) throw plantError;

      const { error: deleteError } = await supabase
        .from('watering_history')
        .delete()
        .eq('plant_id', updatedPlant.id);

      if (deleteError) throw deleteError;

      if (updatedPlant.wateringHistory.length > 0) {
        const wateringRecords = updatedPlant.wateringHistory.map(date => ({
          plant_id: updatedPlant.id,
          watered_at: date
        }));

        const { error: insertError } = await supabase
          .from('watering_history')
          .insert(wateringRecords);

        if (insertError) throw insertError;
      }

      const updatedPlants = plants.map(plant => 
        plant.id === updatedPlant.id ? {
          ...updatedPlant,
          wateringHistory: updatedPlant.wateringHistory.sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
          )
        } : plant
      );

      setPlants(updatedPlants);

      // Check for notifications after updating a plant
      checkAndNotifyPlantWatering(updatedPlant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plant');
    }
  };

  const handleAddPlant = async (newPlant: Omit<Plant, 'id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('plants')
        .insert({
          name: newPlant.name,
          species: newPlant.species,
          location: newPlant.location,
          watering_frequency_days: newPlant.wateringFrequencyDays,
          last_watered_at: null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const addedPlant = { 
        ...data, 
        wateringFrequencyDays: data.watering_frequency_days, 
        wateringHistory: [] 
      };

      setPlants([addedPlant, ...plants]);

      // Check for notifications after adding a new plant
      checkAndNotifyPlantWatering(addedPlant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add plant');
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId);

      if (error) throw error;

      setPlants(plants.filter(plant => plant.id !== plantId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plant');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buddy-brown"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50 mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-buddy-brown">My Plants</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-buddy-green text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Add new plant
        </button>
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-buddy-brown mb-4">You haven't added any plants yet!</p>
          <p className="text-gray-600">Click the "Add new plant" button to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlants.map((plant) => (
            <PlantCard 
              key={plant.id} 
              plant={plant}
              onUpdatePlant={handleUpdatePlant}
              onDeletePlant={handleDeletePlant}
            />
          ))}
        </div>
      )}

      <PlantAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPlant}
      />
    </div>
  );
};

export default PlantList;
