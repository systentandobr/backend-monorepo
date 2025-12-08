import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ReferralCampaignDocument = ReferralCampaign & Document & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Sub-schema para Reward
const RewardSchema = new MongooseSchema({
  type: { type: String, enum: ['cashback', 'discount', 'points', 'physical'], required: true },
  value: { type: Number, required: true },
  currency: { type: String, required: false },
  productId: { type: Types.ObjectId, ref: 'Product', required: false },
}, { _id: false });

// Sub-schema para CampaignRules
const CampaignRulesSchema = new MongooseSchema({
  minPurchaseValue: { type: Number, required: false },
  maxReferralsPerUser: { type: Number, required: false },
  maxReferralsTotal: { type: Number, required: false },
  expirationDays: { type: Number, default: 30 },
  requireEmailVerification: { type: Boolean, default: true },
  allowedProducts: { type: [Types.ObjectId], required: false },
  excludedProducts: { type: [Types.ObjectId], required: false },
}, { _id: false });

// Sub-schema para CampaignMetrics
const CampaignMetricsSchema = new MongooseSchema({
  totalReferrals: { type: Number, default: 0 },
  completedReferrals: { type: Number, default: 0 },
  totalRewardsValue: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
}, { _id: false });

@Schema({
  timestamps: true,
  collection: 'referral_campaigns',
})
export class ReferralCampaign {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ type: Types.ObjectId, ref: 'Franchise', index: true })
  franchiseId?: Types.ObjectId; // null = campanha global

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  slug: string; // URL-friendly

  @Prop({
    type: String,
    enum: ['single-tier', 'multi-tier', 'hybrid'],
    required: true,
  })
  type: 'single-tier' | 'multi-tier' | 'hybrid';

  @Prop({
    type: [String],
    enum: ['cashback', 'discount', 'points', 'physical'],
    required: true,
  })
  rewardTypes: ('cashback' | 'discount' | 'points' | 'physical')[];

  @Prop({
    type: RewardSchema,
    required: true,
  })
  referrerReward: {
    type: 'cashback' | 'discount' | 'points' | 'physical';
    value: number;
    currency?: string;
    productId?: Types.ObjectId;
  };

  @Prop({
    type: RewardSchema,
    required: false,
  })
  refereeReward?: {
    type: 'cashback' | 'discount' | 'points' | 'physical';
    value: number;
    currency?: string;
    productId?: Types.ObjectId;
  };

  @Prop({
    type: CampaignRulesSchema,
    required: false,
  })
  rules?: {
    minPurchaseValue?: number;
    maxReferralsPerUser?: number;
    maxReferralsTotal?: number;
    expirationDays?: number;
    requireEmailVerification?: boolean;
    allowedProducts?: Types.ObjectId[];
    excludedProducts?: Types.ObjectId[];
  };

  @Prop({
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'completed'],
    default: 'draft',
    index: true,
  })
  status: 'draft' | 'active' | 'paused' | 'expired' | 'completed';

  @Prop({ required: true, type: Date, index: true })
  startDate: Date;

  @Prop({ required: true, type: Date, index: true })
  endDate: Date;

  @Prop({
    type: CampaignMetricsSchema,
    required: false,
  })
  metrics?: {
    totalReferrals: number;
    completedReferrals: number;
    totalRewardsValue: number;
    conversionRate: number;
  };

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ReferralCampaignSchema = SchemaFactory.createForClass(ReferralCampaign);

// Índices para performance
ReferralCampaignSchema.index({ franchiseId: 1, status: 1 });
ReferralCampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
ReferralCampaignSchema.index({ slug: 1 }, { unique: true });
ReferralCampaignSchema.index({ createdAt: -1 });
