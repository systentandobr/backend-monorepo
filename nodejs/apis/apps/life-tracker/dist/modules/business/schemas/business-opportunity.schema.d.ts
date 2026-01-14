import { Document } from 'mongoose';
export type BusinessOpportunityDocument = BusinessOpportunity & Document;
export declare class BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  investment: number;
  potential_return: number;
  risk: string;
  timeline: string;
  category?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}
export declare const BusinessOpportunitySchema: import('mongoose').Schema<
  BusinessOpportunity,
  import('mongoose').Model<
    BusinessOpportunity,
    any,
    any,
    any,
    Document<unknown, any, BusinessOpportunity, any, {}> &
      BusinessOpportunity & {
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
  BusinessOpportunity,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<BusinessOpportunity>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<BusinessOpportunity> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
