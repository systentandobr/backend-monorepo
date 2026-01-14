import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  studentId: string;

  @IsString()
  subscriptionPlanId: string;

  @IsNumber()
  @Min(0)
  amount: number; // em centavos

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsEnum(['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer'])
  paymentMethod?:
    | 'credit_card'
    | 'debit_card'
    | 'pix'
    | 'cash'
    | 'bank_transfer';

  @IsOptional()
  @IsString()
  transactionId?: string;
}
