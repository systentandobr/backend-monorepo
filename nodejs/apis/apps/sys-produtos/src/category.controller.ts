import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './services/category.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto/category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  list(@Query() query: QueryCategoryDto) {
    return this.categoryService.list(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  getById(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiResponse({ status: 200, description: 'Categoria excluída' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 400, description: 'Categoria possui produtos associados' })
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}

