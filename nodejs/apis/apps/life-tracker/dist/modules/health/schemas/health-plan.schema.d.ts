import { Document } from 'mongoose';
export type HealthPlanDocument = HealthPlan & Document;
export declare class HealthPlan {
  id: string;
  name: string;
  description?: string;
  meal_plan_week?: {
    days: string[];
    meals: string[];
    plan: {
      [day: string]: {
        [meal: string]: string;
      };
    };
  };
  routines?: Array<{
    time: string;
    activity: string;
    domain?: string;
  }>;
  notes_for_doctor_review?: string[];
  createdAt: string;
  updatedAt: string;
}
export declare const HealthPlanSchema: import('mongoose').Schema<
  HealthPlan,
  import('mongoose').Model<
    HealthPlan,
    any,
    any,
    any,
    Document<unknown, any, HealthPlan, any, {}> &
      HealthPlan & {
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
  HealthPlan,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<HealthPlan>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<HealthPlan> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
