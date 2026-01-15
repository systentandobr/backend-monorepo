import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateDistributionContractDto {
  @IsString()
  associationName: string;

  @IsOptional()
  @IsString()
  associationId?: string;

  @IsDateString()
  contractStartDate: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @IsNumber()
  @Min(0)
  monthlyKWH: number;

  @IsNumber()
  @Min(0)
  pricePerKWH: number;

  @IsOptional()
  @IsEnum(['active', 'pending', 'expired', 'cancelled'])
  status?: string;
}
