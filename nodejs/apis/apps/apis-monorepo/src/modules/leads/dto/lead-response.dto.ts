import { LeadStatus, LeadSource } from '../schemas/lead.schema';

export class LeadResponseDto {
  id: string;
  unitId: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  source: LeadSource;
  status: LeadStatus;
  metadata?: Record<string, any>;
  tags: string[];
  notes: Array<{
    content: string;
    author: string;
    createdAt: Date;
  }>;
  contactedAt?: Date;
  qualifiedAt?: Date;
  convertedAt?: Date;
  customerId?: string;
  score: number;
  pipeline?: {
    stage: string;
    stageHistory: Array<{
      stage: string;
      enteredAt: Date;
      exitedAt?: Date;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class LeadPipelineStatsDto {
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  total: number;
  conversionRate: number;
}

export class LeadFiltersDto {
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  tags?: string[];
  minScore?: number;
  maxScore?: number;
  page?: number = 1;
  limit?: number = 50;
}
