import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TaskTemplate,
  TaskTemplateDocument,
} from './schemas/task-template.schema';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';
import { UpdateTaskTemplateDto } from './dto/update-task-template.dto';

@Injectable()
export class TaskTemplatesService {
  constructor(
    @InjectModel(TaskTemplate.name)
    private taskTemplateModel: Model<TaskTemplateDocument>,
  ) {}

  async create(
    createTaskTemplateDto: CreateTaskTemplateDto,
  ): Promise<TaskTemplate> {
    const createdTemplate = new this.taskTemplateModel(createTaskTemplateDto);
    return createdTemplate.save();
  }

  async findAll(): Promise<TaskTemplate[]> {
    return this.taskTemplateModel.find().exec();
  }

  async findOne(id: string): Promise<TaskTemplate> {
    const template = await this.taskTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
    return template;
  }

  async findDefaults(): Promise<TaskTemplate[]> {
    return this.taskTemplateModel
      .find({ isDefault: true })
      .sort({ order: 1 })
      .exec();
  }

  async update(
    id: string,
    updateTaskTemplateDto: UpdateTaskTemplateDto,
  ): Promise<TaskTemplate> {
    const updatedTemplate = await this.taskTemplateModel
      .findByIdAndUpdate(id, updateTaskTemplateDto, { new: true })
      .exec();
    if (!updatedTemplate) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
    return updatedTemplate;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskTemplateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
  }
}
