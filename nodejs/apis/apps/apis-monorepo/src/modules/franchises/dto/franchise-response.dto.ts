export class FranchiseLocationDto {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'physical' | 'digital';
}

export class FranchiseTerritoryDto {
  city: string;
  state: string;
  exclusive: boolean;
  radius?: number;
}

export class FranchiseMetricsDto {
  totalOrders: number;
  totalSales: number;
  totalLeads: number;
  conversionRate: number;
  averageTicket: number;
  customerCount: number;
  growthRate: number;
  lastMonthSales: number;
  lastMonthOrders: number;
  lastMonthLeads: number;
}

export class FranchiseResponseDto {
  id: string;
  unitId: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  location: FranchiseLocationDto;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  type: 'standard' | 'premium' | 'express';
  territory?: FranchiseTerritoryDto;
  marketSegments: (
    | 'restaurant'
    | 'delivery'
    | 'retail'
    | 'ecommerce'
    | 'hybrid'
  )[];
  metrics?: FranchiseMetricsDto;
  createdAt: Date;
  updatedAt: Date;
}

export class RegionalTrendDto {
  region: string;
  state: string;
  franchisesCount: number;
  totalSales: number;
  growthRate: number;
  averageTicket: number;
  leadsCount: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
}

export class FranchiseFiltersDto {
  search?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  type?: 'standard' | 'premium' | 'express';
  state?: string[];
  city?: string[];
  page?: number = 1;
  limit?: number = 50;
}
