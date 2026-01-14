import { GamificationService } from '../gamification.service';
export interface HabitCompletedEvent {
  userId: string;
  habitId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  streak?: number;
  habitName?: string;
}
export declare class HabitListener {
  private readonly gamificationService;
  constructor(gamificationService: GamificationService);
  handleHabitCompletedEvent(payload: HabitCompletedEvent): Promise<void>;
  private calculatePoints;
}
