import { Schema, SchemaTypes, Document } from 'mongoose';

export type ProcessingStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'retrying';

export type AffiliatePlatform = 
  | 'shopee' 
  | 'amazon' 
  | 'magalu' 
  | 'mercadolivre' 
  | 'americanas' 
  | 'casasbahia' 
  | 'other';

export interface AffiliateProduct extends Document {
  categoryId: string;
  categoryName: string;
  affiliateUrl: string;
  platform: AffiliatePlatform;
  userId: string;
  unitId: string;
  processingStatus: ProcessingStatus;
  productId?: string; // ID do produto criado após processamento
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  scrapedData?: {
    name?: string;
    price?: number;
    originalPrice?: number;
    images?: string[];
    description?: string;
    rating?: number;
    specifications?: Record<string, any>;
    tags?: string[];
    features?: string[];
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const AffiliateProductSchema = new Schema<AffiliateProduct>(
  {
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    affiliateUrl: { type: String, required: true, index: true },
    platform: { 
      type: String, 
      required: true, 
      enum: ['shopee', 'amazon', 'magalu', 'mercadolivre', 'americanas', 'casasbahia', 'other'],
      index: true 
    },
    userId: { type: String, required: true, index: true },
    unitId: { type: String, required: true, index: true },
    processingStatus: { 
      type: String, 
      required: true, 
      enum: ['pending', 'processing', 'completed', 'failed', 'retrying'],
      default: 'pending',
      index: true 
    },
    productId: { type: String, index: true },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0, min: 0 },
    maxRetries: { type: Number, default: 3 },
    scrapedData: { type: SchemaTypes.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Índices compostos
AffiliateProductSchema.index({ userId: 1, processingStatus: 1 });
AffiliateProductSchema.index({ unitId: 1, processingStatus: 1 });
AffiliateProductSchema.index({ createdAt: -1 });

export const AFFILIATE_PRODUCT_COLLECTION = 'AffiliateProduct';

