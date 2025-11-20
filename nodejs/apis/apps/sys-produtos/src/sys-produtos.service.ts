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
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
        { tags: query.search },
      ];
    }
    if (query.category) filter.categories = query.category;
    if (query.tag) filter.tags = query.tag;
    if (query.featured === 'true') filter.featured = true;
    if (query.featured === 'false') filter.featured = false;

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
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
      categories: [],
      tags: dto.tags ?? [],
      attributesTemplate: undefined,
      variants: [
        {
          sku: `SKU-${Date.now()}`,
          price: dto.price,
          promotionalPrice: undefined,
          attributes: {},
          active: dto.active ?? true,
          stockByUnit: unitId ? { [unitId]: { quantity: 0, reserved: 0 } } : {},
        },
      ],
      featured: false,
      active: dto.active ?? true,
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
    const update = await this.productModel.findByIdAndUpdate(
      productId,
      { $push: { variants: { ...dto, stockByUnit: {} } } },
      { new: true },
    ).lean();
    if (!update) throw new NotFoundException('Produto não encontrado');
    return update;
  }

  async updateVariant(productId: string, sku: string, dto: UpdateVariantDto) {
    const doc = await this.productModel.findOneAndUpdate(
      { _id: productId, 'variants.sku': sku },
      {
        $set: {
          'variants.$.price': dto.price,
          'variants.$.promotionalPrice': dto.promotionalPrice,
          'variants.$.attributes': dto.attributes,
          'variants.$.active': dto.active,
        },
      },
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

  private slugify(s: string) {
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
