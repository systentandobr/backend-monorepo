import { Document } from 'mongoose';
export type BusinessProjectDocument = BusinessProject & Document;
export declare class BusinessProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  deadline: string;
  description?: string;
  budget?: number;
  team_size?: number;
  createdAt: string;
  updatedAt: string;
}
export declare const BusinessProjectSchema: import('mongoose').Schema<
  BusinessProject,
  import('mongoose').Model<
    BusinessProject,
    any,
    any,
    any,
    Document<unknown, any, BusinessProject, any, {}> &
      BusinessProject & {
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
  BusinessProject,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<BusinessProject>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<BusinessProject> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
