import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GamificationProfile,
  GamificationProfileDocument,
} from './schemas/gamification-profile.schema';
import {
  Achievement,
  AchievementDocument,
} from './schemas/achievement.schema';
import {
  UserAchievement,
  UserAchievementDocument,
} from './schemas/user-achievement.schema';
import {
  PointTransaction,
  PointTransactionDocument,
} from './schemas/point-transaction.schema';
import { RankingQueryDto } from './dto/ranking-query.dto';
import { WeeklyActivityResponseDto } from './dto/weekly-activity-response.dto';
import {
  GamificationDataDto,
  RankingPositionDto,
  AchievementDto,
} from './dto/gamification-response.dto';
import { ShareResponseDto, ShareStatsDto } from './dto/share-response.dto';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentConfig } from '../../config/environment.config';
import {
  CheckInLocationError,
  CheckInTrainingInProgressError,
  CheckInAlreadyDoneError,
} from './exceptions/check-in.exceptions';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);
  private readonly sysSegurancaUrl = EnvironmentConfig.sysSeguranca.url;

  constructor(
    @InjectModel(GamificationProfile.name)
    private gamificationProfileModel: Model<GamificationProfileDocument>,
    @InjectModel(Achievement.name)
    private achievementModel: Model<AchievementDocument>,
    @InjectModel(UserAchievement.name)
    private userAchievementModel: Model<UserAchievementDocument>,
    @InjectModel(PointTransaction.name)
    private pointTransactionModel: Model<PointTransactionDocument>,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Calcula o nível baseado em XP
   * Fórmula: level = floor(sqrt(xp / 100)) + 1
   * XP necessário para próximo nível: (level + 1)^2 * 100 - xp atual
   */
  private calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const xpToNextLevel = nextLevelXp - xp;
    return { level, xpToNextLevel };
  }

  /**
   * Busca ou cria perfil de gamificação
   */
  private async getOrCreateProfile(
    userId: string,
    unitId: string,
  ): Promise<GamificationProfileDocument> {
    let profile = await this.gamificationProfileModel
      .findOne({ userId, unitId })
      .exec();

    if (!profile) {
      try {
        profile = new this.gamificationProfileModel({
          userId,
          unitId,
          totalPoints: 0,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
        });
        await profile.save();
      } catch (error: any) {
        // Se der erro de duplicata (race condition), buscar novamente
        if (error.code === 11000) {
          this.logger.warn(
            `Perfil duplicado detectado para userId: ${userId}, unitId: ${unitId}. Tentando buscar novamente.`,
          );
          profile = await this.gamificationProfileModel
            .findOne({ userId, unitId })
            .exec();
          if (!profile) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    return profile;
  }

  /**
   * Calcula distância entre duas coordenadas usando fórmula de Haversine
   * @returns Distância em metros
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const earthRadius = 6371000; // Raio da Terra em metros
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  /**
   * Converte graus para radianos
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Valida se a localização do usuário está dentro do raio permitido da unidade
   * @param userLocation Localização do usuário
   * @param unitId ID da unidade
   * @param maxDistanceMeters Distância máxima permitida em metros (padrão: 200m)
   */
  private async validateLocation(
    userLocation: { lat: number; lng: number },
    unitId: string,
    maxDistanceMeters: number = 200,
  ): Promise<void> {
    // TODO: Buscar coordenadas da unidade de um serviço de unidades/franquias
    // Por enquanto, se não houver localização da unidade disponível,
    // vamos permitir o check-in (validação será feita no frontend)
    // Em produção, isso deve buscar de um serviço de unidades
    this.logger.warn(
      `Validação de localização não implementada completamente. UnitId: ${unitId}. Permitindo check-in.`,
    );
    // Se no futuro houver um serviço de unidades, buscar coordenadas aqui:
    // const unit = await this.unitsService.getUnitById(unitId);
    // if (!unit || !unit.location) {
    //   throw new CheckInLocationError();
    // }
    // const distance = this.calculateDistance(
    //   userLocation.lat,
    //   userLocation.lng,
    //   unit.location.lat,
    //   unit.location.lng,
    // );
    // if (distance > maxDistanceMeters) {
    //   throw new CheckInLocationError();
    // }
  }

  /**
   * Verifica se há treino em execução (exercícios não finalizados)
   * @param userId ID do usuário
   * @param unitId ID da unidade
   */
  private async hasTrainingInProgress(
    userId: string,
    unitId: string,
  ): Promise<boolean> {
    // TODO: Integrar com TrainingPlansService para verificar treinos ativos
    // Por enquanto, retornar false (não bloquear check-in)
    // Em produção, isso deve verificar se há um treino ativo com exercícios não finalizados
    this.logger.warn(
      `Verificação de treino em execução não implementada completamente. UserId: ${userId}, UnitId: ${unitId}. Permitindo check-in.`,
    );
    // Se no futuro houver integração com TrainingPlansService:
    // const activePlans = await this.trainingPlansService.findActivePlans(userId, unitId);
    // for (const plan of activePlans) {
    //   const hasIncompleteExercises = plan.weeklySchedule.some(day =>
    //     day.exercises.some(ex =>
    //       ex.executedSets?.some(set => !set.completed) || 
    //       !ex.executedSets || 
    //       ex.executedSets.length < ex.sets
    //     )
    //   );
    //   if (hasIncompleteExercises) {
    //     return true;
    //   }
    // }
    return false;
  }

  /**
   * Busca nome da unidade via SYS-SEGURANÇA ou retorna padrão
   */
  private async getUnitName(unitId: string, token: string): Promise<string> {
    try {
      // Tentar buscar informações da unidade
      // Por enquanto, retornar um nome padrão
      return `Unidade ${unitId}`;
    } catch (error) {
      this.logger.warn(`Erro ao buscar nome da unidade ${unitId}:`, error);
      return `Unidade ${unitId}`;
    }
  }

  /**
   * Busca nome do usuário via SYS-SEGURANÇA
   */
  private async getUserName(userId: string, token: string): Promise<string> {
    try {
      const user = await this.usersService.findUserById(userId, token);
      if (user) {
        return (
          `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
          user.username ||
          'Usuário'
        );
      }
      return 'Usuário';
    } catch (error) {
      this.logger.warn(`Erro ao buscar nome do usuário ${userId}:`, error);
      return 'Usuário';
    }
  }

  /**
   * Retorna o ranking de usuários por unidade
   */
  async getRanking(
    query: RankingQueryDto,
    token: string,
  ): Promise<RankingPositionDto[]> {
    const limit = query.limit || 50;

    // Buscar perfis ordenados por totalPoints descendente, depois por level descendente
    const profiles = await this.gamificationProfileModel
      .find({ unitId: query.unitId })
      .sort({ totalPoints: -1, level: -1 })
      .limit(limit)
      .exec();

    // Buscar nomes de usuários e unidade em paralelo
    const unitName = await this.getUnitName(query.unitId, token);
    const userNames = await Promise.all(
      profiles.map((profile) => this.getUserName(profile.userId, token)),
    );

    // Montar ranking com posições
    const ranking: RankingPositionDto[] = profiles.map((profile, index) => ({
      position: index + 1,
      totalPoints: profile.totalPoints,
      level: profile.level,
      unitId: profile.unitId,
      unitName,
      userId: profile.userId,
      userName: userNames[index],
    }));

    return ranking;
  }

  /**
   * Retorna dados completos de gamificação do usuário
   */
  async getUserData(
    userId: string,
    unitId: string,
    token: string,
  ): Promise<GamificationDataDto> {
    // Buscar perfil
    const profile = await this.getOrCreateProfile(userId, unitId);

    // Buscar conquistas do usuário
    const userAchievements = await this.userAchievementModel
      .find({ userId })
      .sort({ unlockedAt: -1 })
      .exec();

    // Buscar detalhes das conquistas
    const achievementIds = userAchievements.map((ua) => ua.achievementId);
    const achievements = await this.achievementModel
      .find({ achievementId: { $in: achievementIds } })
      .exec();

    // Mapear conquistas com dados de desbloqueio
    const achievementsMap = new Map(
      achievements.map((a) => [a.achievementId, a]),
    );

    const achievementsDto: AchievementDto[] = userAchievements.map((ua) => {
      const achievement = achievementsMap.get(ua.achievementId);
      return {
        id: achievement?.achievementId || ua.achievementId,
        name: achievement?.name || 'Conquista',
        description: achievement?.description || '',
        icon: achievement?.icon || 'star',
        rarity: achievement?.rarity || 'COMMON',
        unlockedAt: ua.unlockedAt?.toISOString(),
      };
    });

    // Buscar posição no ranking
    const ranking = await this.getRanking({ unitId, limit: 1000 }, token);
    const userRanking = ranking.find((r) => r.userId === userId);

    // Buscar nome do usuário
    const userName = await this.getUserName(userId, token);
    const unitName = await this.getUnitName(unitId, token);

    const rankingPosition: RankingPositionDto | undefined = userRanking
      ? {
          ...userRanking,
          userName,
          unitName,
        }
      : {
          position: ranking.length + 1,
          totalPoints: profile.totalPoints,
          level: profile.level,
          unitId: profile.unitId,
          unitName,
          userId: profile.userId,
          userName,
        };

    return {
      userId: profile.userId,
      totalPoints: profile.totalPoints,
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: profile.xpToNextLevel,
      achievements: achievementsDto,
      completedTasks: [], // TODO: Implementar quando houver sistema de tarefas
      ranking: rankingPosition,
    };
  }

  /**
   * Retorna histórico de check-ins do usuário
   */
  async getCheckInHistory(
    userId: string,
    unitId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
  ): Promise<{
    checkIns: Array<{
      id: string;
      studentId: string;
      date: string;
      points: number;
      unitId: string;
      metadata?: any;
    }>;
    total: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    // Construir query para check-ins
    const query: any = {
      userId,
      unitId,
      sourceType: 'CHECK_IN',
    };

    // Adicionar filtro de data se fornecido
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    // Buscar transações de check-in
    const transactions = await this.pointTransactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Buscar total sem limite
    const total = await this.pointTransactionModel.countDocuments(query).exec();

    // Converter para formato de resposta
    const checkIns = transactions.map((transaction) => ({
      id: transaction._id.toString(),
      studentId: transaction.userId, // userId do schema mapeia para studentId no DTO
      date: transaction.createdAt!.toISOString(),
      points: transaction.points,
      unitId: transaction.unitId,
      metadata: transaction.metadata,
    }));

    // Calcular streaks
    const allCheckIns = await this.pointTransactionModel
      .find({
        userId,
        unitId,
        sourceType: 'CHECK_IN',
      })
      .sort({ createdAt: -1 })
      .exec();

    const { currentStreak, longestStreak } = this.calculateStreaks(allCheckIns);

    return {
      checkIns,
      total,
      currentStreak,
      longestStreak,
    };
  }

  /**
   * Cria um novo check-in para o usuário
   */
  async createCheckIn(
    userId: string,
    unitId: string,
    location?: { lat: number; lng: number },
  ): Promise<{
    id: string;
    studentId: string;
    date: string;
    points: number;
    unitId: string;
    metadata?: any;
  }> {
    // Verificar se já existe check-in hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await this.pointTransactionModel
      .findOne({
        userId,
        unitId,
        sourceType: 'CHECK_IN',
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .exec();

    if (existingCheckIn) {
      throw new CheckInAlreadyDoneError();
    }

    // Validar localização se fornecida
    if (location) {
      await this.validateLocation(location, unitId);
    }

    // Verificar se há treino em execução
    const hasTraining = await this.hasTrainingInProgress(userId, unitId);
    if (hasTraining) {
      throw new CheckInTrainingInProgressError();
    }

    // Pontos por check-in (padrão: 10 pontos)
    const checkInPoints = 10;

    // Criar transação de pontos
    const transaction = new this.pointTransactionModel({
      userId,
      unitId,
      points: checkInPoints,
      sourceType: 'CHECK_IN' as const,
      sourceId: `check-in-${Date.now()}`,
      description: 'Check-in diário',
      metadata: location
        ? {
            location: {
              lat: location.lat,
              lng: location.lng,
            },
          }
        : undefined,
    });

    await transaction.save();

    // Atualizar perfil de gamificação
    const profile = await this.getOrCreateProfile(userId, unitId);
    profile.totalPoints += checkInPoints;
    profile.xp += checkInPoints;

    // Recalcular nível
    const { level, xpToNextLevel } = this.calculateLevel(profile.xp);
    profile.level = level;
    profile.xpToNextLevel = xpToNextLevel;

    await profile.save();

    // Retornar check-in criado no formato DTO
    return {
      id: transaction._id.toString(),
      studentId: transaction.userId,
      date: transaction.createdAt!.toISOString(),
      points: transaction.points,
      unitId: transaction.unitId,
      metadata: transaction.metadata,
    };
  }

  /**
   * Calcula streaks (sequências consecutivas) de check-ins
   */
  private calculateStreaks(
    checkIns: PointTransactionDocument[],
  ): { currentStreak: number; longestStreak: number } {
    if (checkIns.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Agrupar check-ins por dia
    const checkInsByDay = new Map<string, PointTransactionDocument[]>();
    checkIns.forEach((checkIn) => {
      const date = new Date(checkIn.createdAt!);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayKey = `${date.getFullYear()}-${month}-${day}`;
      if (!checkInsByDay.has(dayKey)) {
        checkInsByDay.set(dayKey, []);
      }
      checkInsByDay.get(dayKey)!.push(checkIn);
    });

    const sortedDays = Array.from(checkInsByDay.keys()).sort().reverse(); // Mais recente primeiro

    // Calcular streak atual (começando de hoje)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (const dayKey of sortedDays) {
      const [year, month, day] = dayKey.split('-').map(Number);
      const dayDate = new Date(year, month - 1, day);
      dayDate.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dayDate.getTime() < checkDate.getTime()) {
        // Se encontrou um dia anterior sem check-in, quebrar o streak
        break;
      }
    }

    // Calcular maior streak (verificar todas as sequências)
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    // Ordenar dias do mais antigo para o mais recente
    const sortedDaysAsc = Array.from(checkInsByDay.keys()).sort();

    for (const dayKey of sortedDaysAsc) {
      const [year, month, day] = dayKey.split('-').map(Number);
      const dayDate = new Date(year, month - 1, day);
      dayDate.setHours(0, 0, 0, 0);

      if (lastDate === null) {
        tempStreak = 1;
        lastDate = dayDate;
      } else {
        const diffDays = Math.floor(
          (dayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
          // Dia consecutivo
          tempStreak++;
        } else {
          // Quebra na sequência
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = dayDate;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * Retorna atividade semanal (últimos 7 dias)
   */
  async getWeeklyActivity(
    userId: string,
    unitId: string,
  ): Promise<WeeklyActivityResponseDto> {
    // Calcular período (últimos 7 dias)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    // Buscar todas as transações do período
    const transactions = await this.pointTransactionModel
      .find({
        userId,
        unitId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        sourceType: {
          $in: ['CHECK_IN', 'WORKOUT_COMPLETION', 'EXERCISE_COMPLETION'],
        },
      })
      .sort({ createdAt: 1 }) // Mais antiga primeiro
      .exec();

    // Mapear dias da semana
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    // Agrupar por dia
    const dailyMap = new Map<
      string,
      {
        date: string;
        dayOfWeek: string;
        checkIns: number;
        workoutsCompleted: number;
        exercisesCompleted: number;
        totalPoints: number;
        activities: Array<{
          type: 'CHECK_IN' | 'WORKOUT_COMPLETION' | 'EXERCISE_COMPLETION';
          time: string;
          points: number;
          description: string;
        }>;
      }
    >();

    // Inicializar todos os dias dos últimos 7 dias
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const dayOfWeek = dayNames[date.getDay()];

      dailyMap.set(dateKey, {
        date: dateKey,
        dayOfWeek,
        checkIns: 0,
        workoutsCompleted: 0,
        exercisesCompleted: 0,
        totalPoints: 0,
        activities: [],
      });
    }

    // Processar transações
    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt!);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = dailyMap.get(dateKey);

      if (dayData) {
        const time = date.toTimeString().substring(0, 5); // HH:mm

        switch (transaction.sourceType) {
          case 'CHECK_IN':
            dayData.checkIns++;
            break;
          case 'WORKOUT_COMPLETION':
            dayData.workoutsCompleted++;
            break;
          case 'EXERCISE_COMPLETION':
            dayData.exercisesCompleted++;
            break;
        }

        dayData.totalPoints += transaction.points;
        
        // Garantir que o tipo seja um dos valores permitidos
        const activityType: 'CHECK_IN' | 'WORKOUT_COMPLETION' | 'EXERCISE_COMPLETION' = 
          transaction.sourceType === 'CHECK_IN' || 
          transaction.sourceType === 'WORKOUT_COMPLETION' || 
          transaction.sourceType === 'EXERCISE_COMPLETION'
            ? transaction.sourceType
            : 'CHECK_IN'; // Fallback (não deveria acontecer devido ao filtro)
        
        dayData.activities.push({
          type: activityType,
          time,
          points: transaction.points,
          description: transaction.description,
        });
      }
    });

    // Ordenar atividades por horário dentro de cada dia
    dailyMap.forEach((dayData) => {
      dayData.activities.sort((a, b) => a.time.localeCompare(b.time));
    });

    // Converter para array ordenado (mais recente primeiro)
    // Garantir que o tipo está correto
    const dailyActivity: Array<{
      date: string;
      dayOfWeek: string;
      checkIns: number;
      workoutsCompleted: number;
      exercisesCompleted: number;
      totalPoints: number;
      activities: Array<{
        type: 'CHECK_IN' | 'WORKOUT_COMPLETION' | 'EXERCISE_COMPLETION';
        time: string;
        points: number;
        description: string;
      }>;
    }> = Array.from(dailyMap.values()).reverse();

    // Calcular resumo
    const summary = {
      totalCheckIns: dailyActivity.reduce((sum, day) => sum + day.checkIns, 0),
      totalWorkouts: dailyActivity.reduce(
        (sum, day) => sum + day.workoutsCompleted,
        0,
      ),
      totalExercises: dailyActivity.reduce(
        (sum, day) => sum + day.exercisesCompleted,
        0,
      ),
      totalPoints: dailyActivity.reduce((sum, day) => sum + day.totalPoints, 0),
      averagePointsPerDay:
        dailyActivity.length > 0
          ? Math.round(
              (dailyActivity.reduce((sum, day) => sum + day.totalPoints, 0) /
                dailyActivity.length) *
                10,
            ) / 10
          : 0,
    };

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      dailyActivity,
      summary,
    };
  }

  /**
   * Gera dados para compartilhamento de progresso
   */
  async generateShare(
    userId: string,
    unitId: string,
    token: string,
  ): Promise<ShareResponseDto> {
    const userData = await this.getUserData(userId, unitId, token);

    // Buscar estatísticas adicionais (check-ins, treinos, exercícios)
    // Por enquanto, usar valores mockados ou calcular a partir de transações
    const transactions = await this.pointTransactionModel
      .find({ userId, unitId })
      .exec();

    const checkIns = transactions.filter(
      (t) => t.sourceType === 'CHECK_IN',
    ).length;
    const workouts = transactions.filter(
      (t) => t.sourceType === 'WORKOUT_COMPLETION',
    ).length;
    const exercises = transactions.filter(
      (t) => t.sourceType === 'EXERCISE_COMPLETION',
    ).length;

    // Calcular streak (simplificado - pode ser melhorado)
    const sortedTransactions = transactions
      .filter((t) => t.sourceType === 'CHECK_IN')
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());

    let currentStreak = 0;
    if (sortedTransactions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const transaction of sortedTransactions) {
        const transDate = new Date(transaction.createdAt!);
        transDate.setHours(0, 0, 0, 0);

        if (transDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (transDate.getTime() < checkDate.getTime()) {
          break;
        }
      }
    }

    const stats: ShareStatsDto = {
      totalCheckIns: checkIns,
      currentStreak,
      level: userData.level,
      totalPoints: userData.totalPoints,
      completedWorkouts: workouts,
      completedExercises: exercises,
    };

    // Gerar texto personalizado
    const text = `Estou no nível ${userData.level} com ${userData.totalPoints} pontos! 🚀`;

    // Por enquanto, retornar URL mockada
    // Em produção, isso geraria uma imagem real
    const imageUrl = `https://api.systentando.com/gamification/share/${userId}.png`;

    return {
      imageUrl,
      text,
      stats,
    };
  }

  /**
   * Retorna métricas de um time específico
   */
  async getTeamMetrics(
    teamId: string,
    unitId: string,
  ): Promise<any> {
    // Este método delega para o TeamsService
    // Importação circular seria necessária, então vamos implementar aqui
    // Por enquanto, retornar estrutura básica
    // Em produção, isso deveria usar TeamsService
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

  /**
   * Retorna ranking de times por unidade
   */
  async getTeamsRanking(unitId: string): Promise<any[]> {
    // Este método também deveria usar TeamsService
    // Por enquanto, retornar array vazio
    // Em produção, isso deveria calcular ranking baseado em métricas
    return [];
  }
}
