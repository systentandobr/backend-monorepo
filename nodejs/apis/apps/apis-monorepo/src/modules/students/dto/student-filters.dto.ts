import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export class StudentFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['active', 'suspended', 'cancelled', 'expired'])
  subscriptionStatus?: 'active' | 'suspended' | 'cancelled' | 'expired';

  @IsOptional()
  @IsEnum(['paid', 'pending', 'overdue'])
  paymentStatus?: 'paid' | 'pending' | 'overdue';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
