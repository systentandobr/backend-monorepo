import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { GamificationProfileDocument } from './schemas/gamification-profile.schema';
import { PointsService } from './points.service';
import { AchievementService } from './achievement.service';
export declare class GamificationService {
    private gamificationProfileModel;
    private pointsService;
    private achievementService;
    constructor(gamificationProfileModel: Model<GamificationProfileDocument>, pointsService: PointsService, achievementService: AchievementService);
    getProfile(userId: string): Promise<ApiResponse<any>>;
    getAchievements(userId: string): Promise<ApiResponse<any>>;
    getLeaderboard(period?: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<ApiResponse<any>>;
    addPoints(userId: string, points: number, sourceType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION' | 'ACHIEVEMENT' | 'BONUS', sourceId: string, description: string): Promise<ApiResponse<any>>;
    initializeDefaultAchievements(): Promise<ApiResponse<any>>;
}
