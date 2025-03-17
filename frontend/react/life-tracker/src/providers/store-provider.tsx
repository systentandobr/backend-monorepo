'use client';

import React, { useRef, useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';

/**
 * Provider para inicializar o store Zustand com parâmetros do lado do cliente
 * Evita erros de hidratação com Next.js
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialized = useRef(false);
  
  // Inicializa o resetHabitsDaily no lado do cliente
  useEffect(() => {
    if (!initialized.current) {
      // Configura o resetHabitsDaily para executar à meia-noite
      const setupResetHabitsAtMidnight = () => {
        const now = new Date();
        const night = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0, 0, 0
        );
        
        const msUntilMidnight = night.getTime() - now.getTime();
        
        return setTimeout(() => {
          useHabitStore.getState().resetHabitsDaily();
          
          // Configura novamente para a próxima meia-noite
          const nextTimeout = setupResetHabitsAtMidnight();
          return () => clearTimeout(nextTimeout);
        }, msUntilMidnight);
      };
      
      const timeoutId = setupResetHabitsAtMidnight();
      initialized.current = true;
      
      return () => clearTimeout(timeoutId);
    }
  }, []);
  
  return <>{children}</>;
}