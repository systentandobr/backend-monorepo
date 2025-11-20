import { Schema, SchemaTypes, Document } from 'mongoose';

export interface StockByUnit {
  quantity: number;
  reserved: number;
}

export interface ProductVariant {
  sku: string;
  price: number;
  promotionalPrice?: number;
  attributes?: Record<string, any>;
  active: boolean;
  stockByUnit: Record<string, StockByUnit>; // unitId -> estoque
}

export interface Product extends Document {
  unitId?: string; // opcional no nível do produto (estoque é por unidade dentro da variante)
  name: string;
  slug: string;
  description?: string;
  images: string[];
  categories: string[];
  tags: string[];
  attributesTemplate?: Record<string, any>;
  variants: ProductVariant[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StockByUnitSchema = new Schema<StockByUnit, Document>(
  {
    quantity: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<ProductVariant, Document>(
  {
    sku: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    promotionalPrice: { type: Number, min: 0 },
    attributes: { type: SchemaTypes.Mixed },
    active: { type: Boolean, required: true, default: true },
    stockByUnit: {
      type: Map,
      of: StockByUnitSchema,
      default: {},
    },
  },
  { _id: false },
);

export const ProductSchema = new Schema<Product>(
  {
    unitId: { type: String },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String },
    images: { type: [String], default: [] },
    categories: { type: [String], index: true, default: [] },
    tags: { type: [String], index: true, default: [] },
    attributesTemplate: { type: SchemaTypes.Mixed },
    variants: { type: [ProductVariantSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const PRODUCT_COLLECTION = 'Product';


