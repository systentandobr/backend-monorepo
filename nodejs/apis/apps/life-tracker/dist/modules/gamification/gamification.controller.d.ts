import { GamificationService } from './gamification.service';
import { ApiResponse } from '../../types';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getProfile(userId: string): Promise<ApiResponse<any>>;
    getAchievements(userId: string): Promise<ApiResponse<any>>;
    getLeaderboard(period?: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<ApiResponse<any>>;
    addPoints(transactionData: {
        userId: string;
        points: number;
        sourceType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION' | 'ACHIEVEMENT' | 'BONUS';
        sourceId: string;
        description: string;
    }): Promise<ApiResponse<any>>;
    initializeDefaultAchievements(): Promise<ApiResponse<any>>;
}
