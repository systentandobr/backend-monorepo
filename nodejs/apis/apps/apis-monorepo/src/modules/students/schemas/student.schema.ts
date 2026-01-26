import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type StudentDocument = Student &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

// Sub-schema para endereço
const AddressSchema = new MongooseSchema(
  {
    street: { type: String },
    number: { type: String },
    complement: { type: String },
    neighborhood: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
  },
  { _id: false },
);

// Sub-schema para contato de emergência
const EmergencyContactSchema = new MongooseSchema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
  },
  { _id: false },
);

// Sub-schema para informações de saúde
const HealthInfoSchema = new MongooseSchema(
  {
    medicalConditions: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    injuries: { type: [String], default: [] },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  { _id: false },
);

// Sub-schema para assinatura
const SubscriptionSchema = new MongooseSchema(
  {
    planId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
    lastPaymentDate: { type: Date },
    nextPaymentDate: { type: Date },
  },
  { _id: false },
);

@Schema({
  timestamps: true,
  collection: 'students',
})
export class Student {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ index: true, sparse: true })
  userId?: string; // ID do usuário no sistema de autenticação (SYS-SEGURANÇA)

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  cpf?: string;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop({
    type: String,
    enum: ['male', 'female', 'other'],
  })
  gender?: 'male' | 'female' | 'other';

  @Prop({ type: AddressSchema })
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
  };

  @Prop({ type: EmergencyContactSchema })
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @Prop({ type: HealthInfoSchema })
  healthInfo?: {
    medicalConditions?: string[];
    medications?: string[];
    injuries?: string[];
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  };

  @Prop({ type: SubscriptionSchema })
  subscription?: {
    planId: string;
    status: 'active' | 'suspended' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Índices para performance
StudentSchema.index({ unitId: 1, email: 1 }, { unique: true });
StudentSchema.index({ unitId: 1, 'subscription.status': 1 });
StudentSchema.index({ unitId: 1, 'subscription.paymentStatus': 1 });
StudentSchema.index({ unitId: 1, isActive: 1 });
StudentSchema.index({ unitId: 1, createdAt: -1 });
StudentSchema.index({ userId: 1 }, { unique: true, sparse: true }); // Um student por userId