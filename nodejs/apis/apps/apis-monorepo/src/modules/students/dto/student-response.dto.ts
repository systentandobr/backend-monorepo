export class StudentResponseDto {
  id: string;
  unitId: string;
  userId?: string; // ID do usuário no sistema de autenticação
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  healthInfo?: {
    medicalConditions?: string[];
    medications?: string[];
    injuries?: string[];
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  subscription?: {
    planId: string;
    status: 'active' | 'suspended' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
