import { Schema, Document } from 'mongoose';

export interface Catalog extends Document {
  unitId: string; // Multi-tenancy: ID da unidade/franquia
  name: string;
  ownerId: string; // ID do usuário proprietário do catálogo
  productIds: string[]; // Array de IDs de produtos no catálogo
  description?: string; // Descrição do catálogo
  isPublic?: boolean; // Se o catálogo é público ou privado
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean; // Soft delete
}

export const CatalogSchema = new Schema<Catalog>(
  {
    unitId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    ownerId: { type: String, required: true, index: true },
    productIds: { type: [String], default: [], index: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

// Virtual para retornar _id como id (compatibilidade com frontend)
CatalogSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Garantir que o virtual seja incluído no JSON
CatalogSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    return ret;
  },
});

// Índices compostos
CatalogSchema.index({ unitId: 1, isDeleted: 1 });
CatalogSchema.index({ ownerId: 1, isDeleted: 1 });
CatalogSchema.index({ unitId: 1, ownerId: 1 });

export const CATALOG_COLLECTION = 'Catalog';


