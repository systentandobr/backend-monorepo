import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingPlansController } from './training-plans.controller';
import { TrainingPlansService } from './training-plans.service';
import { TrainingPlan, TrainingPlanSchema } from './schemas/training-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TrainingPlan.name, schema: TrainingPlanSchema }]),
  ],
  controllers: [TrainingPlansController],
  providers: [TrainingPlansService],
  exports: [TrainingPlansService],
})
export class TrainingPlansModule {}
