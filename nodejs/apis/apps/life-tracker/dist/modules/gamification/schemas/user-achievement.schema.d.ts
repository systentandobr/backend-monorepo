import { Document } from 'mongoose';
export type UserAchievementDocument = UserAchievement & Document;
export declare class UserAchievement {
    userId: string;
    achievementId: string;
    unlockedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserAchievementSchema: import("mongoose").Schema<UserAchievement, import("mongoose").Model<UserAchievement, any, any, any, Document<unknown, any, UserAchievement, any, {}> & UserAchievement & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserAchievement, Document<unknown, {}, import("mongoose").FlatRecord<UserAchievement>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserAchievement> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
