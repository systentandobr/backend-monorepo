export class RewardDetailsResponseDto {
  walletId?: string;
  transactionId?: string;
  couponCode?: string;
  couponExpiresAt?: Date;
  pointsAccountId?: string;
  productId?: string;
  shippingAddress?: object;
  trackingCode?: string;
}

export class RewardProcessingResponseDto {
  scheduledAt?: Date;
  processedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancelReason?: string;
}

export class RewardResponseDto {
  id: string;
  referralId: string;
  userId: string;
  campaignId: string;
  type: 'cashback' | 'discount' | 'points' | 'physical';
  value: number;
  currency?: string;
  status:
    | 'pending'
    | 'processing'
    | 'approved'
    | 'paid'
    | 'cancelled'
    | 'expired';
  details?: RewardDetailsResponseDto;
  processing?: RewardProcessingResponseDto;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
