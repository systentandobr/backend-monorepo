import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import {
  GamificationProfile,
  GamificationProfileSchema,
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
export class GamificationModule {}
