import { Injectable, BadRequestException } from '@nestjs/common';
import { SysProdutosService } from '../sys-produtos.service';
import { CatalogService } from './catalog.service';
import { ProductImageService } from './product-image.service';
import { CreateCatalogProductDto } from '../dto/catalog-product.dto';
import { CreateProdutoDto } from '../dto/create-produto.dto';

@Injectable()
export class CatalogProductService {
  constructor(
    private readonly sysProdutosService: SysProdutosService,
    private readonly catalogService: CatalogService,
    private readonly productImageService: ProductImageService,
  ) {}

  /**
   * Criar produto e associar ao catálogo
   */
  async createCatalogProduct(
    unitId: string,
    userId: string,
    supplierId: string,
    productData: CreateCatalogProductDto,
  ): Promise<{ product: any; catalogId: string; message: string }> {
    if (!unitId) {
      throw new BadRequestException('unitId é obrigatório');
    }

    if (!supplierId) {
      throw new BadRequestException('supplierId é obrigatório');
    }

    // Criar DTO de produto sem supplierId (já que será adicionado separadamente)
    const produtoDto: CreateProdutoDto = {
      ...productData,
      supplierID: supplierId,
    };

    // Criar produto
    const product = await this.sysProdutosService.create(unitId, produtoDto);
    const productId =
      (product as any)?._id?.toString() || (product as any)?.id?.toString();

    if (!productId) {
      throw new BadRequestException(
        'Não foi possível obter o ID do produto criado',
      );
    }

    // Buscar ou criar catálogo padrão para o unitId
    const catalog = await this.catalogService.findOrCreateDefaultCatalog(
      unitId,
      userId,
    );

    // Obter catalogId de forma segura (pode ser id ou _id dependendo de como foi retornado)
    const catalogId =
      (catalog as any)?._id?.toString() || (catalog as any)?.id?.toString();

    if (!catalogId) {
      throw new BadRequestException('Não foi possível obter o ID do catálogo');
    }

    // Adicionar produto ao catálogo
    await this.catalogService.addProduct(catalogId, productId, unitId, userId);

    // Se houver imagens com hashId, associar ao produto
    if (productData.images && Array.isArray(productData.images)) {
      for (const imageRef of productData.images) {
        if (typeof imageRef === 'object' && imageRef.hashId) {
          try {
            await this.productImageService.associateImageToProduct(
              imageRef.hashId,
              productId,
              unitId,
            );
          } catch (error) {
            // Log erro mas não falha a criação do produto
            console.error(
              `Erro ao associar imagem ${imageRef.hashId} ao produto:`,
              error,
            );
          }
        }
      }
    }

    return {
      product,
      catalogId: catalogId,
      message: 'Produto criado e associado ao catálogo com sucesso',
    };
  }
}
