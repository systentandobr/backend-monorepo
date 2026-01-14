import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { LifeTrackerController } from './life-tracker.controller';
import { LifeTrackerService } from './life-tracker.service';
import { JwtValidatorService } from './services/jwt-validator.service';

// Módulos de domínio
import { RoutinesModule } from './modules/routines/routines.module';
import { HabitsModule } from './modules/habits/habits.module';
import { HealthModule } from './modules/health/health.module';
import { FinancialModule } from './modules/financial/financial.module';
import { BusinessModule } from './modules/business/business.module';
import { ProductivityModule } from './modules/productivity/productivity.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { GamificationModule } from './modules/gamification/gamification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.env` }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${encodeURIComponent(
        process.env.USER_DB as string,
      )}:${encodeURIComponent(process.env.PASS_DB as string)}@${
        process.env.HOST_DB
      }/life-tracker`,
    ),

    // Módulos de domínio
    RoutinesModule,
    HabitsModule,
    HealthModule,
    FinancialModule,
    BusinessModule,
    ProductivityModule,
    AnalyticsModule,
    GamificationModule,
  ],
  controllers: [LifeTrackerController],
  providers: [LifeTrackerService, JwtValidatorService],
  exports: [LifeTrackerService, JwtValidatorService],
})
export class LifeTrackerModule {}
