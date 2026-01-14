import { Schema, Document } from 'mongoose';

export interface ProductImage extends Document {
  hashId: string; // Hash único gerado para a imagem (obrigatório, indexado)
  originalName: string; // Nome original do arquivo
  mimeType: string; // Tipo MIME (image/jpeg, image/png, etc.)
  size: number; // Tamanho em bytes
  width: number; // Largura em pixels
  height: number; // Altura em pixels
  path: string; // Caminho relativo no servidor (data-hora-minuto/hash-url-image)
  url: string; // URL pública gerada dinamicamente (/api/products/images/{hashId})
  thumbnailPath?: string; // Caminho da thumbnail (se gerada)
  thumbnailUrl?: string; // URL da thumbnail
  isThumbnail: boolean; // Se é a imagem principal/thumbnail do produto
  productId: string; // Referência ao produto (obrigatório, indexado)
  unitId: string; // Referência à unidade (obrigatório, indexado)
  order: number; // Ordem de exibição
  createdAt: Date;
  updatedAt: Date;
}

export const ProductImageSchema = new Schema<ProductImage>(
  {
    hashId: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
    path: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailPath: { type: String },
    thumbnailUrl: { type: String },
    isThumbnail: { type: Boolean, default: false, index: true },
    productId: { type: String, required: true, index: true },
    unitId: { type: String, required: true, index: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

// Índices compostos para melhorar performance
ProductImageSchema.index({ productId: 1, order: 1 });
ProductImageSchema.index({ unitId: 1, hashId: 1 });
ProductImageSchema.index({ productId: 1, isThumbnail: 1 });

export const PRODUCT_IMAGE_COLLECTION = 'ProductImage';
