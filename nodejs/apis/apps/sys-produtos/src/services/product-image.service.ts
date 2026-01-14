import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Multer } from 'multer';
import {
  PRODUCT_IMAGE_COLLECTION,
  ProductImage,
} from '../schemas/product-image.schema';
import { storageConfig } from '../config/storage.config';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
// Dimensões serão obtidas via metadata ou deixadas como 0 inicialmente

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const rmdir = promisify(fs.rmdir);

@Injectable()
export class ProductImageService {
  constructor(
    @InjectModel(PRODUCT_IMAGE_COLLECTION)
    private readonly productImageModel: Model<ProductImage>,
  ) {}

  /**
   * Gera hashId único baseado no conteúdo do arquivo + timestamp
   */
  private async generateHashId(fileBuffer: Buffer): Promise<string> {
    const hash = crypto.createHash(storageConfig.HASH_ALGORITHM);
    hash.update(fileBuffer);
    hash.update(Date.now().toString());
    hash.update(crypto.randomBytes(16).toString('hex'));
    return hash.digest('hex');
  }

  /**
   * Obtém dimensões da imagem
   * Nota: Implementação básica - pode ser melhorada com biblioteca de imagem no futuro
   */
  private async getImageDimensions(
    filePath: string,
  ): Promise<{ width: number; height: number }> {
    // Por enquanto retorna valores padrão
    // Pode ser implementado com sharp ou jimp no futuro
    return { width: 0, height: 0 };
  }

  /**
   * Upload de imagem (productId é obrigatório)
   */
  async uploadImage(
    file: Multer.File,
    productId: string,
    unitId: string,
    isThumbnail: boolean = false,
  ): Promise<{
    hashId: string;
    url: string;
    thumbnailUrl?: string;
    path: string;
  }> {
    if (!productId) {
      throw new BadRequestException(
        'productId é obrigatório para fazer upload de imagem',
      );
    }
    // Validar arquivo
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    if (!storageConfig.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Tipos permitidos: ${storageConfig.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > storageConfig.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${storageConfig.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Ler arquivo para gerar hashId
    const fileBuffer = await readFile(file.path);
    const hashId = await this.generateHashId(fileBuffer);

    // Obter dimensões
    const dimensions = await this.getImageDimensions(file.path);

    // Criar estrutura de pastas final baseada em data-hora-minuto
    const now = new Date();
    const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const finalDir = path.join(storageConfig.UPLOAD_DIR, dateFolder, hashId);

    // Criar diretório final
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    // Mover arquivo para localização final
    const ext = path.extname(file.originalname);
    const finalPath = path.join(finalDir, `original${ext}`);
    await rename(file.path, finalPath);

    // Remover diretório temporário se diferente
    const tempDir = path.dirname(file.path);
    if (tempDir !== finalDir && fs.existsSync(tempDir)) {
      try {
        await rmdir(tempDir);
      } catch {
        // Ignorar erro se diretório não estiver vazio
      }
    }

    // Gerar URLs
    const url = `/api/products/images/${hashId}`;
    const relativePath = path.relative(storageConfig.UPLOAD_DIR, finalPath);

    // Criar registro no banco (productId é obrigatório)
    const productImage = await this.productImageModel.create({
      hashId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
      path: relativePath,
      url,
      isThumbnail,
      productId, // Obrigatório
      unitId,
      order: 0,
    });

    return {
      hashId,
      url,
      path: relativePath,
    };
  }

  /**
   * Obter imagem por hashId (não requer productId - pode ser imagem ainda não associada)
   */
  async getImageByHash(
    hashId: string,
    unitId: string,
  ): Promise<{ filePath: string; mimeType: string }> {
    // Buscar imagem por hashId e unitId (productId é opcional)
    const image = await this.productImageModel
      .findOne({ hashId, unitId })
      .lean();

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    const filePath = path.join(storageConfig.UPLOAD_DIR, image.path);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        'Arquivo de imagem não encontrado no sistema de arquivos',
      );
    }

    return {
      filePath,
      mimeType: image.mimeType,
    };
  }

  /**
   * Deletar imagem
   */
  async deleteImage(hashId: string, unitId: string): Promise<void> {
    const image = await this.productImageModel.findOne({ hashId, unitId });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    // Remover arquivo do sistema
    const filePath = path.join(storageConfig.UPLOAD_DIR, image.path);
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }

    // Remover thumbnail se existir
    if (image.thumbnailPath) {
      const thumbnailPath = path.join(
        storageConfig.UPLOAD_DIR,
        image.thumbnailPath,
      );
      if (fs.existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
      }
    }

    // Remover diretório se estiver vazio
    const dirPath = path.dirname(filePath);
    try {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        await rmdir(dirPath);
      }
    } catch {
      // Ignorar erro
    }

    // Remover registro do banco
    await this.productImageModel.deleteOne({ hashId });
  }

  /**
   * Atualizar ordem das imagens
   */
  async updateImageOrder(
    productId: string,
    imageHashes: string[],
  ): Promise<void> {
    const updates = imageHashes.map((hashId, index) => ({
      updateOne: {
        filter: { hashId, productId },
        update: { order: index },
      },
    }));

    await this.productImageModel.bulkWrite(updates);
  }

  /**
   * Associar imagem a um produto (quando produto é criado após upload)
   */
  async associateImageToProduct(
    hashId: string,
    productId: string,
    unitId: string,
  ): Promise<void> {
    const image = await this.productImageModel.findOne({ hashId, unitId });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    image.productId = productId;
    await image.save();
  }

  /**
   * Obter todas as imagens de um produto
   */
  async getProductImages(
    productId: string,
    unitId: string,
  ): Promise<ProductImage[]> {
    return this.productImageModel
      .find({ productId, unitId })
      .sort({ order: 1 })
      .lean();
  }
}
