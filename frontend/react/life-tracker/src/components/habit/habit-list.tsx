// src/components/habit/habit-list.tsx
import React, { useState } from 'react';
import { CheckSquare, Calendar, Star, BookOpen, Activity, Coffee, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';

interface Habit {
  id: number;
  name: string;
  description: string;
  icon: 'book' | 'activity' | 'coffee' | 'dollar' | 'star';
  category: 'personal' | 'finance' | 'business' | 'health';
  completed: boolean;
  streak: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  tags: string[];
}

// Mock data
const mockHabits: Habit[] = [
  {
    id: 1,
    name: 'Leitura diária',
    description: 'Ler 30 minutos por dia',
    icon: 'book',
    category: 'personal',
    completed: true,
    streak: 7,
    frequency: 'daily',
    tags: ['desenvolvimento', 'educação']
  },
  {
    id: 2,
    name: 'Exercício físico',
    description: '30 minutos de atividade',
    icon: 'activity',
    category: 'health',
    completed: false,
    streak: 0,
    frequency: 'daily',
    tags: ['saúde', 'bem-estar']
  },
  {
    id: 3,
    name: 'Revisar carteira',
    description: 'Analisar investimentos',
    icon: 'dollar',
    category: 'finance',
    completed: true,
    streak: 5,
    frequency: 'weekly',
    tags: ['investimentos', 'finança pessoal']
  },
  {
    id: 4,
    name: 'Networking',
    description: 'Contato com profissionais',
    icon: 'star',
    category: 'business',
    completed: false,
    streak: 2,
    frequency: 'weekly',
    tags: ['carreira', 'negócios']
  },
  {
    id: 5,
    name: 'Limitar cafeína',
    description: 'Substitua por chás',
    icon: 'coffee',
    category: 'health',
    completed: false,
    streak: 0,
    frequency: 'daily',
    tags: ['saúde', 'bem-estar']
  }
];

const getIconComponent = (iconName: string, className: string = 'text-white') => {
  switch (iconName) {
    case 'book':
      return <BookOpen className="text-blue-500" size={20} />;
    case 'activity':
      return <Activity className="text-green-500" size={20} />;
    case 'coffee':
      return <Coffee className="text-purple-500" size={20} />;
    case 'dollar':
      return <DollarSign className="text-yellow-500" size={20} />;
    case 'star':
      return <Star className="text-orange-500" size={20} />;
    default:
      return <CheckSquare className={className} size={20} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'personal':
      return 'bg-blue-500 bg-opacity-20';
    case 'finance':
      return 'bg-yellow-500 bg-opacity-20';
    case 'business':
      return 'bg-orange-500 bg-opacity-20';
    case 'health':
      return 'bg-green-500 bg-opacity-20';
    default:
      return 'bg-gray-500 bg-opacity-20';
  }
};

interface HabitListProps {
  compact?: boolean;
  limit?: number;
  filter?: 'all' | 'personal' | 'finance' | 'business' | 'health';
}

export const HabitList: React.FC<HabitListProps> = ({
  compact = false,
  limit,
  filter = 'all'
}) => {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  
  const filteredHabits = habits
    .filter(habit => filter === 'all' || habit.category === filter)
    .slice(0, limit);
  
  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white">Seus Hábitos</h2>
        {!compact && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filtrar
            </Button>
            <Button size="sm">
              + Novo
            </Button>
          </div>
        )}
      </div>
      
      {/* Progress Overview */}
      {!compact && (
        <Card className="mb-4 p-4">
          <h3 className="text-white font-medium mb-2">Progresso Diário</h3>
          <ProgressBar 
            value={filteredHabits.filter(h => h.completed).length} 
            max={filteredHabits.length}
            color="primary"
            showLabel
          />
          <div className="text-xs text-gray-400 mt-2">
            {filteredHabits.filter(h => h.completed).length} de {filteredHabits.length} hábitos concluídos
          </div>
        </Card>
      )}
      
      {/* Habit Items */}
      <div className="space-y-3">
        {filteredHabits.map((habit) => (
          <div 
            key={habit.id}
            className="flex items-center justify-between p-4 bg-dark-card rounded-lg"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getCategoryColor(habit.category)}`}>
                {getIconComponent(habit.icon)}
              </div>
              <div>
                <h3 className="text-white font-medium">{habit.name}</h3>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar size={12} className="mr-1" />
                  {habit.streak > 0 
                    ? `Série de ${habit.streak} ${habit.frequency === 'daily' ? 'dias' : 'semanas'}`
                    : habit.description
                  }
                </div>
              </div>
            </div>
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer
                ${habit.completed 
                  ? 'bg-green-500 text-white' 
                  : 'border border-gray-600'}`
              }
              onClick={() => toggleHabit(habit.id)}
            >
              {habit.completed && "✓"}
            </div>
          </div>
        ))}
      </div>
      
      {!compact && filteredHabits.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p>Nenhum hábito encontrado. Crie um novo!</p>
        </div>
      )}
      
      {!compact && filteredHabits.length > 0 && (
        <Button variant="ghost" className="w-full mt-2">
          Ver todos os hábitos
        </Button>
      )}
    </div>
  );
};

// // src/components/habit/goal-card.tsx
// import React from 'react';
// import { CheckCircle, Circle, Activity, DollarSign, Briefcase } from 'lucide-react';
// import { ProgressBar } from '@/components/ui/progress-bar';

// interface GoalCardProps {
//   title: string;
//   description: string;
//   progress: number;
//   icon?: React.ReactNode;
//   linkedModules?: ('habits' | 'finance' | 'business')[];
// }

// export const GoalCard: React.FC<GoalCardProps> = ({
//   title,
//   description,
//   progress,
//   icon,
//   linkedModules = []
// }) => {
//   const getModuleIcon = (module: string) => {
//     switch (module) {
//       case 'habits':
//         return <Activity size={14} className="text-green-500" />;
//       case 'finance':
//         return <DollarSign size={14} className="text-primary" />;
//       case 'business':
//         return <Briefcase size={14} className="text-accent-main" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="bg-dark-background rounded-lg p-4">
//       <div className="flex items-start mb-3">
//         <div className="mr-3 mt-1">
//           {progress >= 100 ? (
//             <CheckCircle size={20} className="text-green-500" />
//           ) : (
//             <Circle size={20} className="text-gray-500" />
//           )}
//         </div>
        
//         <div className="flex-1">
//           <div className="flex justify-between items-start">
//             <h3 className="text-white font-medium">{title}</h3>
//             {icon && (
//               <div className="ml-2">
//                 {icon}
//               </div>
//             )}
//           </div>
//           <p className="text-sm text-gray-400 mt-1">{description}</p>
          
//           <div className="mt-3">
//             <ProgressBar 
//               value={progress} 
//               max={100} 
//               color={progress >= 100 ? 'success' : 'primary'}
//               size="small"
//             />
//           </div>
          
//           {linkedModules.length > 0 && (
//             <div className="flex mt-3 space-x-2">
//               {linkedModules.map((module) => (
//                 <div 
//                   key={module} 
//                   className="flex items-center bg-dark-card px-2 py-1 rounded text-xs"
//                 >
//                   {getModuleIcon(module)}
//                   <span className="ml-1 text-gray-400">
//                     {module === 'habits' ? 'Hábitos' : 
//                      module === 'finance' ? 'Finanças' : 
//                      'Negócios'}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
