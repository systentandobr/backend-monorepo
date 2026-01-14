import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { PointsService } from './points.service';
import { AchievementService } from './achievement.service';
import { HabitListener } from './listeners/habit.listener';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GamificationProfile.name, schema: GamificationProfileSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
      { name: PointTransaction.name, schema: PointTransactionSchema },
    ]),
  ],
  controllers: [GamificationController],
  providers: [
    GamificationService,
    PointsService,
    AchievementService,
    HabitListener,
  ],
  exports: [GamificationService, PointsService, AchievementService],
})
export class GamificationModule {}
