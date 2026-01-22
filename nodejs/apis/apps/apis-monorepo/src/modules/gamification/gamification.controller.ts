import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { RankingQueryDto } from './dto/ranking-query.dto';
import {
  GamificationDataDto,
  RankingPositionDto,
} from './dto/gamification-response.dto';
import { ShareResponseDto } from './dto/share-response.dto';
import { CheckInHistoryQueryDto } from './dto/check-in-history-query.dto';
import { CheckInHistoryResponseDto } from './dto/check-in-response.dto';
import { WeeklyActivityResponseDto } from './dto/weekly-activity-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('ranking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna o ranking de usuários por unidade',
    description:
      'Retorna o ranking ordenado por totalPoints descendente, depois por level descendente',
  })
  @ApiQuery({
    name: 'unitId',
    required: true,
    type: String,
    description: 'ID da unidade',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de resultados (padrão: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking retornado com sucesso',
    type: [RankingPositionDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getRanking(
    @Query() query: RankingQueryDto,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ): Promise<{
    success: boolean;
    data: RankingPositionDto[];
    error: null;
  }> {
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const ranking = await this.gamificationService.getRanking(query, token);

    return {
      success: true,
      data: ranking,
      error: null,
    };
  }

  @Get('users/:userId/check-ins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna o histórico de check-ins do usuário',
    description:
      'Retorna check-ins ordenados por data (mais recente primeiro) com cálculo de streaks',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data final (ISO 8601)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de resultados (padrão: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de check-ins retornado com sucesso',
    type: CheckInHistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getCheckInHistory(
    @Param('userId') userId: string,
    @Query() query: CheckInHistoryQueryDto,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: CheckInHistoryResponseDto;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const limit = query.limit || 50;

    const history = await this.gamificationService.getCheckInHistory(
      userId,
      unitId,
      startDate,
      endDate,
      limit,
    );

    return {
      success: true,
      data: history,
      error: null,
    };
  }

  @Get('users/:userId/weekly-activity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna atividade semanal do usuário',
    description:
      'Retorna atividade dos últimos 7 dias agrupada por dia, incluindo check-ins, treinos e exercícios',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Atividade semanal retornada com sucesso',
    type: WeeklyActivityResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getWeeklyActivity(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: WeeklyActivityResponseDto;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const activity = await this.gamificationService.getWeeklyActivity(
      userId,
      unitId,
    );

    return {
      success: true,
      data: activity,
      error: null,
    };
  }

  @Get('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna os dados de gamificação do usuário',
    description:
      'Retorna dados completos incluindo pontos, nível, XP, conquistas e posição no ranking',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de gamificação retornados com sucesso',
    type: GamificationDataDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserData(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ): Promise<{
    success: boolean;
    data: GamificationDataDto;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const userData = await this.gamificationService.getUserData(
      userId,
      unitId,
      token,
    );

    return {
      success: true,
      data: userData,
      error: null,
    };
  }

  @Post('users/:userId/share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera uma imagem compartilhável do progresso do usuário',
    description:
      'Gera dados para compartilhamento incluindo URL da imagem, texto e estatísticas',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de compartilhamento gerados com sucesso',
    type: ShareResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async generateShare(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ): Promise<{
    success: boolean;
    data: ShareResponseDto;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const shareData = await this.gamificationService.generateShare(
      userId,
      unitId,
      token,
    );

    return {
      success: true,
      data: shareData,
      error: null,
    };
  }
}
