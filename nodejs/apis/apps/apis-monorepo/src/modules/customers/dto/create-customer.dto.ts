import { IsString, IsEmail, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['vip', 'ativo', 'novo'])
  status?: 'vip' | 'ativo' | 'novo';

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPurchases?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpent?: number;
}

