'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';

// Ícone personalizado para criptomoedas
const CryptoIcon = ({ size = 24, ...props }) => {
  return (
    <div style={{ position: 'relative', width: size, height: size }} {...props}>
      <DollarSign 
        size={size} 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(15deg)',
          color: '#f7931a' // Cor do Bitcoin
        }} 
      />
    </div>
  );
};

export default CryptoIcon;
