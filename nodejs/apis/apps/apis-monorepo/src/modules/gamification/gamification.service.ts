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
      profile = new this.gamificationProfileModel({
        userId,
        unitId,
        totalPoints: 0,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
      });
      await profile.save();
    }

    return profile;
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
}
