import { Document } from 'mongoose';
export type HabitDocument = Habit & Document;
export declare class Habit {
    id: string;
    name: string;
    icon: string;
    color?: string;
    categoryId: number;
    description?: string;
    target?: string;
    streak: number;
    completed: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
    createdAt: string;
    updatedAt: string;
    domain?: string;
}
export declare const HabitSchema: import("mongoose").Schema<Habit, import("mongoose").Model<Habit, any, any, any, Document<unknown, any, Habit, any, {}> & Habit & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Habit, Document<unknown, {}, import("mongoose").FlatRecord<Habit>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Habit> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
