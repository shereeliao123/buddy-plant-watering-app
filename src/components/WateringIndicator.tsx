import React from 'react';

interface WateringIndicatorProps {
  daysUntilWatering: number;
}

const WateringIndicator: React.FC<WateringIndicatorProps> = ({ daysUntilWatering }) => {
  let statusColor = '';
  let statusText = '';
  
  if (daysUntilWatering < 0) {
    statusColor = 'bg-red-100 border-red-200 text-red-800';
    statusText = 'Water now';
  } else if (daysUntilWatering === 0) {
    statusColor = 'bg-yellow-100 border-yellow-200 text-yellow-800';
    statusText = 'Water today';
  } else if (daysUntilWatering === 1) {
    statusColor = 'bg-blue-100 border-blue-200 text-blue-800';
    statusText = 'Water in 1 day';
  } else {
    statusColor = 'bg-blue-100 border-blue-200 text-blue-800';
    statusText = `Water in ${daysUntilWatering} days`;
  }
  
  return (
    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor} shadow-sm whitespace-nowrap inline-flex items-center`}>
      {statusText}
    </div>
  );
};

export default WateringIndicator;
