import { Document } from 'mongoose';
export type GameDocument = Game & Document;
export declare class Game {
    board: {
        rows: number;
        cols: number;
        milestones: {
            tile: number;
            label: string;
        }[];
    };
    scoring_rules: {
        action: string;
        points: number;
        desc: string;
    }[];
    weekly_goal_points: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const GameSchema: import("mongoose").Schema<Game, import("mongoose").Model<Game, any, any, any, Document<unknown, any, Game, any, {}> & Game & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Game, Document<unknown, {}, import("mongoose").FlatRecord<Game>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Game> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
