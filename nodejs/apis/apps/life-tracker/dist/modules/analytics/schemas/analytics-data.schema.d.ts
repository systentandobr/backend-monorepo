import { Document } from 'mongoose';
export type AnalyticsDataDocument = AnalyticsData & Document;
export declare class AnalyticsData {
    id: string;
    event_type: string;
    event_data: {
        [key: string]: any;
    };
    timestamp: string;
    user_id?: string;
    session_id?: string;
    domain?: string;
    createdAt: string;
    updatedAt: string;
}
export declare const AnalyticsDataSchema: import("mongoose").Schema<AnalyticsData, import("mongoose").Model<AnalyticsData, any, any, any, Document<unknown, any, AnalyticsData, any, {}> & AnalyticsData & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AnalyticsData, Document<unknown, {}, import("mongoose").FlatRecord<AnalyticsData>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AnalyticsData> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
