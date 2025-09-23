import { Document } from 'mongoose';
export type AssetDocument = Asset & Document;
export declare class Asset {
    id: string;
    name: string;
    value: number;
    return: number;
    allocation: number;
    type?: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
}
export declare const AssetSchema: import("mongoose").Schema<Asset, import("mongoose").Model<Asset, any, any, any, Document<unknown, any, Asset, any, {}> & Asset & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Asset, Document<unknown, {}, import("mongoose").FlatRecord<Asset>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Asset> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
