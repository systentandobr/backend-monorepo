import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type FranchiseDocument = Franchise &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

// Sub-schema para location
const LocationSchema = new MongooseSchema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    type: { type: String, enum: ['physical', 'digital'], required: true },
  },
  { _id: false },
);

// Sub-schema para territory
const TerritorySchema = new MongooseSchema(
  {
    city: { type: String, required: true },
    state: { type: String, required: true },
    exclusive: { type: Boolean, default: true },
    radius: { type: Number },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'franchises',
})
export class Franchise {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, unique: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true })
  ownerEmail: string;

  @Prop()
  ownerPhone?: string;

  @Prop({ type: LocationSchema, required: true })
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    type: 'physical' | 'digital';
  };

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending',
  })
  status: 'active' | 'inactive' | 'pending' | 'suspended';

  @Prop({
    type: String,
    enum: ['standard', 'premium', 'express'],
    default: 'standard',
  })
  type: 'standard' | 'premium' | 'express';

  @Prop({ type: TerritorySchema })
  territory?: {
    city: string;
    state: string;
    exclusive: boolean;
    radius?: number;
  };

  @Prop({
    type: [String],
    enum: ['restaurant', 'delivery', 'retail', 'ecommerce', 'hybrid', 'gym', 'solar_plant'],
    default: [],
  })
  marketSegments?: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const FranchiseSchema = SchemaFactory.createForClass(Franchise);

// Índices para performance
FranchiseSchema.index({ unitId: 1 }, { unique: true });
FranchiseSchema.index({ status: 1 });
FranchiseSchema.index({ 'location.state': 1 });
FranchiseSchema.index({ 'location.city': 1 });
FranchiseSchema.index({ ownerId: 1 });
FranchiseSchema.index({ marketSegments: 1 });
