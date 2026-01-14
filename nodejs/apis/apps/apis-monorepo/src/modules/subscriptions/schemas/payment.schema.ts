import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'payments',
})
export class Payment {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'Student' })
  studentId: string;

  @Prop({
    required: true,
    index: true,
    type: Types.ObjectId,
    ref: 'SubscriptionPlan',
  })
  subscriptionPlanId: string;

  @Prop({ type: Number, required: true })
  amount: number; // em centavos

  @Prop({ type: Date, required: true, index: true })
  dueDate: Date;

  @Prop({ type: Date })
  paidDate?: Date;

  @Prop({
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';

  @Prop({
    type: String,
    enum: ['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer'],
  })
  paymentMethod?:
    | 'credit_card'
    | 'debit_card'
    | 'pix'
    | 'cash'
    | 'bank_transfer';

  @Prop()
  transactionId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Índices para performance
PaymentSchema.index({ unitId: 1, studentId: 1 });
PaymentSchema.index({ unitId: 1, status: 1 });
PaymentSchema.index({ unitId: 1, dueDate: 1 });
PaymentSchema.index({ studentId: 1, status: 1 });
PaymentSchema.index({ unitId: 1, createdAt: -1 });
