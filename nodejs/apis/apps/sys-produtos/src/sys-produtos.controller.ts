import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SysProdutosService } from './sys-produtos.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserShape } from './decorators/current-user.decorator';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { QueryProdutoDto } from './dto/query-produto.dto';
import { AdjustStockDeltaDto, AdjustStockDto, CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';
import { CategoryDto, ImageDto, UpdateProdutoMetadataDto } from './dto/produto-metadata.dto';

@ApiTags('produtos')
@ApiBearerAuth()
@Controller('produtos')
export class SysProdutosController {
  constructor(private readonly sysProdutosService: SysProdutosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(@CurrentUser() user: CurrentUserShape, @Query() query: QueryProdutoDto) {
    return this.sysProdutosService.list(user.unitId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: CurrentUserShape, @Body() dto: CreateProdutoDto) {
    return this.sysProdutosService.create(user.unitId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.sysProdutosService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.sysProdutosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sysProdutosService.delete(id);
  }

  // ===== Variantes =====
  @UseGuards(JwtAuthGuard)
  @Post(':id/variants')
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.sysProdutosService.addVariant(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/variants/:sku')
  updateVariant(
    @Param('id') id: string,
    @Param('sku') sku: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.sysProdutosService.updateVariant(id, sku, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/variants/:sku')
  removeVariant(@Param('id') id: string, @Param('sku') sku: string) {
    return this.sysProdutosService.removeVariant(id, sku);
  }

  // ===== Estoque por unidade =====
  @UseGuards(JwtAuthGuard)
  @Patch(':id/variants/:sku/stock')
  adjustStock(
    @Param('id') id: string,
    @Param('sku') sku: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    // Se unitId não vier no body, usar o do usuário
    dto.unitId ||= user.unitId as string;
    return this.sysProdutosService.setVariantStock(id, sku, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/variants/:sku/stock/inc')
  incStock(
    @Param('id') id: string,
    @Param('sku') sku: string,
    @Body() dto: AdjustStockDeltaDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    dto.unitId ||= user.unitId as string;
    return this.sysProdutosService.incVariantStock(id, sku, dto);
  }

  // ===== Metadados =====
  @UseGuards(JwtAuthGuard)
  @Patch(':id/metadata')
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateProdutoMetadataDto,
  ) {
    return this.sysProdutosService.updateMetadata(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  addImage(@Param('id') id: string, @Body() body: ImageDto) {
    return this.sysProdutosService.addImage(id, body.url as string);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/images')
  removeImage(@Param('id') id: string, @Body() body: ImageDto) {
    return this.sysProdutosService.removeImage(id, body.url as string);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/categories')
  addCategory(@Param('id') id: string, @Body() body: CategoryDto) {
    return this.sysProdutosService.addCategory(id, body.category as string);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/categories')
  removeCategory(@Param('id') id: string, @Body() body: CategoryDto) {
    return this.sysProdutosService.removeCategory(id, body.category as string);
  }

  // ===== Produtos Relacionados =====
  @UseGuards(JwtAuthGuard)
  @Get(':id/related')
  getRelatedProducts(@Param('id') id: string, @Query('limit') limit?: number) {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 10;
    return this.sysProdutosService.findRelated(id, limitNum);
  }
}
