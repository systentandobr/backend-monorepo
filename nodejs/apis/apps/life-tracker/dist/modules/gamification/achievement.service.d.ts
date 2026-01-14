import { Model } from 'mongoose';
import { AchievementDocument } from './schemas/achievement.schema';
import { UserAchievementDocument } from './schemas/user-achievement.schema';
import { GamificationProfileDocument } from './schemas/gamification-profile.schema';
export declare class AchievementService {
  private achievementModel;
  private userAchievementModel;
  private gamificationProfileModel;
  constructor(
    achievementModel: Model<AchievementDocument>,
    userAchievementModel: Model<UserAchievementDocument>,
    gamificationProfileModel: Model<GamificationProfileDocument>,
  );
  getAllAchievements(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }>;
  getUserAchievements(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  checkAndUnlockAchievements(
    userId: string,
    userStats: {
      totalPoints: number;
      streak: number;
      habitsCompleted: number;
      routinesCompleted: number;
    },
  ): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }>;
  private checkAchievementCriteria;
  createDefaultAchievements(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }>;
}
