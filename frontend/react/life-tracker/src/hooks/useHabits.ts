import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { Habit, HabitFilter } from '@/types';

export const useHabits = () => {
  const { 
    habits, 
    toggleHabitCompletion, 
    addHabit, 
    updateHabit, 
    removeHabit 
  } = useHabitStore();
  
  const [filter, setFilter] = useState<HabitFilter>('all');
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>(habits);
  
  // Filtrar hábitos quando a lista ou o filtro mudar
  useEffect(() => {
    setFilteredHabits(filterHabits(habits, filter));
  }, [habits, filter]);
  
  // Função para filtrar hábitos
  const filterHabits = (habitsList: Habit[], currentFilter: HabitFilter): Habit[] => {
    switch (currentFilter) {
      case 'morning':
        return habitsList.filter(habit => habit.timeOfDay === 'morning');
      case 'afternoon':
        return habitsList.filter(habit => habit.timeOfDay === 'afternoon');
      case 'evening':
        return habitsList.filter(habit => habit.timeOfDay === 'evening');
      case 'incomplete':
        return habitsList.filter(habit => !habit.completed);
      case 'all':
      default:
        return habitsList;
    }
  };
  
  // Obter hábitos por categoria
  const getHabitsByCategory = (categoryId: number): Habit[] => {
    return habits.filter(habit => habit.categoryId === categoryId);
  };
  
  // Calcular progresso da categoria
  const getCategoryProgress = (categoryId: number): number => {
    const categoryHabits = getHabitsByCategory(categoryId);
    if (categoryHabits.length === 0) return 0;
    
    const completedCount = categoryHabits.filter(habit => habit.completed).length;
    return Math.round((completedCount / categoryHabits.length) * 100);
  };
  
  // Calcular progresso diário geral
  const getDailyProgress = (): number => {
    if (habits.length === 0) return 0;
    
    const completedCount = habits.filter(habit => habit.completed).length;
    return Math.round((completedCount / habits.length) * 100);
  };
  
  return {
    habits,
    filteredHabits,
    filter,
    setFilter,
    toggleHabitCompletion,
    addHabit,
    updateHabit,
    removeHabit,
    getHabitsByCategory,
    getCategoryProgress,
    getDailyProgress
  };
};
