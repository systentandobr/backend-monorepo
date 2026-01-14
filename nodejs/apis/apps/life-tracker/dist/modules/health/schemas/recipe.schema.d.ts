import { Document } from 'mongoose';
export type RecipeDocument = Recipe & Document;
export declare class Recipe {
  id: string;
  title: string;
  servings: number;
  ingredients: Array<{
    item: string;
    qty: string;
  }>;
  steps: string[];
  renal_tip: string;
  category?: string;
  prep_time?: string;
  cook_time?: string;
  createdAt: string;
  updatedAt: string;
}
export declare const RecipeSchema: import('mongoose').Schema<
  Recipe,
  import('mongoose').Model<
    Recipe,
    any,
    any,
    any,
    Document<unknown, any, Recipe, any, {}> &
      Recipe & {
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
  Recipe,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<Recipe>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<Recipe> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
