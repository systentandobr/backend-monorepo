import { Schema, SchemaTypes, Document } from 'mongoose';

export interface StockByUnit {
  quantity: number;
  reserved: number;
}

export enum DiscountEvent {
  OFFERS = 'OFFERS',
  PROMOTION = 'PROMOTION',
  MARKDOWN = 'MARKDOWN',
}

export enum DiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export interface ProductVariant {
  sku: string;
  price: number; // Preço original/preço de venda
  originalPrice?: number; // Preço original antes de qualquer desconto
  promotionalPrice?: number; // Preço promocional (já com desconto aplicado)
  costPrice?: number; // Preço de custo
  discount?: number; // Valor do desconto (percentual ou fixo)
  discountEvent?: DiscountEvent; // Tipo de evento de desconto
  discountType?: DiscountType; // Tipo de desconto (percentual ou fixo)
  currency?: 'BRL'; // Moeda (padrão BRL)
  comissionPerTransaction?: number; // Comissão por transação (percentual)
  taxes?: number; // Impostos (percentual) - pode ser calculado dinamicamente usando taxInformation
  attributes?: Record<string, any>;
  active: boolean;
  stockByUnit: Record<string, StockByUnit>; // unitId -> estoque
}

export interface ProductDimensions {
  weight: number; // em kg
  height: number; // em cm
  width: number; // em cm
  length: number; // em cm
}

export interface TaxInformation {
  cest?: string; // Código Especificador da Substituição Tributária
  exempt: boolean; // Isento de impostos
  isTaxed: boolean; // Tributado
  fullTaxes: boolean; // Tributado integralmente
  originState?: string; // Estado de origem
  certifications?: string[]; // Certificações (ex: INMETRO, ANVISA)
  icmsByState: {
    [state: string]: {
      origin: 'Internal' | 'External'; // Origem interna ou externa
      taxRate: number; // Alíquota do ICMS (%)
    };
  };
  icmsSt?: {
    // Informações para Substituição Tributária
    baseCalculation: number; // Base de cálculo
    taxRate: number; // Alíquota do ICMS-ST (%)
    mva: number; // Margem de Valor Agregado (%)
  };
}

export interface Product extends Document {
  unitId?: string; // opcional no nível do produto (estoque é por unidade dentro da variante)
  name: string;
  slug: string;
  description?: string;
  images: string[];
  thumbnail?: string; // Imagem principal/miniatura
  categories: string[];
  tags: string[];
  attributesTemplate?: Record<string, any>;
  variants: ProductVariant[];
  featured: boolean;
  active: boolean;
  
  // Campos adicionais migrados do projeto antigo
  brand?: string; // Marca do produto
  productModel?: string; // Modelo do produto (renomeado de 'model' para evitar conflito com Document.model)
  color?: string; // Cor do produto
  dimensions?: ProductDimensions; // Dimensões (peso, altura, largura, comprimento)
  rating?: number; // Avaliação do produto (0-5)
  reviewCount?: number; // Quantidade de avaliações
  materials?: string[]; // Materiais do produto
  careInstructions?: string[]; // Instruções de cuidado
  warranty?: string; // Garantia
  ncm?: string; // NCM (Nomenclatura Comum do Mercosul) - CRÍTICO
  ean13?: string; // Código de barras EAN-13 - CRÍTICO
  unitOfMeasurement?: 'UN' | 'KG' | 'M' | 'L'; // Unidade de medida - CRÍTICO
  supplierID?: string; // ID do fornecedor
  recommendedAge?: string; // Idade recomendada
  specifications?: Record<string, any>; // Especificações do produto
  url?: string; // URL do produto
  affiliateUrl?: string; // URL de afiliado
  taxInformation?: TaxInformation; // Informações fiscais completas - CRÍTICO PARA BRASIL
  
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
    price: { type: Number, required: true, min: 0 }, // Preço original/preço de venda
    originalPrice: { type: Number, min: 0 }, // Preço original antes de qualquer desconto
    promotionalPrice: { type: Number, min: 0 }, // Preço promocional (já com desconto aplicado)
    costPrice: { type: Number, min: 0 }, // Preço de custo
    discount: { type: Number, min: 0 }, // Valor do desconto (percentual ou fixo)
    discountEvent: {
      type: String,
      enum: ['OFFERS', 'PROMOTION', 'MARKDOWN'],
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
    },
    currency: { type: String, enum: ['BRL'], default: 'BRL' },
    comissionPerTransaction: { type: Number, min: 0, max: 100 }, // Comissão por transação (%)
    taxes: { type: Number, min: 0, max: 100 }, // Impostos (%) - pode ser calculado dinamicamente
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

const ProductDimensionsSchema = new Schema<ProductDimensions, Document>(
  {
    weight: { type: Number, min: 0 }, // em kg
    height: { type: Number, min: 0 }, // em cm
    width: { type: Number, min: 0 }, // em cm
    length: { type: Number, min: 0 }, // em cm
  },
  { _id: false },
);

const TaxInformationSchema = new Schema<TaxInformation, Document>(
  {
    cest: { type: String },
    exempt: { type: Boolean, default: false },
    isTaxed: { type: Boolean, default: false },
    fullTaxes: { type: Boolean, default: false },
    originState: { type: String },
    certifications: { type: [String], default: [] },
    icmsByState: {
      type: Map,
      of: new Schema({
        origin: { type: String, enum: ['Internal', 'External'], required: true },
        taxRate: { type: Number, required: true, min: 0, max: 100 },
      }),
      default: {},
    },
    icmsSt: {
      type: new Schema({
        baseCalculation: { type: Number, min: 0 },
        taxRate: { type: Number, min: 0, max: 100 },
        mva: { type: Number, min: 0 }, // Margem de Valor Agregado (%)
      }),
      required: false,
    },
  },
  { _id: false },
);

export const ProductSchema = new Schema<Product>(
  {
    unitId: { type: String, index: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String },
    images: { type: [String], default: [] },
    thumbnail: { type: String },
    categories: { type: [String], index: true, default: [] },
    tags: { type: [String], index: true, default: [] },
    attributesTemplate: { type: SchemaTypes.Mixed },
    variants: { type: [ProductVariantSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    
    // Campos adicionais migrados do projeto antigo
    brand: { type: String, index: true },
    productModel: { type: String },
    color: { type: String },
    dimensions: { type: ProductDimensionsSchema },
    rating: { type: Number, min: 0, max: 5, index: true },
    reviewCount: { type: Number, min: 0, default: 0 },
    materials: { type: [String], default: [] },
    careInstructions: { type: [String], default: [] },
    warranty: { type: String },
    ncm: { type: String, index: true }, // NCM - CRÍTICO
    ean13: { type: String, index: true }, // Código de barras EAN-13 - CRÍTICO
    unitOfMeasurement: { type: String, enum: ['UN', 'KG', 'M', 'L'], index: true },
    supplierID: { type: String, index: true },
    recommendedAge: { type: String },
    specifications: { type: SchemaTypes.Mixed },
    url: { type: String },
    affiliateUrl: { type: String },
    taxInformation: { type: TaxInformationSchema }, // Informações fiscais - CRÍTICO PARA BRASIL
  },
  { timestamps: true, versionKey: false },
);

// Índices compostos para melhorar performance de buscas
ProductSchema.index({ brand: 1, active: 1 });
ProductSchema.index({ categories: 1, active: 1 });
ProductSchema.index({ rating: -1, reviewCount: -1 });
ProductSchema.index({ ncm: 1, active: 1 });
ProductSchema.index({ ean13: 1 });
ProductSchema.index({ unitId: 1, active: 1 });

export const PRODUCT_COLLECTION = 'Product';


