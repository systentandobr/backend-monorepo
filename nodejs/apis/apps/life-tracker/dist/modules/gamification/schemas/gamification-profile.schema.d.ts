import { Document } from 'mongoose';
export type GamificationProfileDocument = GamificationProfile & Document;
export declare class GamificationProfile {
    userId: string;
    totalPoints: number;
    level: number;
    pointsToNextLevel: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const GamificationProfileSchema: import("mongoose").Schema<GamificationProfile, import("mongoose").Model<GamificationProfile, any, any, any, Document<unknown, any, GamificationProfile, any, {}> & GamificationProfile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GamificationProfile, Document<unknown, {}, import("mongoose").FlatRecord<GamificationProfile>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GamificationProfile> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
