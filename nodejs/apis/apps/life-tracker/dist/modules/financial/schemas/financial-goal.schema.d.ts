import { Document } from 'mongoose';
export type FinancialGoalDocument = FinancialGoal & Document;
export declare class FinancialGoal {
  userId: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  priority: string;
  description?: string;
  category?: string;
}
export declare const FinancialGoalSchema: import('mongoose').Schema<
  FinancialGoal,
  import('mongoose').Model<
    FinancialGoal,
    any,
    any,
    any,
    Document<unknown, any, FinancialGoal, any, {}> &
      FinancialGoal & {
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
  FinancialGoal,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<FinancialGoal>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<FinancialGoal> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
