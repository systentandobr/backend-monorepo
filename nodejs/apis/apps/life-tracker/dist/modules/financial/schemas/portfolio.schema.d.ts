import { Document } from 'mongoose';
export type PortfolioDocument = Portfolio & Document;
export declare class Portfolio {
    userId: string;
    totalValue: number;
    totalInvested: number;
    assets: Array<{
        id: string;
        symbol: string;
        name: string;
        quantity: number;
        averagePrice: number;
        currentPrice: number;
        lastUpdated: Date;
    }>;
    lastUpdated: Date;
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
