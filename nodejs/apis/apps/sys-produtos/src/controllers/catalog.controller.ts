import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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
import { CatalogService } from '../services/catalog.service';
import {
  CreateCatalogDto,
  UpdateCatalogDto,
  QueryCatalogDto,
} from '../dto/catalog.dto';

@ApiTags('catalogs')
@ApiBearerAuth()
@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar novo catálogo' })
  @ApiResponse({ status: 201, description: 'Catálogo criado com sucesso' })
  create(@CurrentUser() user: CurrentUserShape, @Body() dto: CreateCatalogDto) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.create(user.unitId as string, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar catálogos' })
  @ApiResponse({ status: 200, description: 'Lista de catálogos' })
  list(@CurrentUser() user: CurrentUserShape, @Query() query: QueryCatalogDto) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.list(user.unitId as string, user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter catálogo por ID' })
  @ApiResponse({ status: 200, description: 'Catálogo encontrado' })
  @ApiResponse({ status: 404, description: 'Catálogo não encontrado' })
  getById(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.getById(id, user.unitId as string, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo atualizado' })
  @ApiResponse({ status: 404, description: 'Catálogo não encontrado' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Body() dto: UpdateCatalogDto,
  ) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.update(id, user.unitId as string, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir catálogo' })
  @ApiResponse({ status: 200, description: 'Catálogo excluído' })
  @ApiResponse({ status: 404, description: 'Catálogo não encontrado' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.delete(id, user.unitId as string, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/products/:productId')
  @ApiOperation({ summary: 'Adicionar produto ao catálogo' })
  @ApiResponse({ status: 200, description: 'Produto adicionado ao catálogo' })
  addProduct(
    @Param('id') catalogId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.addProduct(
      catalogId,
      productId,
      user.unitId as string,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Remover produto do catálogo' })
  @ApiResponse({ status: 200, description: 'Produto removido do catálogo' })
  removeProduct(
    @Param('id') catalogId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    if (!user.id || !user.unitId) {
      throw new Error('Usuário não autenticado ou sem unidade');
    }
    return this.catalogService.removeProduct(
      catalogId,
      productId,
      user.unitId as string,
      user.id,
    );
  }
}
