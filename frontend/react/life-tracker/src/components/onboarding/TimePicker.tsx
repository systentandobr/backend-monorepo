'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TimePickerProps {
  question: string;
  description?: string;
  onTimeSelected: (time: string) => void;
  defaultTime?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  question,
  description,
  onTimeSelected,
  defaultTime = '07:00',
  className,
}) => {
  const [selectedHour, setSelectedHour] = useState<string>(defaultTime.split(':')[0]);
  const [selectedMinute, setSelectedMinute] = useState<string>(defaultTime.split(':')[1]);
  
  // Gera valores para o seletor
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  
  // Atualiza o valor quando as seleções mudam
  useEffect(() => {
    onTimeSelected(`${selectedHour}:${selectedMinute}`);
  }, [selectedHour, selectedMinute, onTimeSelected]);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <h2 className="text-2xl font-bold text-white text-center mb-2">{question}</h2>
      {description && (
        <p className="text-gray-400 text-center mb-8">{description}</p>
      )}
      
      <div className="relative mt-8 mb-12">
        {/* Background decorativo */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-32 h-32 bg-amber-500/10 rounded-full blur-lg"></div>
          <div className="absolute -left-4 top-5 w-8 h-8 bg-teal-500/20 rounded-full"></div>
          <div className="absolute -right-2 top-10 w-6 h-6 bg-teal-600/20 rounded-full"></div>
        </div>
        
        <div className="flex justify-center items-center">
          <div className="flex space-x-2 items-center py-8 px-6 bg-dark-card rounded-lg shadow-lg">
            {/* Seletor de hora */}
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="h-12 bg-primary/10 w-16 rounded-md"></div>
              </div>
              <div className="h-48 overflow-y-auto scrollbar-hide py-[84px] px-2 snap-y snap-mandatory">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "h-12 flex items-center justify-center snap-center cursor-pointer",
                      selectedHour === hour ? "text-white text-2xl font-bold" : "text-gray-500"
                    )}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-2xl font-bold text-white">:</div>
            
            {/* Seletor de minuto */}
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="h-12 bg-primary/10 w-16 rounded-md"></div>
              </div>
              <div className="h-48 overflow-y-auto scrollbar-hide py-[84px] px-2 snap-y snap-mandatory">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    className={cn(
                      "h-12 flex items-center justify-center snap-center cursor-pointer",
                      selectedMinute === minute ? "text-white text-2xl font-bold" : "text-gray-500"
                    )}
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onTimeSelected(`${selectedHour}:${selectedMinute}`)}
        className="w-full py-4 px-6 bg-accent hover:bg-accent-light text-white font-semibold rounded-full transition-colors"
      >
        Continuar
      </motion.button>
    </div>
  );
};

export default TimePicker;
