import { Document } from 'mongoose';
export type PointTransactionDocument = PointTransaction & Document;
export declare class PointTransaction {
    userId: string;
    points: number;
    sourceType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION' | 'ACHIEVEMENT' | 'BONUS';
    sourceId: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const PointTransactionSchema: import("mongoose").Schema<PointTransaction, import("mongoose").Model<PointTransaction, any, any, any, Document<unknown, any, PointTransaction, any, {}> & PointTransaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PointTransaction, Document<unknown, {}, import("mongoose").FlatRecord<PointTransaction>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PointTransaction> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
