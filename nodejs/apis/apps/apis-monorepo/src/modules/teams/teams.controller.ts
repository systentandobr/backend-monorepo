import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { SuggestTeamNameDto } from './dto/suggest-team-name.dto';
import { TeamResponseDto, TeamMetricsDto } from './dto/team-response.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('teams')
@Controller('teams')
@UnitScope()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo time',
    description: 'Cria um novo time e associa alunos fornecidos',
  })
  @ApiResponse({
    status: 201,
    description: 'Time criado com sucesso',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Time com este nome já existe nesta unidade',
  })
  create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    return this.teamsService.create(createTeamDto, unitId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os times da unidade',
    description: 'Retorna todos os times da unidade do usuário atual',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de times retornada com sucesso',
    type: [TeamResponseDto],
  })
  findAll(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.findAll(unitId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um time por ID',
    description: 'Retorna os detalhes de um time específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do time',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Time encontrado',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Time não encontrado',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.findOne(id, unitId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um time',
    description: 'Atualiza os dados de um time existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do time',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Time atualizado com sucesso',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Time não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.update(id, updateTeamDto, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um time',
    description: 'Remove um time e desassocia todos os alunos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do time',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Time removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Time não encontrado',
  })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.remove(id, unitId);
  }

  @Post(':id/students/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adiciona um aluno ao time',
    description: 'Adiciona um aluno específico a um time',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do time',
    type: String,
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID do aluno',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Aluno adicionado ao time com sucesso',
    type: TeamResponseDto,
  })
  addStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.addStudentToTeam(id, studentId, unitId);
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove um aluno do time',
    description: 'Remove um aluno específico de um time',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do time',
    type: String,
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID do aluno',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Aluno removido do time com sucesso',
    type: TeamResponseDto,
  })
  removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.removeStudentFromTeam(id, studentId, unitId);
  }

  @Post('suggest-name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sugere nomes de time via IA',
    description:
      'Sugere nomes criativos para um time baseado nos objetivos dos alunos',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugestões de nomes retornadas com sucesso',
    type: [String],
  })
  suggestName(
    @Body() dto: SuggestTeamNameDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.suggestTeamName(dto, unitId);
  }

  @Get(':id/metrics')
  @ApiOperation({
    summary: 'Retorna métricas do time',
    description:
      'Retorna métricas agregadas do time (check-ins, treinos, pontos, etc.)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do time',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas retornadas com sucesso',
    type: TeamMetricsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Time não encontrado',
  })
  getMetrics(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.teamsService.getTeamMetrics(id, unitId);
  }
}
