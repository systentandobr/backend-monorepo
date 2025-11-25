import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateProductService } from './services/affiliate-product.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserShape } from './decorators/current-user.decorator';
import { CreateAffiliateProductDto, UpdateAffiliateProductDto, QueryAffiliateProductDto } from './dto/affiliate-product.dto';

@ApiTags('affiliate-products')
@ApiBearerAuth()
@Controller('affiliate-products')
export class AffiliateProductController {
  constructor(private readonly affiliateProductService: AffiliateProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar novo produto afiliado' })
  @ApiResponse({ status: 201, description: 'Produto afiliado criado com sucesso' })
  create(
    @CurrentUser() user: CurrentUserShape,
    @Body() dto: CreateAffiliateProductDto
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.create(
      user.id,
      user.unitId || '',
      dto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar produtos afiliados' })
  @ApiResponse({ status: 200, description: 'Lista de produtos afiliados' })
  list(
    @CurrentUser() user: CurrentUserShape,
    @Query() query: QueryAffiliateProductDto
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.list(
      user.id,
      user.unitId,
      query
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  @ApiOperation({ summary: 'Obter métricas de produtos afiliados' })
  @ApiResponse({ status: 200, description: 'Métricas de produtos afiliados' })
  getMetrics(@CurrentUser() user: CurrentUserShape) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.getMetrics(
      user.id,
      user.unitId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter produto afiliado por ID' })
  @ApiResponse({ status: 200, description: 'Produto afiliado encontrado' })
  @ApiResponse({ status: 404, description: 'Produto afiliado não encontrado' })
  getById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.getById(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto afiliado' })
  @ApiResponse({ status: 200, description: 'Produto afiliado atualizado' })
  @ApiResponse({ status: 404, description: 'Produto afiliado não encontrado' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Body() dto: UpdateAffiliateProductDto
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir produto afiliado' })
  @ApiResponse({ status: 200, description: 'Produto afiliado excluído' })
  @ApiResponse({ status: 404, description: 'Produto afiliado não encontrado' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.delete(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/retry')
  @ApiOperation({ summary: 'Reprocessar produto afiliado' })
  @ApiResponse({ status: 200, description: 'Reprocessamento iniciado' })
  @ApiResponse({ status: 404, description: 'Produto afiliado não encontrado' })
  retry(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.affiliateProductService.retry(id, user.id);
  }
}

