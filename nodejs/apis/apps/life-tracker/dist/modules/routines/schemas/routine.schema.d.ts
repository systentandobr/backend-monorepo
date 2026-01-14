import { Document } from 'mongoose';
export type RoutineDocument = Routine & Document;
export declare class Routine {
  id: string;
  name: string;
  icon: string;
  color?: string;
  categoryId: number;
  description?: string;
  target?: string;
  streak: number;
  completed: boolean;
  timeOfDay?: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}
export declare const RoutineSchema: import('mongoose').Schema<
  Routine,
  import('mongoose').Model<
    Routine,
    any,
    any,
    any,
    Document<unknown, any, Routine, any, {}> &
      Routine & {
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
  Routine,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<Routine>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<Routine> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
