// src/components/ui/tabs.tsx
import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/utils/cn';

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) => {
  const [tabValue, setTabValue] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : tabValue;
  const handleValueChange = onValueChange || setTabValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex bg-dark-card rounded-md p-1', className)}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<{ 
  value: string; 
  children: React.ReactNode;
  className?: string;
}> = ({
  value,
  children,
  className,
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;
  
  return (
    <button
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isSelected
          ? 'bg-dark-background text-white'
          : 'text-gray-400 hover:text-white',
        className
      )}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ 
  value: string; 
  children: React.ReactNode;
  className?: string;
}> = ({
  value,
  children,
  className,
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { value: selectedValue } = context;
  
  if (selectedValue !== value) {
    return null;
  }
  
  return (
    <div className={cn('mt-2', className)}>
      {children}
    </div>
  );
};
