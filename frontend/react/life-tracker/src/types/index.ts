// Tipos para hábitos
export interface Habit {
  id: number;
  name: string;
  icon: string;
  color?: string;
  categoryId: number;
  description?: string;
  target?: string;
  streak: number;
  completed: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para categorias
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  habits: number[];
}

// Tipos para configurações
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  reminderTime: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showStreak: boolean;
}

// Tipos para dados do usuário
export interface UserData {
  goal: string;
  wakeupTime: string;
  sleepTime: string;
  focusLevel: 'low' | 'medium' | 'high';
}

// Tipos para estatísticas de sequências
export interface StreakData {
  current: number;
  longest: number;
  history: {
    date: string;
    streak: number;
  }[];
}

// Tipos para respostas do onboarding
export interface OnboardingAnswers {
  goal: string;
  concentration: string;
  lifestyle: string;
  energy: string;
  wakeupTime: string;
}

// Tipos para filtros de hábitos
export type HabitFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'incomplete';
