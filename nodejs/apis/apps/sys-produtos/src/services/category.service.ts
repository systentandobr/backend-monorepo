import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { CATEGORY_COLLECTION, Category } from '../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from '../dto/category.dto';
import { PRODUCT_COLLECTION, Product } from '../schemas/product.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CATEGORY_COLLECTION) 
    private readonly categoryModel: Model<Category>,
    @InjectModel(PRODUCT_COLLECTION)
    private readonly productModel: Model<Product>,
  ) {}

  /**
   * Criar slug a partir do nome
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Criar nova categoria
   */
  async create(dto: CreateCategoryDto) {
    const slug = this.slugify(dto.name);

    // Verificar se slug já existe
    const existing = await this.categoryModel.findOne({ slug }).lean();
    if (existing) {
      throw new BadRequestException('Categoria com este nome já existe');
    }

    const category = await this.categoryModel.create({
      ...dto,
      slug,
      isActive: dto.isActive ?? true,
      productCount: 0,
    });

    return category.toObject();
  }

  /**
   * Listar categorias
   */
  async list(query: QueryCategoryDto = {}) {
    const filter: FilterQuery<Category> = {};

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ name: 1 })
      .lean();

    // Atualizar contagem de produtos para cada categoria
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await this.productModel.countDocuments({
          categories: category.slug,
        });
        return {
          ...category,
          productCount: count,
        };
      })
    );

    return categoriesWithCount;
  }

  /**
   * Buscar categoria por ID
   */
  async getById(id: string) {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Contar produtos nesta categoria
    const productCount = await this.productModel.countDocuments({
      categories: category.slug,
    });

    return {
      ...category,
      productCount,
    };
  }

  /**
   * Buscar categoria por slug
   */
  async getBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug }).lean();
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const productCount = await this.productModel.countDocuments({
      categories: slug,
    });

    return {
      ...category,
      productCount,
    };
  }

  /**
   * Atualizar categoria
   */
  async update(id: string, dto: UpdateCategoryDto) {
    const update: any = { ...dto };

    // Se o nome mudou, atualizar slug
    if (dto.name) {
      const newSlug = this.slugify(dto.name);
      const existing = await this.categoryModel.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      }).lean();
      
      if (existing) {
        throw new BadRequestException('Categoria com este nome já existe');
      }
      
      update.slug = newSlug;
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Deletar categoria
   */
  async delete(id: string) {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Verificar se há produtos usando esta categoria
    const productCount = await this.productModel.countDocuments({
      categories: category.slug,
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir categoria com ${productCount} produto(s) associado(s)`
      );
    }

    await this.categoryModel.findByIdAndDelete(id);
    return { success: true };
  }
}

