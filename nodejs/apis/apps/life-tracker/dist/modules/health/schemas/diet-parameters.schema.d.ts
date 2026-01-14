import { Document } from 'mongoose';
export type DietParametersDocument = DietParameters & Document;
export declare class DietParameters {
  id: string;
  protein_g_per_day_target: {
    min: number;
    max: number;
    note: string;
  };
  sodium_mg_per_day_max: number;
  phosphorus_mg_per_day_target: {
    max: number;
    note: string;
  };
  potassium_strategy: {
    restriction: string;
    techniques: string[];
    avoid_examples: string[];
  };
  fiber_g_per_day_target: number;
  fluid_limit_ml_per_day: number | null;
  fluid_note: string;
  createdAt: string;
  updatedAt: string;
}
export declare const DietParametersSchema: import('mongoose').Schema<
  DietParameters,
  import('mongoose').Model<
    DietParameters,
    any,
    any,
    any,
    Document<unknown, any, DietParameters, any, {}> &
      DietParameters & {
        _id: import('mongoose').Types.ObjectId;
      } & {
        __v: number;
      },
    any
  >,
  {},
  {},
  {},
  {},
  import('mongoose').DefaultSchemaOptions,
  DietParameters,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<DietParameters>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<DietParameters> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
