import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ReferralFiltersDto } from './dto/referral-filters.dto';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar indicação (gerar código)' })
  @ApiResponse({ status: 201, description: 'Indicação criada com sucesso' })
  create(
    @Body() createReferralDto: CreateReferralDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    // TODO:  adicionar um fallback se não tiver o franchiseId, salvar o user.id  para indicar futuramente que o usuario indicou o sistema para novos possíveis Franquias ou Unidades ou Academias;    if (!franchiseId) {
    if (!franchiseId) {
      // salvar o user.id  para indicar futuramente que o usuario indicou o sistema para novos possíveis Franquias ou Unidades ou Academias;
      return this.referralsService.create(
        createReferralDto,
        user.id,
        null,
      );
    }
    return this.referralsService.create(
      createReferralDto,
      user.id,
      franchiseId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar indicações' })
  @ApiResponse({ status: 200, description: 'Lista de indicações' })
  findAll(
    @Query() filters: ReferralFiltersDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.referralsService.findAll(filters, franchiseId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Minhas indicações' })
  @ApiResponse({ status: 200, description: 'Lista de indicações do usuário' })
  findMyReferrals(@CurrentUser() user: CurrentUserShape) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.referralsService.findByUser(user.id, franchiseId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Buscar indicação por código' })
  @ApiResponse({ status: 200, description: 'Indicação encontrada' })
  @ApiResponse({ status: 404, description: 'Código não encontrado' })
  findByCode(@Param('code') code: string) {
    return this.referralsService.findByCode(code);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Indicações de um usuário' })
  @ApiResponse({ status: 200, description: 'Lista de indicações do usuário' })
  findByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.referralsService.findByUser(userId, franchiseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detalhes da indicação' })
  @ApiResponse({ status: 200, description: 'Indicação encontrada' })
  @ApiResponse({ status: 404, description: 'Indicação não encontrada' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.referralsService.findOne(id, franchiseId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completar indicação (quando houver compra)' })
  @ApiResponse({ status: 200, description: 'Indicação completada' })
  @ApiResponse({ status: 404, description: 'Indicação não encontrada' })
  completeReferral(
    @Param('id') id: string,
    @Body() body: { orderId: string; refereeId: string },
  ) {
    return this.referralsService.completeReferral(
      id,
      body.orderId,
      body.refereeId,
    );
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar indicação' })
  @ApiResponse({ status: 200, description: 'Indicação cancelada' })
  @ApiResponse({ status: 404, description: 'Indicação não encontrada' })
  cancelReferral(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.referralsService.cancelReferral(id, user.id, franchiseId);
  }

  @Get('campaign/:campaignId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Estatísticas da campanha' })
  @ApiResponse({ status: 200, description: 'Estatísticas da campanha' })
  getCampaignStats(
    @Param('campaignId') campaignId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.referralsService.getCampaignStats(campaignId, franchiseId);
  }
}
