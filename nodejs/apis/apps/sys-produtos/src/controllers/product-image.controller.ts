import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import type { Multer } from 'multer';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserShape } from '../decorators/current-user.decorator';
import { ProductImageService } from '../services/product-image.service';
import { UploadMiddleware } from '../middleware/upload.middleware';
import * as fs from 'fs';

@ApiTags('product-images')
@ApiBearerAuth()
@Controller('products/images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', UploadMiddleware.getMulterOptions()))
  @ApiOperation({ summary: 'Upload de imagem de produto' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Imagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na validação do arquivo' })
  async uploadImage(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: CurrentUserShape,
    @Body('productId') productId: string,
    @Body('isThumbnail') isThumbnail?: boolean,
  ) {
    if (!productId) {
      throw new BadRequestException('productId é obrigatório');
    }
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    if (!user.unitId) {
      console.error('❌ unitId não encontrado no token do usuário:', {
        userId: user.id,
        username: user.username,
        email: user.email,
        payload: user.payload,
      });
      throw new BadRequestException(
        'unitId não encontrado no token de autenticação. Por favor, faça login novamente ou verifique suas permissões.',
      );
    }

    const result = await this.productImageService.uploadImage(
      file,
      productId,
      user.unitId as string,
      isThumbnail === true,
    );

    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':hashId')
  @ApiOperation({ summary: 'Obter imagem por hashId' })
  @ApiResponse({ status: 200, description: 'Imagem encontrada' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async getImage(
    @Param('hashId') hashId: string,
    @CurrentUser() user: CurrentUserShape,
    @Res() res: Response,
  ) {
    if (!user.unitId) {
      throw new BadRequestException('unitId não encontrado');
    }

    const { filePath, mimeType } = await this.productImageService.getImageByHash(
      hashId,
      user.unitId as string,
    );

    // Configurar headers de cache
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
    res.setHeader('ETag', hashId);

    // Enviar arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':hashId/thumbnail')
  @ApiOperation({ summary: 'Obter thumbnail da imagem' })
  @ApiResponse({ status: 200, description: 'Thumbnail encontrada' })
  @ApiResponse({ status: 404, description: 'Thumbnail não encontrada' })
  async getThumbnail(
    @Param('hashId') hashId: string,
    @CurrentUser() user: CurrentUserShape,
    @Res() res: Response,
  ) {
    if (!user.unitId) {
      throw new BadRequestException('unitId não encontrado');
    }

    // Por enquanto retorna a imagem original
    // Pode ser implementado para retornar thumbnail quando gerada
    const { filePath, mimeType } = await this.productImageService.getImageByHash(
      hashId,
      user.unitId as string,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('ETag', `${hashId}-thumb`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':hashId')
  @ApiOperation({ summary: 'Deletar imagem' })
  @ApiResponse({ status: 200, description: 'Imagem deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async deleteImage(@Param('hashId') hashId: string, @CurrentUser() user: CurrentUserShape) {
    if (!user.unitId) {
      throw new BadRequestException('unitId não encontrado');
    }

    await this.productImageService.deleteImage(hashId, user.unitId as string);

    return {
      success: true,
      message: 'Imagem deletada com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':hashId/associate')
  @ApiOperation({ summary: 'Associar imagem a um produto' })
  @ApiResponse({ status: 200, description: 'Imagem associada ao produto com sucesso' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async associateImageToProduct(
    @Param('hashId') hashId: string,
    @CurrentUser() user: CurrentUserShape,
    @Body('productId') productId: string,
  ) {
    if (!user.unitId) {
      throw new BadRequestException('unitId não encontrado');
    }

    if (!productId) {
      throw new BadRequestException('productId é obrigatório');
    }

    await this.productImageService.associateImageToProduct(hashId, productId, user.unitId as string);

    return {
      success: true,
      message: 'Imagem associada ao produto com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':productId/order')
  @ApiOperation({ summary: 'Atualizar ordem das imagens' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso' })
  async updateImageOrder(
    @Param('productId') productId: string,
    @Body('imageHashes') imageHashes: string[],
  ) {
    if (!Array.isArray(imageHashes)) {
      throw new BadRequestException('imageHashes deve ser um array');
    }

    await this.productImageService.updateImageOrder(productId, imageHashes);

    return {
      success: true,
      message: 'Ordem das imagens atualizada com sucesso',
    };
  }
}

