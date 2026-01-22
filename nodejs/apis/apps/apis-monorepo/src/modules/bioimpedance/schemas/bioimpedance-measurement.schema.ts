import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BioimpedanceMeasurementDocument = BioimpedanceMeasurement &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'bioimpedance_measurements',
})
export class BioimpedanceMeasurement {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true, type: Date, index: true })
  date: Date;

  @Prop({ required: true, type: Number, min: 0 })
  weight: number; // kg

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  bodyFat: number; // %

  @Prop({ required: true, type: Number, min: 0 })
  muscle: number; // kg

  @Prop({ type: Boolean, default: false, index: true })
  isBestRecord: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const BioimpedanceMeasurementSchema =
  SchemaFactory.createForClass(BioimpedanceMeasurement);

// Índices para performance
BioimpedanceMeasurementSchema.index({ studentId: 1, date: -1 });
BioimpedanceMeasurementSchema.index({ studentId: 1, isBestRecord: 1 });
BioimpedanceMeasurementSchema.index({ unitId: 1, date: -1 });
