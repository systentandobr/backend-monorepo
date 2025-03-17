import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Habit, Settings, UserData } from '@/types';

interface HabitStore {
  // Estado
  habits: Habit[];
  categories: Category[];
  settings: Settings;
  onboardingCompleted: boolean;
  userData: UserData;
  
  // Ações
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'completed'>) => void;
  updateHabit: (id: number, data: Partial<Habit>) => void;
  removeHabit: (id: number) => void;
  toggleHabitCompletion: (id: number) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, data: Partial<Category>) => void;
  removeCategory: (id: number) => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
  completeOnboarding: () => void;
  updateUserData: (data: Partial<UserData>) => void;
  resetHabitsDaily: () => void;
}

// Dados iniciais
const initialHabits: Habit[] = [
  {
    id: 1,
    name: 'Beba água',
    icon: 'water',
    color: '#0984e3',
    categoryId: 1,
    description: 'A água lhe mantém hidratado e elimina as toxinas',
    target: '8 copos por dia',
    streak: 3,
    completed: false,
    timeOfDay: 'morning',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Mais exemplos de hábitos...
];

const initialCategories: Category[] = [
  { id: 1, name: 'Corpo saudável', icon: 'diet', color: '#00b894', habits: [1, 2] },
  { id: 2, name: 'Melhor sono', icon: 'sleep', color: '#9b59b6', habits: [3, 5] },
  { id: 3, name: 'Desenvolvimento pessoal', icon: 'journal', color: '#e84393', habits: [4, 6] }
];

const initialSettings: Settings = {
  theme: 'dark',
  notifications: true,
  reminderTime: '20:00',
  weekStartsOn: 1, // Segunda-feira
  showStreak: true
};

const initialUserData: UserData = {
  goal: '',
  wakeupTime: '07:00',
  sleepTime: '23:00',
  focusLevel: 'medium'
};

// Cria o store
export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      habits: initialHabits,
      categories: initialCategories,
      settings: initialSettings,
      onboardingCompleted: false,
      userData: initialUserData,
      
      // Implementações das ações
      addHabit: (habitData) => {
        const habit: Habit = {
          id: Date.now(),
          streak: 0,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...habitData
        };
        
        set((state) => ({
          habits: [...state.habits, habit],
          categories: state.categories.map(category => 
            category.id === habitData.categoryId
              ? { ...category, habits: [...category.habits, habit.id] }
              : category
          )
        }));
      },
      
      updateHabit: (id, data) => set((state) => {
        const oldHabit = state.habits.find(h => h.id === id);
        const oldCategoryId = oldHabit?.categoryId;
        const newCategoryId = data.categoryId;
        
        // Atualiza o hábito
        const updatedHabits = state.habits.map(habit => 
          habit.id === id 
            ? { ...habit, ...data, updatedAt: new Date() } 
            : habit
        );
        
        // Se a categoria mudou, também atualiza as categorias
        let updatedCategories = state.categories;
        
        if (oldCategoryId !== newCategoryId && oldCategoryId && newCategoryId) {
          updatedCategories = state.categories.map(category => {
            if (category.id === oldCategoryId) {
              return { 
                ...category, 
                habits: category.habits.filter(hId => hId !== id) 
              };
            }
            
            if (category.id === newCategoryId) {
              return { 
                ...category, 
                habits: [...category.habits, id] 
              };
            }
            
            return category;
          });
        }
        
        return {
          habits: updatedHabits,
          categories: updatedCategories
        };
      }),
      
      removeHabit: (id) => set((state) => {
        const habit = state.habits.find(h => h.id === id);
        
        return {
          habits: state.habits.filter(h => h.id !== id),
          categories: state.categories.map(category => 
            category.id === habit?.categoryId
              ? { ...category, habits: category.habits.filter(hId => hId !== id) }
              : category
          )
        };
      }),
      
      toggleHabitCompletion: (id) => set((state) => ({
        habits: state.habits.map(habit => 
          habit.id === id 
            ? { 
                ...habit, 
                completed: !habit.completed,
                streak: !habit.completed ? habit.streak + 1 : habit.streak > 0 ? habit.streak - 1 : 0,
                updatedAt: new Date()
              } 
            : habit
        )
      })),
      
      addCategory: (categoryData) => {
        const category: Category = {
          id: Date.now(),
          ...categoryData
        };
        
        set((state) => ({
          categories: [...state.categories, category]
        }));
      },
      
      updateCategory: (id, data) => set((state) => ({
        categories: state.categories.map(category => 
          category.id === id 
            ? { ...category, ...data } 
            : category
        )
      })),
      
      removeCategory: (id) => set((state) => {
        // Remover categoria e também atualizar hábitos associados
        const habitsToUpdate = state.habits.filter(h => h.categoryId === id);
        
        return {
          categories: state.categories.filter(c => c.id !== id),
          habits: state.habits.map(habit => 
            habit.categoryId === id 
              ? { ...habit, categoryId: 0 } // Define como "sem categoria"
              : habit
          )
        };
      }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      completeOnboarding: () => set({ onboardingCompleted: true }),
      
      updateUserData: (data) => set((state) => ({
        userData: { ...state.userData, ...data }
      })),
      
      resetHabitsDaily: () => set((state) => ({
        habits: state.habits.map(habit => ({
          ...habit,
          completed: false,
          updatedAt: new Date()
        }))
      }))
    }),
    {
      name: 'life-tracker-storage',
      partialize: (state) => ({
        habits: state.habits,
        categories: state.categories,
        settings: state.settings,
        onboardingCompleted: state.onboardingCompleted,
        userData: state.userData
      })
    }
  )
);
