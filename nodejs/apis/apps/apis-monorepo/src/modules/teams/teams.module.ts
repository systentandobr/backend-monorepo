import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { Team, TeamSchema } from './schemas/team.schema';
import { StudentsModule } from '../students/students.module';
import { ExternalApisModule } from '../external-apis/external-apis.module';
import { TrainingPlansModule } from '../training-plans/training-plans.module';
import {
  PointTransaction,
  PointTransactionSchema,
} from '../gamification/schemas/point-transaction.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: PointTransaction.name, schema: PointTransactionSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    StudentsModule,
    ExternalApisModule,
    TrainingPlansModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
