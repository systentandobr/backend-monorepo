import { Document } from 'mongoose';
export type PortfolioDocument = Portfolio & Document;
export declare class Portfolio {
    id: string;
    total_value: number;
    total_return: number;
    assets: Array<{
        id: string;
        name: string;
        value: number;
        return: number;
        allocation: number;
    }>;
    createdAt: string;
    updatedAt: string;
}
export declare const PortfolioSchema: import("mongoose").Schema<Portfolio, import("mongoose").Model<Portfolio, any, any, any, Document<unknown, any, Portfolio, any, {}> & Portfolio & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Portfolio, Document<unknown, {}, import("mongoose").FlatRecord<Portfolio>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Portfolio> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
