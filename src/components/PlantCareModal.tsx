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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0">
      <div 
        className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col relative animate-[fadeIn_0.2s_ease-in-out] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-buddy-brown">
            {species} Care Guide
          </h2>
          <button
            onClick={onClose}
            className="text-buddy-brown hover:text-buddy-brown/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
    </div>
  );
};

export default PlantCareModal;
