'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MinusCircle } from 'lucide-react';

interface StageInputProps {
  index: number;
  percentage: number;
  allocation: number;
  onPercentageChange: (value: number) => void;
  onAllocationChange: (value: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const StageInput: React.FC<StageInputProps> = ({
  index,
  percentage,
  allocation,
  onPercentageChange,
  onAllocationChange,
  onRemove,
  canRemove
}) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <label className="block text-xs text-gray-400 mb-1">Queda (%)</label>
        <input
          type="number"
          value={percentage}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || isNaN(Number(value))) return;
            onPercentageChange(parseFloat(value));
          }}
          className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          min="0"
          max="100"
        />
      </div>
      
      <div className="flex-1">
        <label className="block text-xs text-gray-400 mb-1">Alocação (%)</label>
        <input
          type="number"
          value={allocation}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || isNaN(Number(value))) return;
            onAllocationChange(parseFloat(value));
          }}
          className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          min="0"
          max="100"
        />
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRemove}
        disabled={!canRemove}
        className="self-end mb-1"
      >
        <MinusCircle size={16} className="text-gray-400 hover:text-red-500" />
      </Button>
    </div>
  );
};

export default StageInput;
