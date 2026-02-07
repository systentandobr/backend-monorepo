import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { Exercise, ExerciseSchema } from './schemas/exercise.schema';
import { NanoBananaService } from '../../services/nano-banana.service';
import { Veo3Service } from '../../services/veo3.service';
import { S3Service } from '../../services/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
  ],
  controllers: [ExercisesController],
  providers: [ExercisesService, NanoBananaService, Veo3Service, S3Service],
  exports: [ExercisesService],
})
export class ExercisesModule { }
