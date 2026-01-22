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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BioimpedanceService } from './bioimpedance.service';
import { CreateBioimpedanceDto } from './dto/create-bioimpedance.dto';
import { BioimpedanceResponseDto } from './dto/bioimpedance-response.dto';
import { ProgressQueryDto } from './dto/progress-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('bioimpedance')
@Controller('students/:studentId/bioimpedance')
@UseGuards(JwtAuthGuard)
@UnitScope()
export class BioimpedanceController {
  constructor(private readonly bioimpedanceService: BioimpedanceService) {}

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna o histórico de avaliações de bioimpedância',
    description:
      'Retorna todas as avaliações de bioimpedância do aluno, ordenadas da mais recente para a mais antiga',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID do aluno',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de avaliações retornado com sucesso',
    type: [BioimpedanceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async getHistory(
    @Param('studentId') studentId: string,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: { measurements: BioimpedanceResponseDto[] };
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const measurements = await this.bioimpedanceService.getHistory(
      studentId,
      unitId,
    );

    return {
      success: true,
      data: { measurements },
      error: null,
    };
  }

  @Get('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna dados de progresso para gráfico',
    description:
      'Retorna dados agrupados por mês para visualização em gráfico de evolução',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID do aluno',
    type: String,
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['6 meses', '1 ano', 'todo período'],
    description: 'Período de análise',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de progresso retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            period: { type: 'string' },
            title: { type: 'string' },
            weightData: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  value: { type: 'number' },
                },
              },
            },
            bodyFatData: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  value: { type: 'number' },
                },
              },
            },
          },
        },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async getProgress(
    @Param('studentId') studentId: string,
    @Query() query: ProgressQueryDto,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: {
      period: string;
      title: string;
      weightData: Array<{ month: string; value: number }>;
      bodyFatData: Array<{ month: string; value: number }>;
    };
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const period = query.period || '6 meses';
    const progress = await this.bioimpedanceService.getProgress(
      studentId,
      unitId,
      period,
    );

    return {
      success: true,
      data: progress,
      error: null,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria uma nova avaliação de bioimpedância',
    description:
      'Cria uma nova avaliação e atualiza automaticamente o isBestRecord',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID do aluno',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Avaliação criada com sucesso',
    type: BioimpedanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  async create(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateBioimpedanceDto,
    @CurrentUser() user: CurrentUserShape,
  ): Promise<{
    success: boolean;
    data: BioimpedanceResponseDto;
    error: null;
  }> {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const measurement = await this.bioimpedanceService.create(
      studentId,
      createDto,
      unitId,
    );

    return {
      success: true,
      data: measurement,
      error: null,
    };
  }
}
