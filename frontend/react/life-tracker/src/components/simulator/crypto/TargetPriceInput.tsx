'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MinusCircle } from 'lucide-react';

interface TargetPriceInputProps {
  index: number;
  price: number;
  onChange: (value: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const TargetPriceInput: React.FC<TargetPriceInputProps> = ({
  index,
  price,
  onChange,
  onRemove,
  canRemove
}) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <label className="block text-xs text-gray-400 mb-1">Preço-Alvo {index+1} (R$)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || isNaN(Number(value))) return;
            onChange(parseFloat(value));
          }}
          className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          min="0"
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

export default TargetPriceInput;
