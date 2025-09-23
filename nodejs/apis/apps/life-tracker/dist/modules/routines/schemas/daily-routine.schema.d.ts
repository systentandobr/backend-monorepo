import { Document } from 'mongoose';
export type DailyRoutineDocument = DailyRoutine & Document;
export declare class DailyRoutine {
    time: string;
    activity: string;
    domain?: string;
    completed: boolean;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const DailyRoutineSchema: import("mongoose").Schema<DailyRoutine, import("mongoose").Model<DailyRoutine, any, any, any, Document<unknown, any, DailyRoutine, any, {}> & DailyRoutine & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DailyRoutine, Document<unknown, {}, import("mongoose").FlatRecord<DailyRoutine>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DailyRoutine> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
