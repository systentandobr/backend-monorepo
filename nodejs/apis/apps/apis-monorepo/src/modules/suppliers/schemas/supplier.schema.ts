import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupplierDocument = Supplier &
  Document & {
    createdAt?: Date;
    updatedAt?: Date;
  };

@Schema({
  timestamps: true,
  collection: 'suppliers',
})
export class Supplier {
  _id?: Types.ObjectId;
  id?: string;

  @Prop({ required: true, index: true })
  unitId: string;

  @Prop({ required: true })
  estado: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  website?: string;

  @Prop()
  instagram?: string;

  @Prop()
  createdAt?: string;

  @Prop()
  listingDescription?: string;

  @Prop()
  localizacao?: string;

  @Prop()
  cnpj?: string;

  @Prop()
  genero?: string;

  @Prop()
  tamanho?: string;

  @Prop()
  estilo?: string;

  @Prop()
  pageNum?: number;

  @Prop()
  subpage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.index({ unitId: 1 });
SupplierSchema.index({ estado: 1 });
SupplierSchema.index({ description: 'text' });
