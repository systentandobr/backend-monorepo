// src/components/habit/goal-card.tsx
import React, { useState } from 'react';
import { CheckCircle, Circle, Activity, DollarSign, Briefcase, Calendar, Clock, ChevronDown, ChevronUp, Award, Bell, Edit, Trash2 } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';

// Interface para tarefa relacionada à meta
interface GoalTask {
  id: number;
  name: string;
  completed: boolean;
  dueDate?: string;
  module: 'habits' | 'finance' | 'business';
}

// Interface principal para o componente GoalCard
interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  icon?: React.ReactNode;
  linkedModules?: ('habits' | 'finance' | 'business')[];
  goalType?: 'short' | 'medium' | 'long';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tasks?: GoalTask[];
  onEdit?: () => void;
  onDelete?: () => void;
  onTaskToggle?: (taskId: number, completed: boolean) => void;
  expanded?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  description,
  progress,
  icon,
  linkedModules = [],
  goalType = 'medium',
  dueDate,
  priority = 'medium',
  tasks = [],
  onEdit,
  onDelete,
  onTaskToggle,
  expanded: initialExpanded = false
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Obter o ícone para o tipo de módulo
  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'habits':
        return <Activity size={14} className="text-green-500" />;
      case 'finance':
        return <DollarSign size={14} className="text-primary" />;
      case 'business':
        return <Briefcase size={14} className="text-accent-main" />;
      default:
        return null;
    }
  };

  // Obter o nome do módulo
  const getModuleName = (module: string) => {
    switch (module) {
      case 'habits':
        return 'Hábitos';
      case 'finance':
        return 'Finanças';
      case 'business':
        return 'Negócios';
      default:
        return module;
    }
  };

  // Obter a cor do ícone de prioridade
  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'low':
        return 'text-gray-400';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Contar dias restantes
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    
    // Resetar horas para comparar apenas datas
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(dueDate);

  // Agrupar tarefas por módulo
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.module]) {
      acc[task.module] = [];
    }
    acc[task.module].push(task);
    return acc;
  }, {} as Record<string, GoalTask[]>);

  return (
    <div className="bg-dark-background rounded-lg p-4">
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {progress >= 100 ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <Circle size={20} className="text-gray-500" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h3 className="text-white font-medium">{title}</h3>
                {icon && (
                  <div className="ml-2">
                    {icon}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
            
            <div className="relative">
              <button 
                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-dark-card"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-8 bg-dark-card border border-dark-border rounded-md shadow-lg z-10 py-1 w-36">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-dark-background"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit && onEdit();
                    }}
                  >
                    <Edit size={14} className="mr-2" />
                    Editar
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-dark-background"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete && onDelete();
                    }}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <ProgressBar 
              value={progress} 
              max={100} 
              color={progress >= 100 ? 'success' : 'primary'}
              size="small"
            />
          </div>
          
          <div className="flex flex-wrap items-center mt-3 gap-y-2">
            {/* Tipo de meta */}
            <div className="flex items-center bg-dark-card px-2 py-1 rounded text-xs mr-2">
              <Award size={14} className="mr-1 text-blue-500" />
              <span className="text-gray-400">
                {goalType === 'short' ? 'Curto prazo' : 
                 goalType === 'medium' ? 'Médio prazo' : 'Longo prazo'}
              </span>
            </div>
            
            {/* Data de vencimento */}
            {dueDate && (
              <div className="flex items-center bg-dark-card px-2 py-1 rounded text-xs mr-2">
                <Calendar size={14} className="mr-1 text-purple-500" />
                <span className="text-gray-400">{formatDate(dueDate)}</span>
              </div>
            )}
            
            {/* Prioridade */}
            <div className="flex items-center bg-dark-card px-2 py-1 rounded text-xs mr-2">
              <Bell size={14} className={`mr-1 ${getPriorityColor(priority)}`} />
              <span className="text-gray-400">
                {priority === 'low' ? 'Baixa prioridade' : 
                 priority === 'medium' ? 'Média prioridade' : 'Alta prioridade'}
              </span>
            </div>
            
            {/* Dias restantes */}
            {daysRemaining !== null && (
              <div className="flex items-center bg-dark-card px-2 py-1 rounded text-xs">
                <Clock size={14} className="mr-1 text-yellow-500" />
                <span className="text-gray-400">
                  {daysRemaining > 0 
                    ? `${daysRemaining} dias restantes` 
                    : daysRemaining === 0 
                      ? 'Hoje!' 
                      : `${Math.abs(daysRemaining)} dias atrasado`
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Módulos relacionados */}
          {linkedModules.length > 0 && (
            <div className="flex mt-3 space-x-2">
              {linkedModules.map((module) => (
                <div 
                  key={module} 
                  className="flex items-center bg-dark-card px-2 py-1 rounded text-xs"
                >
                  {getModuleIcon(module)}
                  <span className="ml-1 text-gray-400">
                    {getModuleName(module)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Botão para expandir/recolher */}
          {tasks.length > 0 && (
            <button 
              className="flex items-center text-xs text-gray-400 mt-3 hover:text-white"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp size={14} className="mr-1" />
                  Recolher tarefas
                </>
              ) : (
                <>
                  <ChevronDown size={14} className="mr-1" />
                  Ver tarefas ({tasks.length})
                </>
              )}
            </button>
          )}
          
          {/* Tarefas relacionadas (expandidas) */}
          {expanded && tasks.length > 0 && (
            <div className="mt-4 space-y-4">
              {Object.entries(groupedTasks).map(([module, moduleTasks]) => (
                <div key={module} className="bg-dark-card p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    {getModuleIcon(module)}
                    <span className="text-sm text-white ml-1">
                      Tarefas de {getModuleName(module)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {moduleTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 cursor-pointer
                              ${task.completed 
                                ? 'bg-green-500 text-white' 
                                : 'border border-gray-600'}`
                            }
                            onClick={() => onTaskToggle && onTaskToggle(task.id, !task.completed)}
                          >
                            {task.completed && (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="12" 
                                height="12" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                              {task.name}
                            </span>
                            {task.dueDate && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                <Clock size={10} className="inline mr-1" />
                                {formatDate(task.dueDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                + Adicionar nova tarefa
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};