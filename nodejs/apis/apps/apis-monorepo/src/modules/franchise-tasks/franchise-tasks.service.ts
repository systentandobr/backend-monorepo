import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FranchiseTask,
  FranchiseTaskDocument,
} from './schemas/franchise-task.schema';
import { CreateFranchiseTaskDto } from './dto/create-franchise-task.dto';
import { UpdateFranchiseTaskDto } from './dto/update-franchise-task.dto';
import { CompleteTaskStepDto } from './dto/complete-task-step.dto';
import { TaskTemplatesService } from '../task-templates/task-templates.service';

@Injectable()
export class FranchiseTasksService {
  constructor(
    @InjectModel(FranchiseTask.name)
    private franchiseTaskModel: Model<FranchiseTaskDocument>,
    private readonly taskTemplatesService: TaskTemplatesService,
  ) {}

  async create(
    createFranchiseTaskDto: CreateFranchiseTaskDto,
  ): Promise<FranchiseTask> {
    const createdTask = new this.franchiseTaskModel(createFranchiseTaskDto);
    return createdTask.save();
  }

  async findAllByFranchise(franchiseId: string): Promise<FranchiseTask[]> {
    return this.franchiseTaskModel
      .find({ franchiseId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findAllByUser(userId: string): Promise<FranchiseTask[]> {
    return this.franchiseTaskModel
      .find({ userId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<FranchiseTask> {
    const task = await this.franchiseTaskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException(`Franchise task with ID ${id} not found`);
    }
    return task;
  }

  async update(
    id: string,
    updateFranchiseTaskDto: UpdateFranchiseTaskDto,
  ): Promise<FranchiseTask> {
    const updatedTask = await this.franchiseTaskModel
      .findByIdAndUpdate(id, updateFranchiseTaskDto, { new: true })
      .exec();
    if (!updatedTask) {
      throw new NotFoundException(`Franchise task with ID ${id} not found`);
    }
    return updatedTask;
  }

  async completeStep(
    id: string,
    completeTaskStepDto: CompleteTaskStepDto,
  ): Promise<FranchiseTask> {
    const task = await this.findOne(id);

    // Check if step is already completed
    const existingStep = task.completedSteps.find(
      (s) => s.stepOrder === completeTaskStepDto.stepOrder,
    );
    if (existingStep) {
      return task; // Already completed
    }

    const completedStep = {
      stepOrder: completeTaskStepDto.stepOrder,
      completedAt: new Date(),
      data: completeTaskStepDto.data,
    };

    // Calculate progress (simplified logic - assuming we know total steps,
    // but total steps are in template. Ideally we should populate template or store total steps in task)
    // For now, let's just push the step.

    return this.franchiseTaskModel
      .findByIdAndUpdate(
        id,
        { $push: { completedSteps: completedStep } },
        { new: true },
      )
      .exec();
  }

  async initializeDefaults(
    franchiseId: string,
    userId: string,
  ): Promise<FranchiseTask[]> {
    const templates = await this.taskTemplatesService.findDefaults();
    const tasks: FranchiseTask[] = [];

    for (const template of templates) {
      const taskDto: CreateFranchiseTaskDto = {
        franchiseId,
        userId,
        templateId: template._id.toString(),
        name: template.name,
        description: template.description,
        category: template.category,
        status: 'pending',
        progress: 0,
      };

      const createdTask = await this.create(taskDto);
      tasks.push(createdTask);
    }

    return tasks;
  }

  async getStats(franchiseId: string) {
    const tasks = await this.findAllByFranchise(franchiseId);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;

    return {
      total,
      completed,
      inProgress,
      pending: total - completed - inProgress,
    };
  }
}
