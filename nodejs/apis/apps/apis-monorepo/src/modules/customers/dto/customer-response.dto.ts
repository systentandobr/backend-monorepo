export class CustomerResponseDto {
  id: string;
  unitId: string;
  name: string;
  email: string;
  phone?: string;
  totalPurchases: number;
  totalSpent: number;
  status: 'vip' | 'ativo' | 'novo';
  firstPurchaseAt?: Date;
  lastPurchaseAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerStatsDto {
  total: number;
  active: number;
  vip: number;
  new: number;
  averageTicket: number;
}

