import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type RewardDocument = Reward &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

// Sub-schema para RewardDetails
const RewardDetailsSchema = new MongooseSchema(
  {
    walletId: { type: Types.ObjectId, ref: 'Wallet', required: false },
    transactionId: { type: String, required: false },
    couponCode: { type: String, required: false },
    couponExpiresAt: { type: Date, required: false },
    pointsAccountId: {
      type: Types.ObjectId,
      ref: 'PointsAccount',
      required: false,
    },
    productId: { type: Types.ObjectId, ref: 'Product', required: false },
    shippingAddress: { type: Object, required: false },
    trackingCode: { type: String, required: false },
  },
  { _id: false },
);

// Sub-schema para RewardProcessing
const RewardProcessingSchema = new MongooseSchema(
  {
    scheduledAt: { type: Date, required: false },
    processedAt: { type: Date, required: false },
    approvedBy: { type: Types.ObjectId, ref: 'User', required: false },
    approvedAt: { type: Date, required: false },
    paidAt: { type: Date, required: false },
    cancelledAt: { type: Date, required: false },
    cancelledBy: { type: Types.ObjectId, ref: 'User', required: false },
    cancelReason: { type: String, required: false },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'rewards',
})
export class Reward {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ type: Types.ObjectId, ref: 'Referral', required: true, index: true })
  referralId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ReferralCampaign',
    required: true,
    index: true,
  })
  campaignId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['cashback', 'discount', 'points', 'physical'],
    required: true,
  })
  type: 'cashback' | 'discount' | 'points' | 'physical';

  @Prop({ required: true, type: Number })
  value: number;

  @Prop({ required: false })
  currency?: string;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'approved', 'paid', 'cancelled', 'expired'],
    default: 'pending',
    index: true,
  })
  status:
    | 'pending'
    | 'processing'
    | 'approved'
    | 'paid'
    | 'cancelled'
    | 'expired';

  @Prop({
    type: RewardDetailsSchema,
    required: false,
  })
  details?: {
    walletId?: Types.ObjectId;
    transactionId?: string;
    couponCode?: string;
    couponExpiresAt?: Date;
    pointsAccountId?: Types.ObjectId;
    productId?: Types.ObjectId;
    shippingAddress?: object;
    trackingCode?: string;
  };

  @Prop({
    type: RewardProcessingSchema,
    required: false,
  })
  processing?: {
    scheduledAt?: Date;
    processedAt?: Date;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    paidAt?: Date;
    cancelledAt?: Date;
    cancelledBy?: Types.ObjectId;
    cancelReason?: string;
  };

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

// Índices para performance
RewardSchema.index({ userId: 1, status: 1 });
RewardSchema.index({ referralId: 1 });
RewardSchema.index({ campaignId: 1 });
RewardSchema.index({ status: 1, 'processing.scheduledAt': 1 });
RewardSchema.index({ createdAt: -1 });
