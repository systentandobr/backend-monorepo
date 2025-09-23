import { Document } from 'mongoose';
export type LatestLabsDocument = LatestLabs & Document;
export declare class LatestLabs {
    id: string;
    creatinina_mg_dl: number;
    ureia_mg_dl: number;
    egfr_ml_min_1_73: number;
    fosforo_mg_dl: number;
    calcio_total_mg_dl: number;
    calcio_ionico_mmol_l: number;
    sodio_mmol_l: number;
    potassio_mmol_l: number;
    hba1c_percent: number;
    glicose_mg_dl: number;
    hb_g_dl: number;
    ferritina_ng_ml: number;
    vitamina_d_25oh_ng_ml: number;
    pth_pg_ml: number;
    sangue_oculto_fezes: string;
    exam_date: string;
    createdAt: string;
    updatedAt: string;
}
export declare const LatestLabsSchema: import("mongoose").Schema<LatestLabs, import("mongoose").Model<LatestLabs, any, any, any, Document<unknown, any, LatestLabs, any, {}> & LatestLabs & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LatestLabs, Document<unknown, {}, import("mongoose").FlatRecord<LatestLabs>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<LatestLabs> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
