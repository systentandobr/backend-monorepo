import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SolarService } from './solar.service';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';
import { CreateProductionDto } from './dto/create-production.dto';
import { CreateDistributionContractDto } from './dto/create-distribution-contract.dto';
import { UpdateProjectPhaseDto } from './dto/update-project-phase.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('solar')
@Controller('solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  // Helper para verificar se é admin
  private isAdmin(user: CurrentUserShape): boolean {
    const roles = user.roles || [];
    return roles.some((r: any) =>
      ['admin', 'sistema', 'system', 'support'].includes(r.name || r),
    );
  }

  // Helper para validar acesso ao unitId
  private validateUnitIdAccess(
    decodedUnitId: string,
    user: CurrentUserShape,
  ): void {
    const userUnitId = user.unitId || user.profile?.unitId;
    const isAdmin = this.isAdmin(user);

    if (!isAdmin && userUnitId !== decodedUnitId) {
      throw new ForbiddenException(
        'Acesso negado: você só pode acessar dados da sua própria unidade',
      );
    }
  }

  @Get(':unitId/production')
  @UnitScope()
  @ApiOperation({ summary: 'Busca dados de produção de energia' })
  @ApiResponse({ status: 200, description: 'Dados de produção retornados com sucesso' })
  async getProductionData(
    @Param('unitId') unitId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const data = await this.solarService.getProductionData(
      decodedUnitId,
      start,
      end,
    );

    return {
      success: true,
      data,
    };
  }

  @Post(':unitId/production')
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra dados de produção de energia' })
  @ApiResponse({ status: 201, description: 'Produção registrada com sucesso' })
  async recordProduction(
    @Param('unitId') unitId: string,
    @Body() createDto: CreateProductionDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const data = await this.solarService.recordProduction(
      decodedUnitId,
      createDto,
    );

    return {
      success: true,
      data,
    };
  }

  @Get(':unitId/metrics')
  @UnitScope()
  @ApiOperation({ summary: 'Busca métricas consolidadas de produção' })
  @ApiResponse({ status: 200, description: 'Métricas retornadas com sucesso' })
  async getProductionMetrics(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const metrics = await this.solarService.getProductionMetrics(decodedUnitId);

    return {
      success: true,
      data: metrics,
    };
  }

  @Get(':unitId/bi')
  @UnitScope()
  @ApiOperation({ summary: 'Busca métricas de Business Intelligence' })
  @ApiResponse({ status: 200, description: 'Métricas de BI retornadas com sucesso' })
  async getBIMetrics(
    @Param('unitId') unitId: string,
    @Query('period') period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const metrics = await this.solarService.getBIMetrics(
      decodedUnitId,
      period,
    );

    return {
      success: true,
      data: metrics,
    };
  }

  @Get(':unitId/project')
  @UnitScope()
  @ApiOperation({ summary: 'Busca informações do projeto solar' })
  @ApiResponse({ status: 200, description: 'Projeto retornado com sucesso' })
  async getProject(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const project = await this.solarService.getProject(decodedUnitId);

    return {
      success: true,
      data: project,
    };
  }

  @Post(':unitId/project')
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria novo projeto solar' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso' })
  async createProject(
    @Param('unitId') unitId: string,
    @Body() createDto: CreateSolarProjectDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const project = await this.solarService.createProject(
      decodedUnitId,
      createDto,
    );

    return {
      success: true,
      data: project,
    };
  }

  @Put(':unitId/project')
  @UnitScope()
  @ApiOperation({ summary: 'Atualiza projeto solar' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso' })
  async updateProject(
    @Param('unitId') unitId: string,
    @Body() updateDto: UpdateSolarProjectDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const project = await this.solarService.updateProject(
      decodedUnitId,
      updateDto,
    );

    return {
      success: true,
      data: project,
    };
  }

  @Put(':unitId/project-phase')
  @UnitScope()
  @ApiOperation({ summary: 'Atualiza fase do projeto' })
  @ApiResponse({ status: 200, description: 'Fase atualizada com sucesso' })
  async updateProjectPhase(
    @Param('unitId') unitId: string,
    @Body() updateDto: UpdateProjectPhaseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const project = await this.solarService.updateProjectPhase(
      decodedUnitId,
      updateDto,
    );

    return {
      success: true,
      data: project,
    };
  }

  @Delete(':unitId/project')
  @UnitScope()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deleta projeto solar e dados relacionados' })
  @ApiResponse({ status: 200, description: 'Projeto deletado com sucesso' })
  async deleteProject(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    await this.solarService.deleteProject(decodedUnitId);

    return {
      success: true,
      message: 'Projeto deletado com sucesso',
    };
  }

  @Get(':unitId/distribution')
  @UnitScope()
  @ApiOperation({ summary: 'Lista contratos de distribuição' })
  @ApiResponse({ status: 200, description: 'Contratos retornados com sucesso' })
  async getDistributionContracts(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const contracts = await this.solarService.getDistributionContracts(
      decodedUnitId,
    );

    return {
      success: true,
      data: contracts,
    };
  }

  @Post(':unitId/distribution')
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria novo contrato de distribuição' })
  @ApiResponse({ status: 201, description: 'Contrato criado com sucesso' })
  async createDistributionContract(
    @Param('unitId') unitId: string,
    @Body() createDto: CreateDistributionContractDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const contract = await this.solarService.createDistributionContract(
      decodedUnitId,
      createDto,
    );

    return {
      success: true,
      data: contract,
    };
  }

  @Get(':unitId/utility-comparison')
  @UnitScope()
  @ApiOperation({ summary: 'Compara custos com concessionária' })
  @ApiResponse({ status: 200, description: 'Comparação retornada com sucesso' })
  async getUtilityComparison(
    @Param('unitId') unitId: string,
    @Query('state') state: string = 'CE',
    @CurrentUser() user: CurrentUserShape,
  ) {
    const decodedUnitId = decodeURIComponent(unitId);
    this.validateUnitIdAccess(decodedUnitId, user);

    const comparison = await this.solarService.getUtilityComparison(
      decodedUnitId,
      state,
    );

    return {
      success: true,
      data: comparison,
    };
  }
}
