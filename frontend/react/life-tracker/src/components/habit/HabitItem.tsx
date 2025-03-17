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
