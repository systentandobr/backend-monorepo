import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { PRODUCT_COLLECTION, Product } from './schemas/product.schema';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { QueryProdutoDto } from './dto/query-produto.dto';
import { CreateVariantDto, UpdateVariantDto, AdjustStockDto, AdjustStockDeltaDto } from './dto/variant.dto';
import { UpdateProdutoMetadataDto } from './dto/produto-metadata.dto';

@Injectable()
export class SysProdutosService {
  constructor(
    @InjectModel(PRODUCT_COLLECTION) private readonly productModel: Model<Product>,
  ) {}

  async list(unitId: string | undefined, query: QueryProdutoDto = {}) {
    const filter: FilterQuery<Product> = {};
    
    // Filtro de busca por texto
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
        { tags: query.search },
        { brand: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    
    // Filtros específicos
    if (query.category) filter.categories = query.category;
    if (query.tag) filter.tags = query.tag;
    if (query.brand) filter.brand = query.brand;
    if (query.featured === 'true') filter.featured = true;
    if (query.featured === 'false') filter.featured = false;
    if (query.rating !== undefined) filter.rating = { $gte: query.rating };
    
    // Filtro de preço (busca na primeira variante ativa)
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      filter['variants.price'] = {};
      if (query.priceMin !== undefined) filter['variants.price'].$gte = query.priceMin;
      if (query.priceMax !== undefined) filter['variants.price'].$lte = query.priceMax;
    }
    
    // Filtro de estoque
    if (query.inStock === 'true' && unitId) {
      filter[`variants.stockByUnit.${unitId}.quantity`] = { $gt: 0 };
    }

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const skip = (page - 1) * limit;

    // Ordenação
    const sort: any = {};
    if (query.sortBy) {
      switch (query.sortBy) {
        case 'price_asc':
          sort['variants.price'] = 1;
          break;
        case 'price_desc':
          sort['variants.price'] = -1;
          break;
        case 'rating_desc':
          sort.rating = -1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'popular':
          sort.reviewCount = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    // Nota: estoque por unidade está em variants.stockByUnit[unitId]
    return {
      items,
      page,
      limit,
      total,
    };
  }

  async getById(id: string) {
    const doc = await this.productModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  async create(unitId: string | undefined, dto: CreateProdutoDto) {
    const slug = this.slugify(dto.name);
    const created = await this.productModel.create({
      unitId,
      name: dto.name,
      slug,
      description: dto.description,
      images: [],
      thumbnail: dto.thumbnail,
      categories: [],
      tags: dto.tags ?? [],
      attributesTemplate: undefined,
      variants: [
        {
          sku: `SKU-${Date.now()}`,
          price: dto.price,
          originalPrice: dto.price, // Inicialmente o preço original é o mesmo do preço
          promotionalPrice: undefined,
          costPrice: dto.costPrice,
          currency: 'BRL',
          attributes: {},
          active: dto.active ?? true,
          stockByUnit: unitId ? { [unitId]: { quantity: 0, reserved: 0 } } : {},
        },
      ],
      featured: false,
      active: dto.active ?? true,
      // Campos adicionais migrados
      brand: dto.brand,
      productModel: dto.productModel,
      color: dto.color,
      dimensions: dto.dimensions,
      rating: dto.rating,
      reviewCount: dto.reviewCount ?? 0,
      materials: dto.materials ?? [],
      careInstructions: dto.careInstructions ?? [],
      warranty: dto.warranty,
      ncm: dto.ncm,
      ean13: dto.ean13,
      unitOfMeasurement: dto.unitOfMeasurement,
      supplierID: dto.supplierID,
      recommendedAge: dto.recommendedAge,
      specifications: dto.specifications,
      url: dto.url,
      affiliateUrl: dto.affiliateUrl,
      taxInformation: dto.taxInformation,
    });
    return created.toObject();
  }

  async update(id: string, dto: UpdateProdutoDto) {
    const update: any = { ...dto };
    if (dto.name) update.slug = this.slugify(dto.name);
    const updated = await this.productModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Produto não encontrado');
    return updated;
  }

  async delete(id: string) {
    const res = await this.productModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Produto não encontrado');
    return { success: true };
  }

  // ===== Variantes =====
  async addVariant(productId: string, dto: CreateVariantDto) {
    const variantData: any = {
      ...dto,
      stockByUnit: {},
      currency: dto.currency || 'BRL',
      // Se não especificar originalPrice, usar price como originalPrice
      originalPrice: dto.originalPrice ?? dto.price,
    };
    
    const update = await this.productModel.findByIdAndUpdate(
      productId,
      { $push: { variants: variantData } },
      { new: true },
    ).lean();
    if (!update) throw new NotFoundException('Produto não encontrado');
    return update;
  }

  async updateVariant(productId: string, sku: string, dto: UpdateVariantDto) {
    const setOps: any = {};
    
    if (dto.price !== undefined) setOps['variants.$.price'] = dto.price;
    if (dto.originalPrice !== undefined) setOps['variants.$.originalPrice'] = dto.originalPrice;
    if (dto.promotionalPrice !== undefined) setOps['variants.$.promotionalPrice'] = dto.promotionalPrice;
    if (dto.costPrice !== undefined) setOps['variants.$.costPrice'] = dto.costPrice;
    if (dto.discount !== undefined) setOps['variants.$.discount'] = dto.discount;
    if (dto.discountEvent !== undefined) setOps['variants.$.discountEvent'] = dto.discountEvent;
    if (dto.discountType !== undefined) setOps['variants.$.discountType'] = dto.discountType;
    if (dto.currency !== undefined) setOps['variants.$.currency'] = dto.currency;
    if (dto.comissionPerTransaction !== undefined) setOps['variants.$.comissionPerTransaction'] = dto.comissionPerTransaction;
    if (dto.taxes !== undefined) setOps['variants.$.taxes'] = dto.taxes;
    if (dto.attributes !== undefined) setOps['variants.$.attributes'] = dto.attributes;
    if (dto.active !== undefined) setOps['variants.$.active'] = dto.active;

    const doc = await this.productModel.findOneAndUpdate(
      { _id: productId, 'variants.sku': sku },
      { $set: setOps },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto/variante não encontrado');
    return doc;
  }

  async removeVariant(productId: string, sku: string) {
    const doc = await this.productModel.findByIdAndUpdate(
      productId,
      { $pull: { variants: { sku } } },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  async setVariantStock(productId: string, sku: string, dto: AdjustStockDto) {
    // Define valores absolutos de quantity/reserved para um unitId específico
    const setOps: any = {};
    if (typeof dto.quantity === 'number') {
      const qty = Math.max(0, dto.quantity);
      setOps[`variants.$.stockByUnit.${dto.unitId}.quantity`] = qty;
    }
    if (typeof dto.reserved === 'number') {
      const res = Math.max(0, dto.reserved);
      setOps[`variants.$.stockByUnit.${dto.unitId}.reserved`] = res;
    }

    const doc = await this.productModel.findOneAndUpdate(
      { _id: productId, 'variants.sku': sku },
      { $set: setOps },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto/variante não encontrado');
    return doc;
  }

  async incVariantStock(productId: string, sku: string, dto: AdjustStockDeltaDto) {
    // Buscar valores atuais para calcular novos com piso zero
    const doc = await this.productModel.findOne({ _id: productId }).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    const variant = (doc as any).variants?.find((v: any) => v.sku === sku);
    if (!variant) throw new NotFoundException('Variante não encontrada');

    const current = (variant.stockByUnit && variant.stockByUnit[dto.unitId]) || { quantity: 0, reserved: 0 };
    const nextQuantity = typeof dto.quantityDelta === 'number' ? Math.max(0, (current.quantity || 0) + dto.quantityDelta) : undefined;
    const nextReserved = typeof dto.reservedDelta === 'number' ? Math.max(0, (current.reserved || 0) + dto.reservedDelta) : undefined;

    const setOps: any = {};
    if (typeof nextQuantity === 'number') setOps[`variants.$.stockByUnit.${dto.unitId}.quantity`] = nextQuantity;
    if (typeof nextReserved === 'number') setOps[`variants.$.stockByUnit.${dto.unitId}.reserved`] = nextReserved;

    const updated = await this.productModel.findOneAndUpdate(
      { _id: productId, 'variants.sku': sku },
      { $set: setOps },
      { new: true },
    ).lean();
    if (!updated) throw new NotFoundException('Produto/variante não encontrado');
    return updated;
  }

  // ===== Metadados (categorias/imagens/attributesTemplate) =====
  async updateMetadata(productId: string, dto: UpdateProdutoMetadataDto) {
    const doc = await this.productModel.findByIdAndUpdate(
      productId,
      {
        ...(dto.categories ? { categories: dto.categories } : {}),
        ...(dto.images ? { images: dto.images } : {}),
        ...(dto.attributesTemplate ? { attributesTemplate: dto.attributesTemplate } : {}),
      },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  async addImage(productId: string, url: string) {
    const doc = await this.productModel.findByIdAndUpdate(
      productId,
      { $addToSet: { images: url } },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  async removeImage(productId: string, url: string) {
    const doc = await this.productModel.findByIdAndUpdate(
      productId,
      { $pull: { images: url } },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  async addCategory(productId: string, category: string) {
    const doc = await this.productModel.findByIdAndUpdate(
      productId,
      { $addToSet: { categories: category } },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  async removeCategory(productId: string, category: string) {
    const doc = await this.productModel.findByIdAndUpdate(
      productId,
      { $pull: { categories: category } },
      { new: true },
    ).lean();
    if (!doc) throw new NotFoundException('Produto não encontrado');
    return doc;
  }

  /**
   * Busca produtos relacionados baseado na mesma categoria
   */
  async findRelated(productId: string, limit: number = 10): Promise<Product[]> {
    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      return [];
    }

    // Buscar produtos da mesma categoria, excluindo o produto atual
    const relatedProducts = await this.productModel
      .find({
        _id: { $ne: productId },
        active: true,
        categories: { $in: product.categories },
      })
      .limit(limit)
      .sort({ rating: -1, reviewCount: -1 })
      .lean();

    return relatedProducts as Product[];
  }

  private slugify(s: string) {
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
