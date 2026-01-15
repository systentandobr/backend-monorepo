import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SolarEquipmentDocument = SolarEquipment & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'solar_equipment',
})
export class SolarEquipment {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ type: Number, default: 0 })
  totalPanels: number;

  @Prop({ type: Number, default: 0 })
  activePanels: number;

  @Prop({
    type: String,
    enum: ['operational', 'maintenance', 'fault'],
    default: 'operational',
  })
  panelsStatus: string;

  @Prop({
    type: String,
    enum: ['operational', 'maintenance', 'fault'],
    default: 'operational',
  })
  invertersStatus: string;

  @Prop({
    type: String,
    enum: ['operational', 'maintenance', 'fault'],
    default: 'operational',
  })
  monitoringStatus: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SolarEquipmentSchema = SchemaFactory.createForClass(SolarEquipment);

// Índices
SolarEquipmentSchema.index({ unitId: 1 }, { unique: true });
