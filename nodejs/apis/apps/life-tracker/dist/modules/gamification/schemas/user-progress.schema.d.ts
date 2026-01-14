import { Document } from 'mongoose';
export type UserProgressDocument = UserProgress & Document;
export declare class UserProgress {
  userId: string;
  total_points: number;
  weekly_points: number;
  current_position: number;
  level: number;
  experience: number;
  achievements: string[];
  completed_milestones: string[];
  last_activity: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export declare const UserProgressSchema: import('mongoose').Schema<
  UserProgress,
  import('mongoose').Model<
    UserProgress,
    any,
    any,
    any,
    Document<unknown, any, UserProgress, any, {}> &
      UserProgress & {
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
  UserProgress,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<UserProgress>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<UserProgress> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
