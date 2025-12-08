export class ReferralRewardResponseDto {
  type: string;
  value: number;
  currency?: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  paidAt?: Date;
  rewardId?: string;
}

export class ReferralTrackingResponseDto {
  sharedAt?: Date;
  sharedVia?: 'whatsapp' | 'email' | 'link' | 'social';
  registeredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  expiredAt?: Date;
}

export class ReferralFraudResponseDto {
  score: number;
  flags: string[];
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export class ReferralResponseDto {
  id: string;
  campaignId: string;
  franchiseId: string;
  referrerId: string;
  refereeId?: string;
  orderId?: string;
  referralCode: string;
  shortLink?: string;
  status: 'pending' | 'registered' | 'completed' | 'cancelled' | 'expired';
  referrerReward: ReferralRewardResponseDto;
  refereeReward?: ReferralRewardResponseDto;
  tracking?: ReferralTrackingResponseDto;
  fraud?: ReferralFraudResponseDto;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class ReferralStatsResponseDto {
  campaignId: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  cancelledReferrals: number;
  expiredReferrals: number;
  totalRewardsValue: number;
  conversionRate: number;
}
