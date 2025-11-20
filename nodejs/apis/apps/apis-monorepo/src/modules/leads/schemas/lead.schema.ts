import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  CUSTOMER = 'customer',
  LOST = 'lost',
}

export enum LeadSource {
  CHATBOT = 'chatbot',
  WEBSITE = 'website',
  WHATSAPP = 'whatsapp',
  FORM = 'form',
  REFERRAL = 'referral',
}

@Schema({
  timestamps: true,
  collection: 'leads',
})
export class Lead {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop({
    type: String,
    enum: Object.values(LeadSource),
    default: LeadSource.CHATBOT,
  })
  source: LeadSource;

  @Prop({
    type: String,
    enum: Object.values(LeadStatus),
    default: LeadStatus.NEW,
    index: true,
  })
  status: LeadStatus;

  @Prop({ type: Object })
  metadata?: {
    franchiseType?: string;
    experience?: string;
    budget?: string;
    timeToStart?: string;
    chatbotSessionId?: string;
    conversationHistory?: any[];
    [key: string]: any;
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [Object], default: [] })
  notes: Array<{
    content: string;
    author: string;
    createdAt: Date;
  }>;

  @Prop({ type: Date })
  contactedAt?: Date;

  @Prop({ type: Date })
  qualifiedAt?: Date;

  @Prop({ type: Date })
  convertedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId?: string;

  @Prop({ type: Number, default: 0 })
  score: number; // Score de qualificação (0-100)

  @Prop({ type: Object })
  pipeline?: {
    stage: string;
    stageHistory: Array<{
      stage: string;
      enteredAt: Date;
      exitedAt?: Date;
    }>;
  };
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Índices para performance
LeadSchema.index({ unitId: 1, status: 1 });
LeadSchema.index({ unitId: 1, createdAt: -1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ score: -1 });

