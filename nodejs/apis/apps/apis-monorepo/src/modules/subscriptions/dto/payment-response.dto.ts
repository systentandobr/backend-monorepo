export class PaymentResponseDto {
  id: string;
  unitId: string;
  studentId: string;
  subscriptionPlanId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer';
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
