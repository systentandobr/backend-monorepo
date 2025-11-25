import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
  collection: 'customers',
})
export class Customer {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: false }) // Não único globalmente, mas único por unitId
  email: string;

  @Prop()
  phone?: string;

  @Prop({ default: 0 })
  totalPurchases: number;

  @Prop({ default: 0, type: Number })
  totalSpent: number;

  @Prop({
    type: String,
    enum: ['vip', 'ativo', 'novo'],
    default: 'novo',
  })
  status: 'vip' | 'ativo' | 'novo';

  @Prop({ type: Date })
  firstPurchaseAt?: Date;

  @Prop({ type: Date })
  lastPurchaseAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Índices compostos para performance
CustomerSchema.index({ unitId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ unitId: 1, status: 1 });
CustomerSchema.index({ unitId: 1, createdAt: -1 });

