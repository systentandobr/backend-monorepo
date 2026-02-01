import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
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
import {
  CheckInHistoryResponseDto,
  CheckInDto,
} from './dto/check-in-response.dto';
import { CheckInRequestDto } from './dto/check-in-request.dto';
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

  @Get('students/:studentId/check-ins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna o histórico de check-ins do usuário',
    description:
      'Retorna check-ins ordenados por data (mais recente primeiro) com cálculo de streaks',
  })
  @ApiParam({
    name: 'studentId',
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
    @Param('studentId') studentId: string,
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
      studentId,
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

  @Post('students/:studentId/check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo check-in para o usuário',
    description:
      'Registra um check-in e adiciona pontos de gamificação. Verifica se já existe check-in hoje para evitar duplicatas.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID do usuário',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Check-in criado com sucesso',
    type: CheckInDto,
  })
  @ApiResponse({ status: 400, description: 'Check-in já realizado hoje' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async createCheckIn(
    @Param('studentId') studentId: string,
    @Body() body: CheckInRequestDto,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: CheckInDto;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    try {
      const checkIn = await this.gamificationService.createCheckIn(
        studentId,
        unitId,
        body.location,
      );

      return {
        success: true,
        data: checkIn,
        error: null,
      };
    } catch (error: any) {
      if (error.message === 'Check-in já realizado hoje') {
        throw new BadRequestException('Check-in já realizado hoje');
      }
      throw error;
    }
  }

  @Get('students/:studentId/weekly-activity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna atividade semanal do usuário',
    description:
      'Retorna atividade dos últimos 7 dias agrupada por dia, incluindo check-ins, treinos e exercícios',
  })
  @ApiParam({
    name: 'studentId',
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
    @Param('studentId') studentId: string,
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
      studentId,
      unitId,
    );

    return {
      success: true,
      data: activity,
      error: null,
    };
  }

  @Get('students/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna os dados de gamificação do usuário',
    description:
      'Retorna dados completos incluindo pontos, nível, XP, conquistas e posição no ranking',
  })
  @ApiParam({
    name: 'studentId',
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
    @Param('studentId') studentId: string,
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
      studentId,
      unitId,
      token,
    );

    return {
      success: true,
      data: userData,
      error: null,
    };
  }

  @Post('students/:studentId/share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera uma imagem compartilhável do progresso do usuário',
    description:
      'Gera dados para compartilhamento incluindo URL da imagem, texto e estatísticas',
  })
  @ApiParam({
    name: 'studentId',
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
    @Param('studentId') studentId: string,
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
      studentId,
      unitId,
      token,
    );

    return {
      success: true,
      data: shareData,
      error: null,
    };
  }

  @Get('teams/:teamId/metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna métricas de um time',
    description:
      'Retorna métricas agregadas do time (check-ins, treinos, pontos, etc.)',
  })
  @ApiParam({
    name: 'teamId',
    description: 'ID do time',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas retornadas com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Time não encontrado' })
  async getTeamMetrics(
    @Param('teamId') teamId: string,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: any;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const metrics = await this.gamificationService.getTeamMetrics(
      teamId,
      unitId,
    );

    return {
      success: true,
      data: metrics,
      error: null,
    };
  }

  @Get('teams/ranking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna ranking de times',
    description:
      'Retorna ranking de times ordenado por performance (check-ins, treinos, pontos)',
  })
  @ApiQuery({
    name: 'unitId',
    required: false,
    type: String,
    description: 'ID da unidade (usa unidade do usuário se não fornecido)',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking de times retornado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getTeamsRanking(
    @CurrentUser() user: CurrentUserShape,
    @Query('unitId') unitIdParam?: string,
  ): Promise<{
    success: boolean;
    data: any[];
    error: null;
  }> {
    const unitId = unitIdParam || user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const ranking = await this.gamificationService.getTeamsRanking(unitId);

    return {
      success: true,
      data: ranking,
      error: null,
    };
  }
}
