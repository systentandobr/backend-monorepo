import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import {
  TeamResponseDto,
  TeamMetricsDto,
} from './dto/team-response.dto';
import { SuggestTeamNameDto } from './dto/suggest-team-name.dto';
import { StudentsService } from '../students/students.service';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { ExternalApisService } from '../external-apis/external-apis.service';
import { GroqModel } from '../external-apis/dto/groq.dto';
import { TrainingPlansService } from '../training-plans/training-plans.service';
import { PointTransaction, PointTransactionDocument } from '../gamification/schemas/point-transaction.schema';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(PointTransaction.name)
    private pointTransactionModel: Model<PointTransactionDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private readonly studentsService: StudentsService,
    private readonly externalApisService: ExternalApisService,
    private readonly trainingPlansService: TrainingPlansService,
  ) {}

  async create(
    createTeamDto: CreateTeamDto,
    unitId: string,
  ): Promise<TeamResponseDto> {
    // Verificar se já existe time com mesmo nome na mesma unidade
    const existing = await this.teamModel.findOne({
      unitId,
      name: createTeamDto.name,
    });

    if (existing) {
      throw new ConflictException(
        'Time com este nome já existe nesta unidade',
      );
    }

    // Criar o time
    const team = new this.teamModel({
      ...createTeamDto,
      unitId,
      studentIds: createTeamDto.studentIds || [],
    });

    const saved = await team.save();

    // Atualizar teamId dos alunos se fornecido
    if (createTeamDto.studentIds && createTeamDto.studentIds.length > 0) {
      await this.updateStudentsTeam(
        createTeamDto.studentIds,
        saved._id.toString(),
        unitId,
      );
    }

    return this.toResponseDto(saved);
  }

  async findAll(unitId: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamModel
      .find({ unitId })
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(teams.map((team) => this.toResponseDto(team)));
  }

  async findOne(id: string, unitId: string): Promise<TeamResponseDto> {
    const team = await this.teamModel.findOne({ _id: id, unitId }).exec();
    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado`);
    }
    return this.toResponseDto(team);
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    unitId: string,
  ): Promise<TeamResponseDto> {
    const team = await this.teamModel
      .findOne({ _id: id, unitId })
      .exec();

    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado`);
    }

    // Verificar se está alterando o nome e se já existe outro time com esse nome
    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existing = await this.teamModel.findOne({
        unitId,
        name: updateTeamDto.name,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException(
          'Time com este nome já existe nesta unidade',
        );
      }
    }

    // Se studentIds foi fornecido, atualizar associações
    if (updateTeamDto.studentIds !== undefined) {
      // Remover teamId dos alunos que não estão mais no time
      const removedStudents = team.studentIds.filter(
        (sid) => !updateTeamDto.studentIds!.includes(sid),
      );
      if (removedStudents.length > 0) {
        await this.updateStudentsTeam(removedStudents, null, unitId);
      }

      // Adicionar teamId aos novos alunos
      const newStudents = updateTeamDto.studentIds.filter(
        (sid) => !team.studentIds.includes(sid),
      );
      if (newStudents.length > 0) {
        await this.updateStudentsTeam(newStudents, id, unitId);
      }
    }

    // Atualizar o time
    const updated = await this.teamModel
      .findOneAndUpdate(
        { _id: id, unitId },
        { $set: updateTeamDto },
        { new: true },
      )
      .exec();

    return this.toResponseDto(updated!);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const team = await this.teamModel.findOne({ _id: id, unitId }).exec();

    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado`);
    }

    // Remover teamId dos alunos antes de deletar o time
    if (team.studentIds.length > 0) {
      await this.updateStudentsTeam(team.studentIds, null, unitId);
    }

    await this.teamModel.deleteOne({ _id: id, unitId }).exec();
  }

  async addStudentToTeam(
    teamId: string,
    studentId: string,
    unitId: string,
  ): Promise<TeamResponseDto> {
    const team = await this.teamModel
      .findOne({ _id: teamId, unitId })
      .exec();

    if (!team) {
      throw new NotFoundException(`Time com ID ${teamId} não encontrado`);
    }

    if (team.studentIds.includes(studentId)) {
      return this.toResponseDto(team);
    }

    // Verificar se o aluno já está em outro time
    const studentDoc = await this.studentModel
      .findOne({ _id: studentId, unitId })
      .exec();
    if (!studentDoc) {
      throw new NotFoundException(`Aluno com ID ${studentId} não encontrado`);
    }
    if (studentDoc.teamId && studentDoc.teamId !== teamId) {
      throw new ConflictException(
        'Aluno já está em outro time. Remova-o do time atual primeiro.',
      );
    }

    // Adicionar aluno ao time
    team.studentIds.push(studentId);
    await team.save();

    // Atualizar teamId do aluno
    await this.updateStudentsTeam([studentId], teamId, unitId);

    return this.toResponseDto(team);
  }

  async removeStudentFromTeam(
    teamId: string,
    studentId: string,
    unitId: string,
  ): Promise<TeamResponseDto> {
    const team = await this.teamModel
      .findOne({ _id: teamId, unitId })
      .exec();

    if (!team) {
      throw new NotFoundException(`Time com ID ${teamId} não encontrado`);
    }

    team.studentIds = team.studentIds.filter((id) => id !== studentId);
    await team.save();

    // Remover teamId do aluno
    await this.updateStudentsTeam([studentId], null, unitId);

    return this.toResponseDto(team);
  }

  async suggestTeamName(
    dto: SuggestTeamNameDto,
    unitId: string,
  ): Promise<string[]> {
    let objectives: string[] = [];

    // Se studentIds foram fornecidos, buscar objetivos dos alunos
    if (dto.studentIds && dto.studentIds.length > 0) {
      try {
        const students = await Promise.all(
          dto.studentIds.map((id) =>
            this.studentsService.findOne(id, unitId).catch(() => null),
          ),
        );

        // Buscar planos de treino dos alunos para extrair objetivos
        const trainingPlans = await Promise.all(
          students
            .filter((s) => s !== null)
            .map((student) =>
              this.trainingPlansService
                .findAll({ studentId: student!.id }, unitId)
                .catch(() => ({ data: [] })),
            ),
        );

        // Extrair objetivos únicos
        const allObjectives = new Set<string>();
        trainingPlans.forEach((result: any) => {
          if (result.data && Array.isArray(result.data)) {
            result.data.forEach((plan: any) => {
              if (plan.objectives && Array.isArray(plan.objectives)) {
                plan.objectives.forEach((obj: string) => allObjectives.add(obj));
              }
            });
          }
        });

        objectives = Array.from(allObjectives);
      } catch (error) {
        this.logger.warn('Erro ao buscar objetivos dos alunos:', error);
      }
    }

    // Usar objetivos fornecidos diretamente ou os encontrados
    const finalObjectives =
      dto.objectives && dto.objectives.length > 0
        ? dto.objectives
        : objectives;

    // Construir prompt para IA
    const objectivesText =
      finalObjectives.length > 0
        ? finalObjectives.join(', ')
        : 'treino geral e condicionamento físico';

    const prompt = `Sugira 3 nomes criativos e motivacionais para um time de academia baseado nos seguintes objetivos de treino: ${objectivesText}. Os nomes devem ser curtos (máximo 3 palavras), motivacionais e relacionados ao contexto de academia/fitness. Retorne apenas os 3 nomes, um por linha, sem numeração ou marcadores.`;

    try {
      const response = await this.externalApisService.groqChatCompletion({
        prompt,
        systemPrompt:
          'Você é um especialista em criar nomes motivacionais para times de academia. Seja criativo e inspirador.',
        model: GroqModel.LLAMA_3_1_8B,
        maxTokens: 100,
      });

      // Extrair nomes das linhas
      const names = response.content
        .split('\n')
        .map((line) => line.trim().replace(/^[-•*0-9.)]\s*/, ''))
        .filter((name) => name.length > 0 && name.length <= 50)
        .slice(0, 3);

      return names.length > 0 ? names : ['Time Focado', 'Time Determinado', 'Time Vencedor'];
    } catch (error) {
      this.logger.error('Erro ao sugerir nome de time via IA:', error);
      // Retornar sugestões padrão em caso de erro
      return ['Time Focado', 'Time Determinado', 'Time Vencedor'];
    }
  }

  async getTeamMetrics(
    teamId: string,
    unitId: string,
  ): Promise<TeamMetricsDto> {
    const team = await this.teamModel.findOne({ _id: teamId, unitId }).exec();

    if (!team) {
      throw new NotFoundException(`Time com ID ${teamId} não encontrado`);
    }

    if (team.studentIds.length === 0) {
      return {
        totalStudents: 0,
        totalCheckIns: 0,
        completedTrainings: 0,
        plannedTrainings: 0,
        completionRate: 0,
        averagePoints: 0,
        currentStreak: 0,
      };
    }

    // Buscar check-ins dos alunos do time
    const checkIns = await this.pointTransactionModel
      .find({
        unitId,
        userId: { $in: team.studentIds },
        sourceType: 'CHECK_IN',
      })
      .exec();

    const totalCheckIns = checkIns.length;

    // Buscar treinos planejados e executados para cada aluno
    const allTrainingPlans = await Promise.all(
      team.studentIds.map((studentId) =>
        this.trainingPlansService
          .findAll({ studentId }, unitId)
          .catch(() => ({ data: [] })),
      ),
    );

    let plannedTrainings = 0;
    let completedTrainings = 0;

    allTrainingPlans.forEach((result: any) => {
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((plan: any) => {
          if (plan.exercises && Array.isArray(plan.exercises)) {
            plannedTrainings += plan.exercises.length;
            plan.exercises.forEach((exercise: any) => {
              if (
                exercise.executedSets &&
                Array.isArray(exercise.executedSets) &&
                exercise.executedSets.length > 0
              ) {
                completedTrainings++;
              }
            });
          }
        });
      }
    });

    const completionRate =
      plannedTrainings > 0 ? (completedTrainings / plannedTrainings) * 100 : 0;

    // Calcular pontos médios
    const allTransactions = await this.pointTransactionModel
      .find({
        unitId,
        userId: { $in: team.studentIds },
      })
      .exec();

    const totalPoints = allTransactions.reduce(
      (sum, t) => sum + (t.points || 0),
      0,
    );
    const averagePoints =
      team.studentIds.length > 0 ? totalPoints / team.studentIds.length : 0;

    // Calcular streak atual (maior streak entre os alunos)
    let currentStreak = 0;
    for (const studentId of team.studentIds) {
      const studentCheckIns = await this.pointTransactionModel
        .find({
          unitId,
          userId: studentId,
          sourceType: 'CHECK_IN',
        })
        .sort({ createdAt: -1 })
        .exec();

      if (studentCheckIns.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);

        for (const checkIn of studentCheckIns) {
          const checkInDate = new Date(checkIn.createdAt!);
          checkInDate.setHours(0, 0, 0, 0);

          if (checkInDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (checkInDate.getTime() < checkDate.getTime()) {
            break;
          }
        }

        currentStreak = Math.max(currentStreak, streak);
      }
    }

    return {
      totalStudents: team.studentIds.length,
      totalCheckIns,
      completedTrainings,
      plannedTrainings,
      completionRate: Math.round(completionRate * 10) / 10,
      averagePoints: Math.round(averagePoints * 10) / 10,
      currentStreak,
    };
  }

  /**
   * Atualiza o teamId dos alunos
   */
  private async updateStudentsTeam(
    studentIds: string[],
    teamId: string | null,
    unitId: string,
  ): Promise<void> {
    await this.studentModel
      .updateMany(
        { _id: { $in: studentIds }, unitId },
        { $set: { teamId: teamId || undefined } },
      )
      .exec();
  }

  /**
   * Converte TeamDocument para TeamResponseDto
   */
  private async toResponseDto(team: TeamDocument): Promise<TeamResponseDto> {
    const dto: TeamResponseDto = {
      id: team._id.toString(),
      unitId: team.unitId,
      name: team.name,
      description: team.description,
      studentIds: team.studentIds || [],
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };

    // Popular alunos se necessário (opcional, pode ser feito sob demanda)
    // if (populateStudents) {
    //   const students = await Promise.all(
    //     team.studentIds.map((id) =>
    //       this.studentsService.findOne(id, team.unitId).catch(() => null),
    //     ),
    //   );
    //   dto.students = students.filter((s) => s !== null) as StudentResponseDto[];
    // }

    return dto;
  }
}
