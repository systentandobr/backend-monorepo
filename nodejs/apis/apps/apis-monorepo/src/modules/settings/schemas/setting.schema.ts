import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SettingDocument = Setting &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

// Sub-schemas para location e territory podem ser definidos aqui se necessário no futuro
// Por enquanto, são definidos inline no schema principal

@Schema({
  timestamps: true,
  collection: 'settings',
})
export class Setting {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true, unique: true })
  unitId: string;

  // Referência ao franchise usando ObjectId
  @Prop({ type: Types.ObjectId, ref: 'Franchise', index: true })
  franchiseId?: Types.ObjectId;

  // Configurações de notificações
  @Prop({ type: Object })
  notifications?: {
    telegram?: {
      botToken?: string;
      chatId?: string;
      enabled?: boolean;
    };
    discord?: {
      webhookUrl?: string;
      enabled?: boolean;
    };
    email?: {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      from?: string;
      enabled?: boolean;
    };
  };

  // Informações do franchise editáveis
  @Prop({ type: Object })
  franchise?: {
    name?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      type: 'physical' | 'digital';
    };
    status?: 'active' | 'inactive' | 'pending' | 'suspended';
    type?: 'standard' | 'premium' | 'express';
    territory?: {
      city: string;
      state: string;
      exclusive: boolean;
      radius?: number;
    };
  };

  // Outras configurações podem ser adicionadas aqui
  @Prop({ type: Object })
  general?: Record<string, any>;

  // Configurações específicas por segmento de mercado
  @Prop({
    type: [
      {
        segment: { type: String, required: true },
        notificationUrl: { type: String },
        phone: { type: String },
        notifications: {
          telegram: {
            botToken: { type: String },
            chatId: { type: String },
            enabled: { type: Boolean },
          },
          discord: {
            webhookUrl: { type: String },
            enabled: { type: Boolean },
          },
          email: {
            host: { type: String },
            port: { type: Number },
            username: { type: String },
            password: { type: String },
            from: { type: String },
            enabled: { type: Boolean },
          },
        },
      },
    ],
  })
  segments?: Array<{
    segment: string;
    notificationUrl?: string;
    phone?: string;
    notifications?: Setting['notifications'];
  }>;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

// Índices para performance
SettingSchema.index({ unitId: 1 }, { unique: true });
SettingSchema.index({ franchiseId: 1 });
