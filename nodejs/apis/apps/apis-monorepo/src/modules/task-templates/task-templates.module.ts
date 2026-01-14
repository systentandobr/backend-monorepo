import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskTemplatesService } from './task-templates.service';
import { TaskTemplatesController } from './task-templates.controller';
import {
  TaskTemplate,
  TaskTemplateSchema,
} from './schemas/task-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskTemplate.name, schema: TaskTemplateSchema },
    ]),
  ],
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService],
  exports: [TaskTemplatesService],
})
export class TaskTemplatesModule {}
