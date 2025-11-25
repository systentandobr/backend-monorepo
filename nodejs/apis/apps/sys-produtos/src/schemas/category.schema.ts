import { Schema, SchemaTypes, Document } from 'mongoose';

export interface Category extends Document {
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

// Índices
CategorySchema.index({ name: 1, isActive: 1 });
CategorySchema.index({ slug: 1 });

export const CATEGORY_COLLECTION = 'Category';

