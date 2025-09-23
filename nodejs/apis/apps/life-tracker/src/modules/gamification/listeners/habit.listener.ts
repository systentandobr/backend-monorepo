import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GamificationService } from '../gamification.service';

export interface HabitCompletedEvent {
  userId: string;
  habitId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  streak?: number;
  habitName?: string;
}

@Injectable()
export class HabitListener {
  constructor(private readonly gamificationService: GamificationService) {}

  @OnEvent('habit.completed')
  async handleHabitCompletedEvent(payload: HabitCompletedEvent) {
    try {
      const { userId, habitId, difficulty = 'medium', habitName = 'Hábito' } = payload;
      
      // Calcular pontos baseado na dificuldade
      const points = this.calculatePoints('HABIT_COMPLETION', difficulty);
      
      // Adicionar pontos
      const result = await this.gamificationService.addPoints(
        userId,
        points,
        'HABIT_COMPLETION',
        habitId,
        `Completou o hábito: ${habitName}`,
      );

      if (result.success) {
        console.log(`Pontos adicionados para usuário ${userId}: +${points} pontos`);
        
        // Log de conquistas desbloqueadas
        if (result.data.newAchievements && result.data.newAchievements.length > 0) {
          console.log(`Novas conquistas desbloqueadas para usuário ${userId}:`, 
            result.data.newAchievements.map(a => a.name));
        }
      } else {
        console.error(`Erro ao adicionar pontos para usuário ${userId}:`, result.error);
      }
    } catch (error) {
      console.error('Erro no HabitListener:', error);
    }
  }

  private calculatePoints(
    actionType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION',
    difficulty: 'easy' | 'medium' | 'hard',
  ): number {
    const basePoints = {
      HABIT_COMPLETION: 10,
      ROUTINE_COMPLETION: 25,
    };

    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    };

    const base = basePoints[actionType];
    const multiplier = difficultyMultiplier[difficulty];

    return Math.floor(base * multiplier);
  }
}
