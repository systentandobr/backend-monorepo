import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import {
  IntegratedRoutine,
  IntegratedRoutineSchema,
} from './schemas/integrated-routine.schema';
import {
  DailyRoutine,
  DailyRoutineSchema,
} from './schemas/daily-routine.schema';
import { Routine, RoutineSchema } from './schemas/routine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IntegratedRoutine.name, schema: IntegratedRoutineSchema },
      { name: DailyRoutine.name, schema: DailyRoutineSchema },
      { name: Routine.name, schema: RoutineSchema },
    ]),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
