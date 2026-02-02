import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { Training, TrainingSchema } from './schemas/training.schema';
import {
  TrainingExecution,
  TrainingExecutionSchema,
} from './schemas/training-execution.schema';
import { TrainingExecutionsService } from './training-executions.service';
import { GamificationModule } from '../gamification/gamification.module';
import { TrainingPlansModule } from '../training-plans/training-plans.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: TrainingExecution.name, schema: TrainingExecutionSchema },
    ]),
    forwardRef(() => GamificationModule),
    forwardRef(() => TrainingPlansModule),
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService, TrainingExecutionsService],
  exports: [TrainingsService, TrainingExecutionsService],
})
export class TrainingsModule {}
