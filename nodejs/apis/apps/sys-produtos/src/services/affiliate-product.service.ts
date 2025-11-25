import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { AFFILIATE_PRODUCT_COLLECTION, AffiliateProduct } from '../schemas/affiliate-product.schema';
import { CreateAffiliateProductDto, UpdateAffiliateProductDto, QueryAffiliateProductDto } from '../dto/affiliate-product.dto';
import { SysProdutosService } from '../sys-produtos.service';
import { CreateProdutoDto } from '../dto/create-produto.dto';
import axios from 'axios';

@Injectable()
export class AffiliateProductService {
  private readonly SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:8002';

  constructor(
    @InjectModel(AFFILIATE_PRODUCT_COLLECTION) 
    private readonly affiliateProductModel: Model<AffiliateProduct>,
    private readonly produtosService: SysProdutosService,
  ) {}

  async create(userId: string, unitId: string, dto: CreateAffiliateProductDto) {
    // Detectar plataforma se não fornecida
    const platform = dto.platform || this.detectPlatform(dto.affiliateUrl);

    // TODO: Buscar nome da categoria quando houver serviço de categorias
    // Por enquanto, usar o ID como nome
    const categoryName = dto.categoryId;

    const affiliateProduct = await this.affiliateProductModel.create({
      ...dto,
      platform,
      userId,
      unitId,
      categoryName,
      processingStatus: 'pending',
      retryCount: 0,
      maxRetries: 3,
    });

    // Processar em background
    this.processProductAsync(affiliateProduct._id.toString()).catch(err => {
      console.error('Erro ao processar produto:', err);
    });

    return affiliateProduct.toObject();
  }

  async list(userId: string, unitId: string | undefined, query: QueryAffiliateProductDto = {}) {
    const filter: FilterQuery<AffiliateProduct> = {
      userId,
    };

    if (unitId) {
      filter.unitId = unitId;
    }

    if (query.status) {
      filter.processingStatus = query.status;
    }

    if (query.platform) {
      filter.platform = query.platform;
    }

    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.affiliateProductModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.affiliateProductModel.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
    };
  }

  async getById(id: string, userId: string) {
    const doc = await this.affiliateProductModel.findOne({ _id: id, userId }).lean();
    if (!doc) throw new NotFoundException('Produto afiliado não encontrado');
    return doc;
  }

  async update(id: string, userId: string, dto: UpdateAffiliateProductDto) {
    const doc = await this.affiliateProductModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Produto afiliado não encontrado');
    return doc;
  }

  async delete(id: string, userId: string) {
    const res = await this.affiliateProductModel.findOneAndDelete({ _id: id, userId }).lean();
    if (!res) throw new NotFoundException('Produto afiliado não encontrado');
    return { success: true };
  }

  async retry(id: string, userId: string) {
    const doc = await this.affiliateProductModel.findOne({ _id: id, userId }).lean();
    if (!doc) throw new NotFoundException('Produto afiliado não encontrado');

    if (doc.retryCount >= doc.maxRetries) {
      throw new BadRequestException('Número máximo de tentativas atingido');
    }

    // Atualizar status e processar novamente
    await this.affiliateProductModel.findByIdAndUpdate(id, {
      processingStatus: 'retrying',
      retryCount: doc.retryCount + 1,
      errorMessage: undefined,
    });

    // Processar em background
    this.processProductAsync(id).catch(err => {
      console.error('Erro ao reprocessar produto:', err);
    });

    return { success: true, message: 'Reprocessamento iniciado' };
  }

  async processProductAsync(affiliateProductId: string) {
    try {
      // Atualizar status para processando
      await this.affiliateProductModel.findByIdAndUpdate(affiliateProductId, {
        processingStatus: 'processing',
      });

      const affiliateProduct = await this.affiliateProductModel.findById(affiliateProductId).lean();
      if (!affiliateProduct) {
        throw new Error('Produto afiliado não encontrado');
      }

      // Chamar API de scraping Python
      const scraperResponse = await axios.post(`${this.SCRAPER_API_URL}/scrape`, {
        url: affiliateProduct.affiliateUrl,
        platform: affiliateProduct.platform,
        category_id: affiliateProduct.categoryId,
        user_id: affiliateProduct.userId,
        unit_id: affiliateProduct.unitId,
      });

      if (!scraperResponse.data.success) {
        throw new Error(scraperResponse.data.error || 'Erro ao fazer scraping');
      }

      const scrapedData = scraperResponse.data.data;

      // Criar produto completo usando o serviço de produtos
      const productData: CreateProdutoDto = {
        name: scrapedData.name || 'Produto sem nome',
        description: scrapedData.description || '',
        price: scrapedData.price || 0,
        tags: scrapedData.tags || [],
        active: true,
      };

      const createdProduct = await this.produtosService.create(
        affiliateProduct.unitId,
        productData
      );

      // Obter ID do produto criado (pode ser ObjectId ou string)
      const productId = typeof createdProduct._id === 'string' 
        ? createdProduct._id 
        : createdProduct._id.toString();

      // Atualizar metadados do produto (imagens, categorias)
      if (scrapedData.images && scrapedData.images.length > 0) {
        await this.produtosService.updateMetadata(productId, {
          images: scrapedData.images,
          categories: [affiliateProduct.categoryId],
        });
      }

      // Atualizar produto afiliado com sucesso
      await this.affiliateProductModel.findByIdAndUpdate(affiliateProductId, {
        processingStatus: 'completed',
        productId,
        scrapedData,
        processedAt: new Date(),
      });

    } catch (error: any) {
      console.error('Erro ao processar produto afiliado:', error);

      // Atualizar com erro
      await this.affiliateProductModel.findByIdAndUpdate(affiliateProductId, {
        processingStatus: 'failed',
        errorMessage: error.message || 'Erro desconhecido',
      });
    }
  }

  private detectPlatform(url: string): 'shopee' | 'amazon' | 'magalu' | 'mercadolivre' | 'americanas' | 'casasbahia' | 'other' {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('shopee')) return 'shopee';
    if (lowerUrl.includes('amazon')) return 'amazon';
    if (lowerUrl.includes('magalu') || lowerUrl.includes('magazine')) return 'magalu';
    if (lowerUrl.includes('mercadolivre') || lowerUrl.includes('mercadolibre')) return 'mercadolivre';
    if (lowerUrl.includes('americanas')) return 'americanas';
    if (lowerUrl.includes('casasbahia')) return 'casasbahia';
    return 'other';
  }

  async getMetrics(userId: string, unitId?: string) {
    const filter: FilterQuery<AffiliateProduct> = { userId };
    if (unitId) filter.unitId = unitId;

    const [total, pending, processing, completed, failed, retrying] = await Promise.all([
      this.affiliateProductModel.countDocuments(filter),
      this.affiliateProductModel.countDocuments({ ...filter, processingStatus: 'pending' }),
      this.affiliateProductModel.countDocuments({ ...filter, processingStatus: 'processing' }),
      this.affiliateProductModel.countDocuments({ ...filter, processingStatus: 'completed' }),
      this.affiliateProductModel.countDocuments({ ...filter, processingStatus: 'failed' }),
      this.affiliateProductModel.countDocuments({ ...filter, processingStatus: 'retrying' }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      retrying,
    };
  }
}

