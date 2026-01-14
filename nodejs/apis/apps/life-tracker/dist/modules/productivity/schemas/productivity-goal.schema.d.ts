import { Document } from 'mongoose';
export type ProductivityGoalDocument = ProductivityGoal & Document;
export declare class ProductivityGoal {
  id: string;
  name: string;
  description?: string;
  target: string;
  progress: number;
  deadline: string;
  category?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
}
export declare const ProductivityGoalSchema: import('mongoose').Schema<
  ProductivityGoal,
  import('mongoose').Model<
    ProductivityGoal,
    any,
    any,
    any,
    Document<unknown, any, ProductivityGoal, any, {}> &
      ProductivityGoal & {
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
  ProductivityGoal,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<ProductivityGoal>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<ProductivityGoal> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
