import { Model } from 'mongoose';
import { GamificationProfileDocument } from './schemas/gamification-profile.schema';
import { PointTransactionDocument } from './schemas/point-transaction.schema';
export declare class PointsService {
    private gamificationProfileModel;
    private pointTransactionModel;
    constructor(gamificationProfileModel: Model<GamificationProfileDocument>, pointTransactionModel: Model<PointTransactionDocument>);
    addPoints(userId: string, points: number, sourceType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION' | 'ACHIEVEMENT' | 'BONUS', sourceId: string, description: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    calculatePoints(actionType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION', difficulty?: 'easy' | 'medium' | 'hard'): number;
    getUserTransactions(userId: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data?: any[];
        error?: string;
    }>;
    getUserPointsStats(userId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
