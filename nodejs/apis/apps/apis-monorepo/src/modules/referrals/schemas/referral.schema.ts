import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ReferralDocument = Referral & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Sub-schema para ReferralReward
const ReferralRewardSchema = new MongooseSchema({
  rewardType: { type: String, enum: ['cashback', 'discount', 'points', 'physical'], required: true },
  value: { type: Number, required: true },
  currency: { type: String, required: false },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'cancelled'],
    default: 'pending',
  },
  paidAt: { type: Date, required: false },
  rewardId: { type: Types.ObjectId, ref: 'Reward', required: false },
}, { _id: false });

// Sub-schema para Tracking
const TrackingSchema = new MongooseSchema({
  sharedAt: { type: Date, required: false },
  sharedVia: {
    type: String,
    enum: ['whatsapp', 'email', 'link', 'social'],
    required: false,
  },
  registeredAt: { type: Date, required: false },
  completedAt: { type: Date, required: false },
  cancelledAt: { type: Date, required: false },
  expiredAt: { type: Date, required: false },
}, { _id: false });

// Sub-schema para Fraud
const FraudSchema = new MongooseSchema({
  score: { type: Number, default: 0, min: 0, max: 100 },
  flags: { type: [String], default: [] },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date, required: false },
  verifiedBy: { type: Types.ObjectId, ref: 'User', required: false },
}, { _id: false });

@Schema({
  timestamps: true,
  collection: 'referrals',
})
export class Referral {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ type: Types.ObjectId, ref: 'ReferralCampaign', required: true, index: true })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Franchise', required: true, index: true })
  franchiseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  referrerId: Types.ObjectId; // quem indicou

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  refereeId?: Types.ObjectId; // quem foi indicado (preenchido após cadastro)

  @Prop({ type: Types.ObjectId, ref: 'Order', required: false })
  orderId?: Types.ObjectId; // pedido que completou a indicação

  @Prop({ required: true, unique: true, index: true })
  referralCode: string; // único, formato: XXXX-XXXX-XXXX

  @Prop({ required: false })
  shortLink?: string; // link curto para compartilhamento

  @Prop({
    type: String,
    enum: ['pending', 'registered', 'completed', 'cancelled', 'expired'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'registered' | 'completed' | 'cancelled' | 'expired';

  @Prop({
    type: ReferralRewardSchema,
    required: true,
  })
  referrerReward: {
    rewardType: string;
    value: number;
    currency?: string;
    status: 'pending' | 'processing' | 'paid' | 'cancelled';
    paidAt?: Date;
    rewardId?: Types.ObjectId;
  };

  @Prop({
    type: ReferralRewardSchema,
    required: false,
  })
  refereeReward?: {
    rewardType: string;
    value: number;
    currency?: string;
    status: 'pending' | 'processing' | 'paid' | 'cancelled';
    paidAt?: Date;
    rewardId?: Types.ObjectId;
  };

  @Prop({
    type: TrackingSchema,
    required: false,
  })
  tracking?: {
    sharedAt?: Date;
    sharedVia?: 'whatsapp' | 'email' | 'link' | 'social';
    registeredAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    expiredAt?: Date;
  };

  @Prop({
    type: FraudSchema,
    required: false,
  })
  fraud?: {
    score: number;
    flags: string[];
    verified: boolean;
    verifiedAt?: Date;
    verifiedBy?: Types.ObjectId;
  };

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

// Índices para performance
ReferralSchema.index({ referralCode: 1 }, { unique: true });
ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ campaignId: 1, status: 1 });
ReferralSchema.index({ franchiseId: 1, status: 1 });
ReferralSchema.index({ refereeId: 1 });
ReferralSchema.index({ createdAt: -1 });
ReferralSchema.index({ 'tracking.expiredAt': 1 });
