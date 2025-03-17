
// src/components/integration/holistic-goal-tracker.tsx
import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';

interface HolisticGoalProps {
  goalId: number;
  showRelatedItems?: boolean;
  editMode?: boolean;
}

// Mock data
const holisticGoalData = {
  id: 1,
  title: "Franquia de Tecnologia",
  description: "Preparação completa para abrir uma franquia no setor de tecnologia",
  progress: 45,
  deadline: "2025-06-30",
  modules: {
    financial: {
      name: "Preparação Financeira",
      tasks: [
        { id: 1, name: "Economizar R$ 50.000", completed: true },
        { id: 2, name: "Obter aprovação de financiamento", completed: false },
        { id: 3, name: "Criar plano de investimento", completed: true }
      ],
      progress: 66
    },
    habits: {
      name: "Hábitos de Preparação",
      tasks: [
        { id: 4, name: "Estudar o mercado", completed: true },
        { id: 5, name: "Networking com franqueados", completed: false },
        { id: 6, name: "Curso de gestão", completed: false }
      ],
      progress: 33
    },
    business: {
      name: "Preparo para Negócios",
      tasks: [
        { id: 7, name: "Analisar modelos de franquia", completed: true },
        { id: 8, name: "Visitar unidades existentes", completed: false },
        { id: 9, name: "Conversar com representantes", completed: false }
      ],
      progress: 33
    }
  }
};

export const HolisticGoalTracker: React.FC<HolisticGoalProps> = ({
  goalId,
  showRelatedItems = true,
  editMode = false
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(holisticGoalData.deadline);

  return (
    <div className="space-y-4">
      <div className="bg-dark-background rounded-lg p-4">
        <h3 className="text-white font-medium mb-1">{holisticGoalData.title}</h3>
        <p className="text-sm text-gray-400 mb-3">{holisticGoalData.description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-white">Progresso Geral</div>
            <div className="text-sm text-gray-400">{holisticGoalData.progress}%</div>
          </div>
          <ProgressBar value={holisticGoalData.progress} color="primary" />
        </div>
        
        <div className="flex items-center text-sm text-gray-400">
          <Clock size={16} className="mr-1" />
          <span>
            Data limite: {formatDate(holisticGoalData.deadline)} ({daysRemaining} dias restantes)
          </span>
        </div>
      </div>
      
      {showRelatedItems && (
        <div className="space-y-3">
          {/* Financial Module Tasks */}
          <div className="bg-dark-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-medium">{holisticGoalData.modules.financial.name}</h4>
              <div className="text-sm text-gray-400">{holisticGoalData.modules.financial.progress}%</div>
            </div>
            
            <ProgressBar 
              value={holisticGoalData.modules.financial.progress} 
              color="primary"
              size="small"
              className="mb-3"
            />
            
            <div className="space-y-2">
              {holisticGoalData.modules.financial.tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 
                      ${task.completed ? 'bg-green-500 text-white' : 'border border-gray-600'}`}
                    >
                      {task.completed && <Check size={12} />}
                    </div>
                    <span className={`text-sm ${task.completed ? 'text-gray-400' : 'text-white'}`}>
                      {task.name}
                    </span>
                  </div>
                  
                  {editMode && (
                    <button className="text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Habits Module Tasks */}
          <div className="bg-dark-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-medium">{holisticGoalData.modules.habits.name}</h4>
              <div className="text-sm text-gray-400">{holisticGoalData.modules.habits.progress}%</div>
            </div>
            
            <ProgressBar 
              value={holisticGoalData.modules.habits.progress} 
              color="primary"
              size="small"
              className="mb-3"
            />
            
            <div className="space-y-2">
              {holisticGoalData.modules.habits.tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 
                      ${task.completed ? 'bg-green-500 text-white' : 'border border-gray-600'}`}
                    >
                      {task.completed && <Check size={12} />}
                    </div>
                    <span className={`text-sm ${task.completed ? 'text-gray-400' : 'text-white'}`}>
                      {task.name}
                    </span>
                  </div>
                  
                  {editMode && (
                    <button className="text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Business Module Tasks */}
          <div className="bg-dark-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-medium">{holisticGoalData.modules.business.name}</h4>
              <div className="text-sm text-gray-400">{holisticGoalData.modules.business.progress}%</div>
            </div>
            
            <ProgressBar 
              value={holisticGoalData.modules.business.progress} 
              color="primary"
              size="small"
              className="mb-3"
            />
            
            <div className="space-y-2">
              {holisticGoalData.modules.business.tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 
                      ${task.completed ? 'bg-green-500 text-white' : 'border border-gray-600'}`}
                    >
                      {task.completed && <Check size={12} />}
                    </div>
                    <span className={`text-sm ${task.completed ? 'text-gray-400' : 'text-white'}`}>
                      {task.name}
                    </span>
                  </div>
                  
                  {editMode && (
                    <button className="text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};