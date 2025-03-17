#!/bin/bash

# Script para configurar o projeto Life Tracker com Next.js, TypeScript, Tailwind CSS e HeroUI

# Cria um novo projeto Next.js com TypeScript
echo "Criando novo projeto Next.js com TypeScript..."
# npx create-next-app@latest life-tracker --typescript --eslint --tailwind --app

# Navega para o diretório do projeto
cd life-tracker

# Instala dependências adicionais
echo "Instalando dependências..."
# npm install @heroicons/react zustand jotai react-hook-form zod @hookform/resolvers next-themes date-fns recharts

# Cria a estrutura de diretórios
echo "Criando estrutura de diretórios..."

# Pasta para componentes
mkdir -p src/components/habit
mkdir -p src/components/category
mkdir -p src/components/navigation
mkdir -p src/components/calendar
mkdir -p src/components/onboarding
mkdir -p src/components/notification

# Pasta para hooks
mkdir -p src/hooks

# Pasta para UI components
mkdir -p src/components/ui

# Pasta para páginas e layouts
mkdir -p "src/app/(dashboard)"
mkdir -p "src/app/(auth)"
mkdir -p src/app/habit/[id]
mkdir -p src/app/category/[id]
mkdir -p src/app/onboarding
mkdir -p src/app/stats
mkdir -p src/app/settings

# Pasta para contexts/providers
mkdir -p src/providers

# Pasta para utilidades
mkdir -p src/utils

# Pasta para assets
mkdir -p src/assets/theme
mkdir -p src/assets/icons

# Pasta para tipos
mkdir -p src/types

# Pasta para store (Zustand)
mkdir -p src/store

# Cria arquivos base
echo "Criando arquivos base..."

# Configuração do Tailwind
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Cores principais
        primary: {
          DEFAULT: "#004f4f",
          light: "#006d6d",
          dark: "#003535",
        },
        accent: {
          DEFAULT: "#ff7d50",
          light: "#ff9b78",
          dark: "#dd5c30",
        },
        // Cores de feedback
        success: "#00b894",
        warning: "#fdcb6e",
        error: "#d63031",
        info: "#0984e3",
        // Categorias
        category: {
          health: "#00b894",
          sleep: "#9b59b6",
          personal: "#e84393",
          work: "#3498db",
          finance: "#f39c12",
        },
        // Tons para o modo escuro
        dark: {
          background: "#121212",
          card: "#1e1e1e",
          border: "#333333",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOL

# Arquivo de tipos principais
cat > src/types/index.ts << 'EOL'
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
EOL

# Cria um arquivo de exemplo para o store Zustand
cat > src/store/habitStore.ts << 'EOL'
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
EOL

# Cria um exemplo de hook TypeScript
cat > src/hooks/useHabits.ts << 'EOL'
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
EOL

# Cria um componente de botão baseado em TypeScript
cat > src/components/ui/button.tsx << 'EOL'
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-light",
        accent: "bg-accent text-white hover:bg-accent-light",
        success: "bg-success text-white hover:bg-success/90",
        warning: "bg-warning text-black hover:bg-warning/90",
        error: "bg-error text-white hover:bg-error/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        true: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      rounded: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
EOL

# Cria um componente de habit item em TypeScript
cat > src/components/habit/HabitItem.tsx << 'EOL'
import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/utils/cn";
import { useHabitStore } from "@/store/habitStore";
import { Habit } from "@/types";

interface HabitItemProps {
  habit: Habit;
  compact?: boolean;
  showStreak?: boolean;
}

const HabitItem = ({ habit, compact = false, showStreak = true }: HabitItemProps) => {
  const router = useRouter();
  const { toggleHabitCompletion } = useHabitStore();
  
  // Manipula o clique no hábito para navegar para os detalhes
  const handleClick = () => {
    router.push(`/habit/${habit.id}`);
  };
  
  // Manipula o clique no checkbox para marcar/desmarcar o hábito
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita propagação para o card
    toggleHabitCompletion(habit.id);
  };
  
  return (
    <div 
      onClick={handleClick}
      className={cn(
        "bg-dark-card rounded-lg transition-all cursor-pointer hover:-translate-y-1 hover:shadow-md",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "rounded-full flex items-center justify-center",
              compact ? "w-8 h-8" : "w-10 h-10"
            )}
            style={{ backgroundColor: habit.color }}
          >
            <span className={cn(compact ? "text-sm" : "text-base")}>
              {/* Você pode usar um componente de ícone aqui baseado no habit.icon */}
              {habit.icon}
            </span>
          </div>
          
          <div>
            <h3 className="font-medium text-white">
              {habit.name}
            </h3>
            
            {!compact && habit.description && (
              <p className="text-xs text-gray-400">
                {habit.description}
              </p>
            )}
            
            {showStreak && habit.streak > 0 && (
              <div className="mt-1">
                <span className="text-xs px-2 py-1 bg-primary/80 text-white rounded-full">
                  Série de {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          className="focus:outline-none"
        >
          {habit.completed ? (
            <CheckCircle className="h-6 w-6 text-success" />
          ) : (
            <Circle className="h-6 w-6 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
};

export default HabitItem;
EOL

# Cria um componente de dashboard page em TypeScript
cat > "src/app/(dashboard)/page.tsx" << 'EOL'
"use client";

import React, { useState, useEffect } from "react";
import { useHabitStore } from "@/store/habitStore";
import { useHabits } from "@/hooks/useHabits";
import { Habit, HabitFilter } from "@/types";
import HabitItem from "@/components/habit/HabitItem";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { habits, onboardingCompleted, settings } = useHabitStore();
  const [activeTab, setActiveTab] = useState<HabitFilter>("all");
  const [showStreakAlert, setShowStreakAlert] = useState(false);
  
  // Se o onboarding não foi concluído, redireciona
  useEffect(() => {
    if (!onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [onboardingCompleted, router]);
  
  // Filtra os hábitos com base na aba ativa
  const filteredHabits = habits.filter(habit => {
    if (activeTab === "all") return true;
    if (activeTab === "morning") return habit.timeOfDay === "morning";
    if (activeTab === "afternoon") return habit.timeOfDay === "afternoon";
    if (activeTab === "evening") return habit.timeOfDay === "evening";
    if (activeTab === "incomplete") return !habit.completed;
    return true;
  });
  
  // Verifica se algum hábito tem uma série contínua
  useEffect(() => {
    const hasStreakMilestone = habits.some(
      habit => habit.streak > 0 && habit.streak % 7 === 0 && habit.completed
    );
    
    if (hasStreakMilestone) {
      setShowStreakAlert(true);
    }
  }, [habits]);
  
  // Fecha o alerta de série
  const dismissStreakAlert = () => {
    setShowStreakAlert(false);
  };
  
  // Renderiza as abas de filtro
  const renderFilterTabs = () => (
    <div className="flex justify-around mb-6 border-b border-dark-border pb-2">
      <button
        onClick={() => setActiveTab("all")}
        className={`px-3 py-2 ${
          activeTab === "all"
            ? "text-white font-semibold border-b-2 border-primary"
            : "text-gray-400"
        }`}
      >
        Todos
      </button>
      <button
        onClick={() => setActiveTab("morning")}
        className={`px-3 py-2 ${
          activeTab === "morning"
            ? "text-white font-semibold border-b-2 border-primary"
            : "text-gray-400"
        }`}
      >
        Manhã
      </button>
      <button
        onClick={() => setActiveTab("afternoon")}
        className={`px-3 py-2 ${
          activeTab === "afternoon"
            ? "text-white font-semibold border-b-2 border-primary"
            : "text-gray-400"
        }`}
      >
        Tarde
      </button>
      <button
        onClick={() => setActiveTab("evening")}
        className={`px-3 py-2 ${
          activeTab === "evening"
            ? "text-white font-semibold border-b-2 border-primary"
            : "text-gray-400"
        }`}
      >
        Noite
      </button>
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-background text-white">
      {/* Cabeçalho */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Hoje</h1>
        <button className="p-2 rounded-full hover:bg-dark-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>
      
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full mb-16">
        {/* Filtros */}
        {renderFilterTabs()}
        
        {/* Lista de hábitos */}
        <div className="flex flex-col gap-4">
          {filteredHabits.length > 0 ? (
            filteredHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                showStreak={settings.showStreak}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-4">Nenhum hábito encontrado para este filtro.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("all")}
              >
                Ver todos os hábitos
              </Button>
            </div>
          )}
        </div>
        
        {/* Botão de adicionar */}
        <div className="fixed bottom-24 right-6">
          <Button
            variant="accent"
            size="icon"
            rounded
            className="w-14 h-14 shadow-lg"
            onClick={() => router.push("/habit/new")}
          >
            <PlusCircle size={24} />
          </Button>
        </div>
      </main>
      
      {/* Barra de navegação inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border py-3 px-4">
        <div className="flex justify-around">
          {/* Botões de navegação */}
          <button className="flex flex-col items-center text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs mt-1">Hoje</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span className="text-xs mt-1">Desafios</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="text-xs mt-1">Estat.</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span className="text-xs mt-1">Explore</span>
          </button>
        </div>
      </nav>
      
      {/* Alerta de série (condicionalmente renderizado) */}
      {showStreakAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-indigo-900 p-6 rounded-lg text-center w-4/5 max-w-md">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-3xl">⭐</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Série de 7 dias</h2>
            <p className="text-white text-sm mb-6">
              O recorde de série no Life Tracker é de mais de 400 dias. Pronto para superá-lo?!
            </p>
            <Button
              variant="accent"
              fullWidth
              onClick={dismissStreakAlert}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
EOL

# Cria um arquivo de utilidade para o Tailwind
cat > src/utils/cn.ts << 'EOL'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes do Tailwind de forma eficiente, evitando conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOL

# Cria um layout para o dashboard
cat > "src/app/(dashboard)/layout.tsx" << 'EOL'
import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-dark-background text-white">
        {children}
      </div>
    </ThemeProvider>
  );
}
EOL

# Cria um provider de tema
cat > src/providers/theme-provider.tsx << 'EOL'
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
EOL

# Adiciona um arquivo de barril para hooks
cat > src/hooks/index.ts << 'EOL'
export * from './useHabits';
// Exporte outros hooks aqui à medida que os criar
EOL

echo "Setup concluído! A estrutura do projeto Life Tracker com TypeScript, Next.js, e Tailwind CSS foi configurada."
echo "Você pode iniciar o servidor de desenvolvimento com 'npm run dev' no diretório do projeto."