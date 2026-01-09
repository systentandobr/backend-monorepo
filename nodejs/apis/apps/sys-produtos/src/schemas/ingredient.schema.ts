import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type IngredientDocument = Ingredient & Document;

export enum IngredientUnit {
  KG = 'KG',
  G = 'G',
  L = 'L',
  ML = 'ML',
  UN = 'UN',
  CX = 'CX', // Caixa
  PC = 'PC', // Pacote
}

export interface PurchaseHistoryItem {
  purchaseDate: Date;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: Date;
  batchNumber?: string;
  notes?: string;
}

export interface LossRecord {
  date: Date;
  quantity: number;
  reason: 'expired' | 'damaged' | 'spoiled' | 'waste' | 'other';
  notes?: string;
  cost: number; // Custo da perda
}

@Schema({ timestamps: true })
export class Ingredient {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, enum: IngredientUnit, default: IngredientUnit.KG })
  unit: IngredientUnit;

  @Prop({ required: true, min: 0 })
  costPrice: number; // Preço de custo por unidade (atual)

  @Prop({ required: true, index: true })
  unitId: string; // ID da unidade/franquia

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  brand?: string;

  @Prop({ required: false })
  supplierId?: string; // ID do fornecedor (opcional)

  @Prop({ required: false, default: true })
  active: boolean;

  @Prop({ required: false, default: 0, min: 0 })
  shelfLifeDays?: number; // Tempo de duração em dias (ex: 7 dias para produtos frescos)

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  purchaseHistory?: PurchaseHistoryItem[]; // Histórico de compras

  @Prop({ type: [SchemaTypes.Mixed], default: [] })
  lossRecords?: LossRecord[]; // Registro de perdas

  @Prop({ required: false, default: 0, min: 0 })
  currentStock?: number; // Estoque atual

  @Prop({ required: false, default: false })
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

// Índices
IngredientSchema.index({ name: 1, unitId: 1 });
IngredientSchema.index({ unitId: 1, active: 1 });
IngredientSchema.index({ isDeleted: 1 });
