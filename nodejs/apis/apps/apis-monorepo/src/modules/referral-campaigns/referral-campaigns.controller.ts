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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReferralCampaignsService } from './referral-campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignFiltersDto } from './dto/campaign-filters.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('referral-campaigns')
@Controller('referral-campaigns')
export class ReferralCampaignsController {
  constructor(private readonly campaignsService: ReferralCampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar campanha de indicação' })
  @ApiResponse({ status: 201, description: 'Campanha criada com sucesso' })
  create(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.campaignsService.create(createCampaignDto, user.id, franchiseId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campanhas de indicação' })
  @ApiResponse({ status: 200, description: 'Lista de campanhas' })
  findAll(
    @Query() filters: CampaignFiltersDto,
    @CurrentUser() user?: CurrentUserShape,
  ) {
    const franchiseId = user?.unitId || user?.profile?.unitId;
    return this.campaignsService.findAll(filters, franchiseId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar campanhas ativas' })
  @ApiResponse({ status: 200, description: 'Lista de campanhas ativas' })
  getActiveCampaigns(@CurrentUser() user?: CurrentUserShape) {
    const franchiseId = user?.unitId || user?.profile?.unitId;
    return this.campaignsService.getActiveCampaigns(franchiseId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar campanha por slug' })
  @ApiResponse({ status: 200, description: 'Campanha encontrada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  findBySlug(@Param('slug') slug: string) {
    return this.campaignsService.findBySlug(slug);
  }

  @Get('franchise/:franchiseId')
  @ApiOperation({ summary: 'Listar campanhas de uma franquia' })
  @ApiResponse({ status: 200, description: 'Lista de campanhas da franquia' })
  findByFranchise(@Param('franchiseId') franchiseId: string) {
    return this.campaignsService.findByFranchise(franchiseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma campanha' })
  @ApiResponse({ status: 200, description: 'Campanha encontrada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: CurrentUserShape,
  ) {
    const franchiseId = user?.unitId || user?.profile?.unitId;
    return this.campaignsService.findOne(id, franchiseId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha atualizada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.campaignsService.update(id, updateCampaignDto, franchiseId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar campanha' })
  @ApiResponse({ status: 204, description: 'Campanha deletada' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.campaignsService.remove(id, franchiseId);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ativar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha ativada' })
  activate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.campaignsService.activate(id, franchiseId);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Pausar campanha' })
  @ApiResponse({ status: 200, description: 'Campanha pausada' })
  pause(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.campaignsService.pause(id, franchiseId);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter estatísticas da campanha' })
  @ApiResponse({ status: 200, description: 'Estatísticas da campanha' })
  getStats(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.campaignsService.getStats(id, franchiseId);
  }
}
