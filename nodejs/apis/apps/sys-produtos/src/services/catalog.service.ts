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

  async create(unitId: string, ownerId: string, dto: CreateCatalogDto): Promise<Catalog> {
    const catalog = await this.catalogModel.create({
      unitId,
      ownerId,
      name: dto.name,
      description: dto.description,
      productIds: dto.productIds || [],
      isPublic: dto.isPublic ?? false,
    });

    return catalog.toObject();
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
    return catalogs as Catalog[];
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

    return catalog as Catalog;
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

    return updated as Catalog;
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

    return catalog.toObject();
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

    return catalog.toObject();
  }
}


