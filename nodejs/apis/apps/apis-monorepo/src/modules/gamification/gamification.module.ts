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
  ) { }

  async onModuleInit() {
    // Lista de coleções onde o índice pode existir (devido a mudanças históricas de nomes)
    const collectionsToCheck = [
      this.gamificationProfileModel.collection,
      // Tenta acessar a coleção pelo nome alternativo se for diferente
      this.gamificationProfileModel.db.collection('gamification_profiles'),
      this.gamificationProfileModel.db.collection('gamificationprofiles'),
    ];

    for (const collection of collectionsToCheck) {
      try {
        const indexes = await collection.indexes();

        // 1. Tenta encontrar pelo nome padrão do Mongoose para índice único em um campo 
        const oldIndexByName = indexes.find(idx => idx.name === 'userId_1');

        // 2. Tenta encontrar pelo formato da chave (apenas userId e único)
        const oldIndexByKeys = indexes.find(
          (idx: any) =>
            idx.key &&
            idx.key.userId === 1 &&
            Object.keys(idx.key).length === 1 &&
            idx.unique === true
        );

        const indexToRemove = oldIndexByName || oldIndexByKeys;

        if (indexToRemove && indexToRemove.name !== 'userId_1_unitId_1') {
          this.logger.warn(
            `Removendo índice legado "${indexToRemove.name}" na coleção "${collection.collectionName}" que impede múltiplos perfis por unidade.`,
          );
          await collection.dropIndex(indexToRemove.name);
          this.logger.log(`Índice "${indexToRemove.name}" removido com sucesso de "${collection.collectionName}".`);
        }
      } catch (error: any) {
        // Ignorar se a coleção não existir ou se o índice já tiver sido removido
        if (error.code !== 26 && error.code !== 27 && error.codeName !== 'NamespaceNotFound' && error.codeName !== 'IndexNotFound') {
          this.logger.debug(
            `Nota: Limpeza de índice em "${collection.collectionName}": ${error.message}`,
          );
        }
      }
    }
  }
}
