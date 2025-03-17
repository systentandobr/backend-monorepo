import { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { StreakData } from '@/types';
import { formatISO } from 'date-fns';

/**
 * Hook para calcular e gerenciar séries de hábitos
 * @param habitId ID do hábito
 */
export const useStreak = (habitId: number): StreakData => {
  const { habits } = useHabitStore();
  const habit = habits.find(h => h.id === habitId);
  
  const [streakData, setStreakData] = useState<StreakData>({
    current: habit?.streak || 0,
    longest: 0,
    history: []
  });
  
  // Carrega dados históricos de séries do localStorage
  useEffect(() => {
    if (habit) {
      try {
        const storedData = localStorage.getItem(`streak_${habitId}`);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData) as StreakData;
          setStreakData({
            ...parsedData,
            current: habit.streak // Sempre usa o valor atual do hábito
          });
        } else {
          setStreakData({
            current: habit.streak,
            longest: habit.streak,
            history: []
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados de streak:', error);
      }
    }
  }, [habitId, habit]);
  
  // Atualiza os dados quando a série mudar
  useEffect(() => {
    if (habit) {
      const newLongest = Math.max(streakData.longest, habit.streak);
      
      if (newLongest !== streakData.longest || streakData.current !== habit.streak) {
        const today = formatISO(new Date(), { representation: 'date' });
        
        const newData: StreakData = {
          current: habit.streak,
          longest: newLongest,
          history: [
            ...streakData.history,
            { date: today, streak: habit.streak }
          ]
        };
        
        // Remove entradas duplicadas do mesmo dia
        const uniqueHistory = newData.history.filter(
          (entry, index, self) =>
            index === self.findIndex((e) => e.date === entry.date)
        );
        
        newData.history = uniqueHistory;
        
        setStreakData(newData);
        
        try {
          localStorage.setItem(`streak_${habitId}`, JSON.stringify(newData));
        } catch (error) {
          console.error('Erro ao salvar dados de streak:', error);
        }
      }
    }
  }, [habitId, habit, streakData]);
  
  /**
   * Calcula estatísticas da série
   */
  const getStreakStats = () => {
    const lastWeekStreak = streakData.history
      .slice(-7)
      .reduce((acc, entry) => acc + (entry.streak > 0 ? 1 : 0), 0);
    
    const lastMonthStreak = streakData.history
      .slice(-30)
      .reduce((acc, entry) => acc + (entry.streak > 0 ? 1 : 0), 0);
    
    return {
      lastWeekStreak,
      lastMonthStreak,
      averageStreak: streakData.history.length > 0
        ? Math.round(streakData.history.reduce((acc, entry) => acc + entry.streak, 0) / streakData.history.length)
        : 0
    };
  };
  
  return {
    ...streakData,
    ...getStreakStats()
  } as StreakData & {
    lastWeekStreak: number;
    lastMonthStreak: number;
    averageStreak: number;
  };
};