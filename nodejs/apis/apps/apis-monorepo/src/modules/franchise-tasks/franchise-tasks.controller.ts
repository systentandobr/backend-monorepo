import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { FranchiseTasksService } from './franchise-tasks.service';
import { CreateFranchiseTaskDto } from './dto/create-franchise-task.dto';
import { UpdateFranchiseTaskDto } from './dto/update-franchise-task.dto';
import { CompleteTaskStepDto } from './dto/complete-task-step.dto';

@Controller('franchise-tasks')
export class FranchiseTasksController {
  constructor(private readonly franchiseTasksService: FranchiseTasksService) {}

  @Post()
  create(@Body() createFranchiseTaskDto: CreateFranchiseTaskDto) {
    return this.franchiseTasksService.create(createFranchiseTaskDto);
  }

  @Post('initialize/:franchiseId')
  initializeDefaults(
    @Param('franchiseId') franchiseId: string,
    @Body('userId') userId: string,
  ) {
    return this.franchiseTasksService.initializeDefaults(franchiseId, userId);
  }

  @Get('franchise/:franchiseId')
  findAllByFranchise(@Param('franchiseId') franchiseId: string) {
    return this.franchiseTasksService.findAllByFranchise(franchiseId);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.franchiseTasksService.findAllByUser(userId);
  }

  @Get('franchise/:franchiseId/stats')
  getStats(@Param('franchiseId') franchiseId: string) {
    return this.franchiseTasksService.getStats(franchiseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.franchiseTasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFranchiseTaskDto: UpdateFranchiseTaskDto,
  ) {
    return this.franchiseTasksService.update(id, updateFranchiseTaskDto);
  }

  @Post(':id/complete-step')
  completeStep(
    @Param('id') id: string,
    @Body() completeTaskStepDto: CompleteTaskStepDto,
  ) {
    return this.franchiseTasksService.completeStep(id, completeTaskStepDto);
  }
}
