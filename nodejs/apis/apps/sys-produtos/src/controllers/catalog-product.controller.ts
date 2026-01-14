import {
  Body,
  Controller,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserShape,
} from '../decorators/current-user.decorator';
import { CatalogProductService } from '../services/catalog-product.service';
import { CreateCatalogProductDto } from '../dto/catalog-product.dto';

@ApiTags('catalog-products')
@ApiBearerAuth()
@Controller('catalog-products')
export class CatalogProductController {
  constructor(private readonly catalogProductService: CatalogProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar produto e associar ao catálogo' })
  @ApiResponse({
    status: 201,
    description: 'Produto criado e associado ao catálogo com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Erro na validação dos dados' })
  async create(
    @CurrentUser() user: CurrentUserShape,
    @Body() dto: CreateCatalogProductDto,
  ) {
    if (!user.id || !user.unitId) {
      throw new BadRequestException('Usuário não autenticado ou sem unidade');
    }

    if (!dto.supplierId) {
      throw new BadRequestException('supplierId é obrigatório');
    }

    const result = await this.catalogProductService.createCatalogProduct(
      user.unitId as string,
      user.id,
      dto.supplierId,
      dto,
    );

    return {
      success: true,
      data: result,
    };
  }
}
