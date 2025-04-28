import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WateringTrackerProps {
  wateringHistory: string[];
  lastWatered: string;
  onDateClick: (date: Date, isRemoving: boolean) => void;
}

const WateringTracker: React.FC<WateringTrackerProps> = ({ wateringHistory, lastWatered, onDateClick }) => {
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [currentDate, setCurrentDate] = useState(new Date());

  const getCurrentMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Adjust first day to start from Monday (1) instead of Sunday (0)
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Add empty days for padding at the start
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const wasWateredOnDate = (date: Date | null) => {
    if (!date) return false;
    return wateringHistory.some(historyDate => {
      const waterDate = new Date(historyDate);
      return waterDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date, isCurrentlyWatered: boolean) => {
    onDateClick(date, isCurrentlyWatered);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    if (nextMonth <= new Date()) {
      setCurrentDate(nextMonth);
    }
  };

  const monthDays = getCurrentMonthDays(currentDate);
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weeksInMonth = Math.ceil(monthDays.length / 7);
  const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && 
                        new Date().getFullYear() === currentDate.getFullYear();

  return (
    <div className="mt-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 text-buddy-brown hover:text-buddy-green transition-colors duration-200"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h4 className="text-center text-sm font-medium text-gray-600">
          {currentMonth}
        </h4>
        <button
          onClick={goToNextMonth}
          className={`p-1 transition-colors duration-200 ${
            isCurrentMonth 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-buddy-brown hover:text-buddy-green'
          }`}
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex justify-between mb-1">
        {DAYS.map((day, index) => (
          <div key={index} className="w-8 text-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {Array.from({ length: weeksInMonth }).map((_, weekIndex) => (
        <div key={weekIndex} className="flex justify-between mb-1">
          {DAYS.map((_, dayIndex) => {
            const dayOffset = weekIndex * 7 + dayIndex;
            const currentDate = monthDays[dayOffset];
            
            if (!currentDate) {
              return (
                <div
                  key={dayIndex}
                  className="w-8 h-8 flex items-center justify-center"
                />
              );
            }

            const isWatered = wasWateredOnDate(currentDate);
            const isLastWatered = lastWatered && new Date(lastWatered).toDateString() === currentDate.toDateString();
            const isPastDate = currentDate <= new Date();
            
            return (
              <div
                key={dayIndex}
                className="w-8 h-8 flex items-center justify-center"
                onClick={(e) => {
                  if (isPastDate) {
                    e.stopPropagation();
                    handleDateClick(currentDate, isWatered || isLastWatered);
                  }
                }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-200 ${
                    !isPastDate
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isLastWatered
                      ? 'bg-emerald-500 text-white cursor-pointer'
                      : isWatered
                      ? 'bg-emerald-400 text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  {currentDate.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WateringTracker;