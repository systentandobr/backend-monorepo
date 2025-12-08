export class RewardResponseDto {
  type: 'cashback' | 'discount' | 'points' | 'physical';
  value: number;
  currency?: string;
  productId?: string;
}

export class CampaignRulesResponseDto {
  minPurchaseValue?: number;
  maxReferralsPerUser?: number;
  maxReferralsTotal?: number;
  expirationDays?: number;
  requireEmailVerification?: boolean;
  allowedProducts?: string[];
  excludedProducts?: string[];
}

export class CampaignMetricsResponseDto {
  totalReferrals: number;
  completedReferrals: number;
  totalRewardsValue: number;
  conversionRate: number;
}

export class ReferralCampaignResponseDto {
  id: string;
  franchiseId?: string;
  name: string;
  description: string;
  slug: string;
  type: 'single-tier' | 'multi-tier' | 'hybrid';
  rewardTypes: ('cashback' | 'discount' | 'points' | 'physical')[];
  referrerReward: RewardResponseDto;
  refereeReward?: RewardResponseDto;
  rules?: CampaignRulesResponseDto;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'completed';
  startDate: Date;
  endDate: Date;
  metrics?: CampaignMetricsResponseDto;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CampaignStatsResponseDto {
  campaignId: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  cancelledReferrals: number;
  expiredReferrals: number;
  totalRewardsValue: number;
  conversionRate: number;
  averageOrderValue: number;
  totalRevenueGenerated: number;
}
