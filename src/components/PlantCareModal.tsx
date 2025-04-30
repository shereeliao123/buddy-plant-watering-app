import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PlantCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  species: string;
}

interface CareInstructions {
  watering: string;
  sunlight: string;
  soil: string;
  temperature: string;
  seasonal: string;
}

const PlantCareModal: React.FC<PlantCareModalProps> = ({ isOpen, onClose, species }) => {
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState<CareInstructions | null>(null);

  useEffect(() => {
    const fetchCareInstructions = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call to genAI endpoint
        // Simulated API response for now
        const mockInstructions: CareInstructions = {
          watering: `Water thoroughly when the top inch of soil feels dry. ${species} typically needs watering every 7-10 days.`,
          sunlight: "Bright, indirect light is ideal. Avoid direct afternoon sun which can scorch the leaves.",
          soil: "Well-draining potting mix rich in organic matter. Add perlite for better drainage.",
          temperature: "Maintains best growth between 65-80°F (18-27°C). Protect from cold drafts.",
          seasonal: "Reduce watering in winter. Fertilize monthly during growing season (spring-summer)."
        };
        
        setInstructions(mockInstructions);
      } catch (error) {
        console.error('Error fetching care instructions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareInstructions();
  }, [isOpen, species]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg m-4 relative animate-[fadeIn_0.2s_ease-in-out]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-buddy-brown hover:text-buddy-brown/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-buddy-brown pr-8">
          {species} Care Guide
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-buddy-brown"></div>
          </div>
        ) : instructions ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-buddy-brown mb-2">Watering Requirements</h3>
              <p className="text-gray-600">{instructions.watering}</p>
            </div>

            <div>
              <h3 className="font-semibold text-buddy-brown mb-2">Sunlight Conditions</h3>
              <p className="text-gray-600">{instructions.sunlight}</p>
            </div>

            <div>
              <h3 className="font-semibold text-buddy-brown mb-2">Soil Preferences</h3>
              <p className="text-gray-600">{instructions.soil}</p>
            </div>

            <div>
              <h3 className="font-semibold text-buddy-brown mb-2">Temperature Range</h3>
              <p className="text-gray-600">{instructions.temperature}</p>
            </div>

            <div>
              <h3 className="font-semibold text-buddy-brown mb-2">Seasonal Care Tips</h3>
              <p className="text-gray-600">{instructions.seasonal}</p>
            </div>
          </div>
        ) : (
          <div className="text-red-600">
            Failed to load care instructions. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCareModal;