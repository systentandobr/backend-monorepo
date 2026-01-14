import { Schema, SchemaTypes, Document } from 'mongoose';

export interface DeviceInfo {
  userAgent: string;
  ip: string;
  deviceType: string;
}

export type NavigationSessionStatus = 'active' | 'expired' | 'closed';

export interface NavigationSession extends Document {
  unitId?: string; // Multi-tenancy: opcional
  userId: string;
  sessionId: string;
  startedAt: Date;
  lastActivity: Date;
  deviceInfo: DeviceInfo;
  status: NavigationSessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInteractions {
  viewedImages: boolean;
  readDescription: boolean;
  checkedReviews: boolean;
  addedToCart: boolean;
  addedToWishlist: boolean;
}

export interface ProductMetadata {
  referrer: string;
  searchTerm: string;
  category: string;
}

export type VisitSource =
  | 'search'
  | 'category'
  | 'related'
  | 'featured'
  | 'direct';

export interface VisitedProduct extends Document {
  unitId?: string; // Multi-tenancy: opcional
  userId: string;
  productId: string;
  visitedAt: Date;
  duration: number; // em segundos
  source: VisitSource;
  interactions: ProductInteractions;
  metadata: ProductMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availability?: string;
}

export interface SearchResult {
  productId: string;
  position: number;
  clicked: boolean;
}

export interface SearchMetadata {
  searchType: 'text' | 'filter' | 'autocomplete' | 'voice';
  autocomplete: boolean;
}

export interface SearchHistory extends Document {
  unitId?: string; // Multi-tenancy: opcional
  userId: string;
  sessionId: string;
  query: string;
  searchedAt: Date;
  resultsCount: number;
  filters: SearchFilters;
  results: SearchResult[];
  metadata: SearchMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceInfoSchema = new Schema<DeviceInfo>(
  {
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
    deviceType: { type: String, required: true },
  },
  { _id: false },
);

export const NavigationSessionSchema = new Schema<NavigationSession>(
  {
    unitId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    startedAt: { type: Date, required: true },
    lastActivity: { type: Date, required: true },
    deviceInfo: { type: DeviceInfoSchema, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'closed'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

NavigationSessionSchema.index({ userId: 1, status: 1 });
NavigationSessionSchema.index({ unitId: 1, userId: 1 });

const ProductInteractionsSchema = new Schema<ProductInteractions>(
  {
    viewedImages: { type: Boolean, default: false },
    readDescription: { type: Boolean, default: false },
    checkedReviews: { type: Boolean, default: false },
    addedToCart: { type: Boolean, default: false },
    addedToWishlist: { type: Boolean, default: false },
  },
  { _id: false },
);

const ProductMetadataSchema = new Schema<ProductMetadata>(
  {
    referrer: { type: String, default: '' },
    searchTerm: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  { _id: false },
);

export const VisitedProductSchema = new Schema<VisitedProduct>(
  {
    unitId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    visitedAt: { type: Date, required: true, index: true },
    duration: { type: Number, default: 0, min: 0 },
    source: {
      type: String,
      enum: ['search', 'category', 'related', 'featured', 'direct'],
      required: true,
    },
    interactions: { type: ProductInteractionsSchema, required: true },
    metadata: { type: ProductMetadataSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

VisitedProductSchema.index({ userId: 1, visitedAt: -1 });
VisitedProductSchema.index({ productId: 1, visitedAt: -1 });
VisitedProductSchema.index({ unitId: 1, userId: 1 });

const SearchFiltersSchema = new Schema<SearchFilters>(
  {
    category: { type: String },
    brand: { type: String },
    priceMin: { type: Number },
    priceMax: { type: Number },
    rating: { type: Number },
    availability: { type: String },
  },
  { _id: false },
);

const SearchResultSchema = new Schema<SearchResult>(
  {
    productId: { type: String, required: true },
    position: { type: Number, required: true },
    clicked: { type: Boolean, default: false },
  },
  { _id: false },
);

const SearchMetadataSchema = new Schema<SearchMetadata>(
  {
    searchType: {
      type: String,
      enum: ['text', 'filter', 'autocomplete', 'voice'],
      default: 'text',
    },
    autocomplete: { type: Boolean, default: false },
  },
  { _id: false },
);

export const SearchHistorySchema = new Schema<SearchHistory>(
  {
    unitId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    query: { type: String, required: true, index: true },
    searchedAt: { type: Date, required: true, index: true },
    resultsCount: { type: Number, required: true, min: 0 },
    filters: { type: SearchFiltersSchema },
    results: { type: [SearchResultSchema], default: [] },
    metadata: { type: SearchMetadataSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

SearchHistorySchema.index({ userId: 1, searchedAt: -1 });
SearchHistorySchema.index({ query: 1, searchedAt: -1 });
SearchHistorySchema.index({ unitId: 1, userId: 1 });

export const NAVIGATION_SESSION_COLLECTION = 'NavigationSession';
export const VISITED_PRODUCT_COLLECTION = 'VisitedProduct';
export const SEARCH_HISTORY_COLLECTION = 'SearchHistory';
