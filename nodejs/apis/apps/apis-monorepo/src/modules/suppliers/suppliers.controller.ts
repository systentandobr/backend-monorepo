import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import {
  SupplierResponseDto,
  SuppliersByUnitResponseDto,
} from './dto/supplier-response.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo fornecedor' })
  @ApiResponse({
    status: 201,
    description: 'Fornecedor criado com sucesso',
    type: SupplierResponseDto,
  })
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @UnitScope()
  @ApiOperation({ summary: 'Listar todos os fornecedores' })
  @ApiQuery({
    name: 'unitId',
    required: false,
    description: 'Filtrar por ID da unidade',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fornecedores',
    type: [SupplierResponseDto],
  })
  findAll(
    @Query('unitId') unitId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.suppliersService.findAll(unitId, estado);
  }

  @Get('by-unit/:unitId')
  @UnitScope()
  @ApiOperation({
    summary: 'Buscar fornecedores por unidade',
    description: 'Retorna todos os fornecedores associados a uma unidade específica',
  })
  @ApiParam({
    name: 'unitId',
    description: 'ID da unidade (ex: #BR#ALL#SYSTEM#0001)',
    example: '#BR#ALL#SYSTEM#0001',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fornecedores da unidade',
    type: SuppliersByUnitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Unidade não encontrada ou sem fornecedores',
  })
  async findByUnit(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: SuppliersByUnitResponseDto;
    error: null;
  }> {
    const decodedUnitId = decodeURIComponent(unitId);
    const data = await this.suppliersService.findByUnitId(decodedUnitId);

    return {
      success: true,
      data,
      error: null,
    };
  }

  @Get(':id')
  @UnitScope()
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor' })
  @ApiResponse({
    status: 200,
    description: 'Fornecedor encontrado',
    type: SupplierResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Fornecedor não encontrado',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @UnitScope()
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor' })
  @ApiResponse({
    status: 200,
    description: 'Fornecedor atualizado',
    type: SupplierResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @UnitScope()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover fornecedor' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor' })
  @ApiResponse({
    status: 204,
    description: 'Fornecedor removido',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    return this.suppliersService.remove(id);
  }

  @Post('seed/:unitId')
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Semear fornecedores para uma unidade',
    description: 'Remove fornecedores existentes e insere novos dados',
  })
  @ApiParam({
    name: 'unitId',
    description: 'ID da unidade',
    example: '#BR#ALL#SYSTEM#0001',
  })
  @ApiResponse({
    status: 201,
    description: 'Fornecedores semeados com sucesso',
    type: SuppliersByUnitResponseDto,
  })
  async seedSuppliers(
    @Param('unitId') unitId: string,
    @Body() suppliersData: CreateSupplierDto[],
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: SuppliersByUnitResponseDto;
    error: null;
  }> {
    const decodedUnitId = decodeURIComponent(unitId);
    const data = await this.suppliersService.seedSuppliers(
      decodedUnitId,
      suppliersData,
    );

    return {
      success: true,
      data,
      error: null,
    };
  }
}
