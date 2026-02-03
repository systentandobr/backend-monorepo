import { Module, forwardRef, OnModuleInit, Logger } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import {
  GamificationProfile,
  GamificationProfileSchema,
  GamificationProfileDocument,
} from './schemas/gamification-profile.schema';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import {
  UserAchievement,
  UserAchievementSchema,
} from './schemas/user-achievement.schema';
import {
  PointTransaction,
  PointTransactionSchema,
} from './schemas/point-transaction.schema';
import { UsersModule } from '../users/users.module';
import { FranchisesModule } from '../franchises/franchises.module';
import { TrainingPlansModule } from '../training-plans/training-plans.module';
import { TrainingsModule } from '../trainings/trainings.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: GamificationProfile.name, schema: GamificationProfileSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
      { name: PointTransaction.name, schema: PointTransactionSchema },
    ]),
    UsersModule,
    FranchisesModule,
    TrainingPlansModule,
    forwardRef(() => TrainingsModule),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule implements OnModuleInit {
  private readonly logger = new Logger(GamificationModule.name);

  constructor(
    @InjectModel(GamificationProfile.name)
    private gamificationProfileModel: Model<GamificationProfileDocument>,
  ) {}

  async onModuleInit() {
    // Remover índice antigo userId_1 se existir
    try {
      const collection = this.gamificationProfileModel.collection;
      const indexes = await collection.indexes();
      
      // Verificar se existe índice userId_1 (sem unitId) e único
      const oldIndex = indexes.find(
        (idx: any) => 
          idx.key && 
          idx.key.userId === 1 && 
          !idx.key.unitId &&
          idx.unique === true
      );
      
      if (oldIndex) {
        this.logger.warn(
          `Removendo índice antigo ${oldIndex.name} que causa conflito com índice composto userId_1_unitId_1`,
        );
        await collection.dropIndex(oldIndex.name);
        this.logger.log('Índice antigo removido com sucesso');
      }
    } catch (error: any) {
      // Ignorar erros ao tentar remover índice (pode não existir ou já ter sido removido)
      if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
        this.logger.warn(
          `Erro ao tentar remover índice antigo: ${error.message}`,
        );
      }
    }
  }
}
