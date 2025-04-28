import React, { useState } from 'react';
import { Plant } from '../types/plantTypes';
import WateringIndicator from './WateringIndicator';
import WateringTracker from './WateringTracker';
import PlantEditModal from './PlantEditModal';

interface PlantCardProps {
  plant: Plant;
  onUpdatePlant: (updatedPlant: Plant) => void;
  onDeletePlant: (plantId: string) => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onUpdatePlant, onDeletePlant }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate days until watering based on most recent watering date
  const today = new Date();
  const mostRecentWateringDate = plant.wateringHistory?.[0];
  const lastWateredDate = mostRecentWateringDate ? new Date(mostRecentWateringDate) : null;
  const daysSinceWatered = lastWateredDate
    ? Math.floor((today.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24))
    : plant.wateringFrequencyDays;
  const daysUntilWatering = Math.max(0, plant.wateringFrequencyDays - daysSinceWatered);
  
  const formattedDate = lastWateredDate
    ? lastWateredDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Never';

  const handleDateClick = (clickedDate: Date, isRemoving: boolean) => {
    if (isRemoving) {
      // Remove the specific clicked date from history
      const updatedHistory = plant.wateringHistory.filter(date => {
        const historyDate = new Date(date);
        return historyDate.toDateString() !== clickedDate.toDateString();
      });
      
      const updatedPlant = {
        ...plant,
        lastWateredAt: updatedHistory[0] || null,
        wateringHistory: updatedHistory
      };
      onUpdatePlant(updatedPlant);
    } else {
      // Add new watering date
      const newDate = clickedDate.toISOString();
      const updatedPlant = {
        ...plant,
        lastWateredAt: newDate,
        wateringHistory: [newDate, ...plant.wateringHistory]
      };
      onUpdatePlant(updatedPlant);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click target is part of the WateringTracker component
    const isWateringTrackerClick = (e.target as HTMLElement).closest('.watering-tracker');
    if (!isWateringTrackerClick) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div 
        className="rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm border border-buddy-brown/10 shadow-lg cursor-pointer"
        onClick={handleCardClick}
      >      
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-buddy-brown">{plant.name}</h3>
            <WateringIndicator daysUntilWatering={daysUntilWatering} />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-gray-600 italic">{plant.species}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              plant.location === 'Indoor' 
                ? 'bg-buddy-pink/30 text-buddy-brown' 
                : 'bg-buddy-brown/10 text-buddy-brown'
            }`}>
              {plant.location}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Water every <span className="font-medium">{plant.wateringFrequencyDays} days</span>
              </p>
              <p className="text-sm text-gray-500">
                Last watered: <span className="font-medium">{formattedDate}</span>
              </p>
            </div>
          </div>

          <div className="watering-tracker">
            <WateringTracker
              wateringHistory={plant.wateringHistory}
              lastWatered={mostRecentWateringDate || ''}
              onDateClick={handleDateClick}
            />
          </div>
        </div>
      </div>

      <PlantEditModal
        plant={plant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onUpdatePlant}
        onDelete={onDeletePlant}
      />
    </>
  );
};

export default PlantCard;