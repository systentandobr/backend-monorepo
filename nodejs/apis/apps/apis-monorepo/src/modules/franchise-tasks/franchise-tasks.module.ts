import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FranchiseTasksService } from './franchise-tasks.service';
import { FranchiseTasksController } from './franchise-tasks.controller';
import {
  FranchiseTask,
  FranchiseTaskSchema,
} from './schemas/franchise-task.schema';
import { TaskTemplatesModule } from '../task-templates/task-templates.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FranchiseTask.name, schema: FranchiseTaskSchema },
    ]),
    TaskTemplatesModule,
  ],
  controllers: [FranchiseTasksController],
  providers: [FranchiseTasksService],
  exports: [FranchiseTasksService],
})
export class FranchiseTasksModule {}
