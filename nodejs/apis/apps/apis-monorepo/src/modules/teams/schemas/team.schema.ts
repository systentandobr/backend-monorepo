import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'teams',
})
export class Team {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  studentIds: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// Índices para performance
TeamSchema.index({ unitId: 1, name: 1 }, { unique: true });
TeamSchema.index({ unitId: 1, createdAt: -1 });
TeamSchema.index({ unitId: 1, 'studentIds': 1 });
