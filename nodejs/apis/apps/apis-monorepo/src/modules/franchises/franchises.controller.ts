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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FranchisesService } from './franchises.service';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { FranchiseFiltersDto } from './dto/franchise-response.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('franchises')
@Controller('franchises')
export class FranchisesController {
  constructor(private readonly franchisesService: FranchisesService) {}

  // Helper para verificar se é admin
  private isAdmin(user: CurrentUserShape): boolean {
    const roles = user.roles || [];
    return roles.some((r: any) =>
      ['admin', 'sistema', 'system', 'support'].includes(r.name || r),
    );
  }

  @Post()
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createFranchiseDto: CreateFranchiseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    // Apenas admin pode criar franquias
    if (!this.isAdmin(user)) {
      throw new Error('Apenas administradores podem criar franquias');
    }
    return this.franchisesService.create(createFranchiseDto);
  }

  @Get()
  @UnitScope()
  findAll(
    @Query() filters: FranchiseFiltersDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    const isAdmin = this.isAdmin(user);
    return this.franchisesService.findAll(filters, unitId, isAdmin);
  }

  @Get('regional-trends')
  @UnitScope()
  getRegionalTrends(@CurrentUser() user: CurrentUserShape) {
    // Apenas admin pode ver tendências regionais
    if (!this.isAdmin(user)) {
      throw new Error('Apenas administradores podem ver tendências regionais');
    }
    return this.franchisesService.getRegionalTrends();
  }

  // IMPORTANTE: Rotas específicas devem vir ANTES de rotas com parâmetros dinâmicos
  // Caso contrário, o NestJS pode interpretar 'by-unit' como um :id
  @Get('by-unit/:unitId/market-segments')
  @UnitScope()
  async getMarketSegments(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    // Decodificar o unitId (NestJS decodifica automaticamente, mas garantimos)
    const decodedUnitId = decodeURIComponent(unitId);

    // Validar se unitId foi fornecido
    if (!decodedUnitId || decodedUnitId.trim() === '') {
      throw new Error('unitId é obrigatório');
    }

    const userUnitId = user.unitId || user.profile?.unitId;
    const isAdmin = this.isAdmin(user);

    // Verificar se o usuário tem permissão para acessar este unitId
    if (!isAdmin && userUnitId !== decodedUnitId) {
      throw new ForbiddenException(
        'Acesso negado: você só pode consultar a segmentação da sua própria unidade',
      );
    }

    return this.franchisesService.getMarketSegments(decodedUnitId);
  }

  @Get(':id')
  @UnitScope()
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    const isAdmin = this.isAdmin(user);
    return this.franchisesService.findOne(id, unitId, isAdmin);
  }

  @Get(':id/metrics')
  @UnitScope()
  getMetrics(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    const isAdmin = this.isAdmin(user);

    return this.franchisesService
      .findOne(id, unitId, isAdmin)
      .then((f) => f.metrics);
  }

  @Patch(':id')
  @UnitScope()
  update(
    @Param('id') id: string,
    @Body() updateFranchiseDto: UpdateFranchiseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    const isAdmin = this.isAdmin(user);

    // Apenas admin pode atualizar qualquer franquia, ou o próprio dono pode atualizar a sua
    if (!isAdmin && unitId) {
      // Verificar se está atualizando a própria franquia
      // Isso será validado no service
    }

    return this.franchisesService.update(
      id,
      updateFranchiseDto,
      unitId,
      isAdmin,
    );
  }

  @Delete(':id')
  @UnitScope()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    // Apenas admin pode deletar franquias
    if (!this.isAdmin(user)) {
      throw new Error('Apenas administradores podem deletar franquias');
    }

    const unitId = user.unitId || user.profile?.unitId;
    return this.franchisesService.remove(id, unitId, true);
  }
}
