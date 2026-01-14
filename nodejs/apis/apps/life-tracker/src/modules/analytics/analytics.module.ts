import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsData,
  AnalyticsDataSchema,
} from './schemas/analytics-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsData.name, schema: AnalyticsDataSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
