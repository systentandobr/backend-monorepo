import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { CATALOG_COLLECTION, Catalog } from '../schemas/catalog.schema';
import { CreateCatalogDto, UpdateCatalogDto, QueryCatalogDto } from '../dto/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(CATALOG_COLLECTION) private readonly catalogModel: Model<Catalog>,
  ) {}

  async create(unitId: string, ownerId: string, dto: CreateCatalogDto): Promise<Catalog & { id: string; _id?: any }> {
    const catalog = await this.catalogModel.create({
      unitId,
      ownerId,
      name: dto.name,
      description: dto.description,
      productIds: dto.productIds || [],
      isPublic: dto.isPublic ?? false,
    });

    const catalogJson = catalog.toJSON() as Catalog;
    // Garantir que sempre tenha id e _id acessíveis
    return {
      ...catalogJson,
      id: (catalogJson as any).id || catalog._id.toString(),
      _id: catalog._id,
    } as Catalog & { id: string; _id?: any };
  }

  async list(unitId: string, userId: string, query: QueryCatalogDto = {}): Promise<Catalog[]> {
    const filter: FilterQuery<Catalog> = {
      unitId,
      isDeleted: { $ne: true },
    };

    // Filtrar por público ou do próprio usuário
    filter.$or = [
      { isPublic: true },
      { ownerId: userId },
    ];

    if (query.search) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } },
          ],
        },
      ];
    }

    if (query.isPublic !== undefined) {
      filter.isPublic = query.isPublic;
    }

    const catalogs = await this.catalogModel.find(filter).sort({ createdAt: -1 }).lean();
    // Adicionar id virtual aos objetos lean
    return catalogs.map(cat => ({
      ...cat,
      id: cat._id.toString(),
    })) as Catalog[];
  }

  async getById(id: string, unitId: string, userId: string): Promise<Catalog> {
    const catalog = await this.catalogModel
      .findOne({
        _id: id,
        unitId,
        isDeleted: { $ne: true },
      })
      .lean();

    if (!catalog) {
      throw new NotFoundException('Catálogo não encontrado');
    }

    // Verificar se o usuário tem acesso (público ou é o dono)
    if (!catalog.isPublic && catalog.ownerId !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este catálogo');
    }

    return {
      ...catalog,
      id: catalog._id.toString(),
    } as Catalog;
  }

  async update(
    id: string,
    unitId: string,
    userId: string,
    dto: UpdateCatalogDto,
  ): Promise<Catalog> {
    const catalog = await this.catalogModel.findOne({
      _id: id,
      unitId,
      ownerId: userId,
      isDeleted: { $ne: true },
    });

    if (!catalog) {
      throw new NotFoundException('Catálogo não encontrado ou você não tem permissão');
    }

    const updated = await this.catalogModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    return {
      ...updated,
      id: updated?._id?.toString(),
    } as Catalog;
  }

  async delete(id: string, unitId: string, userId: string): Promise<void> {
    const catalog = await this.catalogModel.findOne({
      _id: id,
      unitId,
      ownerId: userId,
      isDeleted: { $ne: true },
    });

    if (!catalog) {
      throw new NotFoundException('Catálogo não encontrado ou você não tem permissão');
    }

    await this.catalogModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  async addProduct(
    catalogId: string,
    productId: string,
    unitId: string,
    userId: string,
  ): Promise<Catalog> {
    const catalog = await this.catalogModel.findOne({
      _id: catalogId,
      unitId,
      ownerId: userId,
      isDeleted: { $ne: true },
    });

    if (!catalog) {
      throw new NotFoundException('Catálogo não encontrado ou você não tem permissão');
    }

    if (!catalog.productIds.includes(productId)) {
      catalog.productIds.push(productId);
      await catalog.save();
    }

    return catalog.toJSON() as Catalog;
  }

  async removeProduct(
    catalogId: string,
    productId: string,
    unitId: string,
    userId: string,
  ): Promise<Catalog> {
    const catalog = await this.catalogModel.findOne({
      _id: catalogId,
      unitId,
      ownerId: userId,
      isDeleted: { $ne: true },
    });

    if (!catalog) {
      throw new NotFoundException('Catálogo não encontrado ou você não tem permissão');
    }

    catalog.productIds = catalog.productIds.filter((id) => id !== productId);
    await catalog.save();

    return catalog.toJSON() as Catalog;
  }

  /**
   * Buscar ou criar catálogo padrão para um unitId
   */
  async findOrCreateDefaultCatalog(unitId: string, userId: string): Promise<Catalog & { id: string; _id?: any }> {
    // Buscar catálogo padrão (nome "Catálogo Principal" ou primeiro catálogo do usuário)
    const existingCatalog = await this.catalogModel
      .findOne({
        unitId,
        ownerId: userId,
        isDeleted: { $ne: true },
      })
      .sort({ createdAt: 1 })
      .lean();

    // Se não encontrou, criar um novo
    if (!existingCatalog) {
      return await this.create(unitId, userId, {
        name: 'Catálogo Principal',
        description: 'Catálogo padrão de produtos',
        isPublic: false,
      });
    }

    // Adicionar id virtual ao objeto lean e garantir _id também
    const catalogId = existingCatalog._id?.toString();
    if (!catalogId) {
      throw new Error('Não foi possível obter o ID do catálogo existente');
    }
    
    return {
      ...existingCatalog,
      id: catalogId,
      _id: existingCatalog._id,
    } as Catalog & { id: string; _id?: any };
  }
}


