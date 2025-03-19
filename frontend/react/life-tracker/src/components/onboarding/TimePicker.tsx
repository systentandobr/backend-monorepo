import React, { useState, useEffect } from 'react';

export interface TimePickerProps {
  label: string;
  defaultTime: string;
  onTimeSelected: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  label, 
  defaultTime, 
  onTimeSelected 
}) => {
  const [selectedTime, setSelectedTime] = useState(defaultTime);

  useEffect(() => {
    if (defaultTime) {
      setSelectedTime(defaultTime);
    }
  }, [defaultTime]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    onTimeSelected(newTime);
  };

  return (
    <div className="w-full">
      <label className="block text-gray-400 mb-2">{label}</label>
      <input
        type="time"
        value={selectedTime}
        onChange={handleTimeChange}
        className="w-full p-3 bg-dark-background border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
      />
    </div>
  );
};

export default TimePicker;