import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { TrainingExecutionsService } from './training-executions.service';
import { CreateTrainingExecutionDto } from './dto/create-training-execution.dto';
import {
  UpdateExerciseExecutionDto,
  CompleteTrainingExecutionDto,
} from './dto/update-training-execution.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@Controller('trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly trainingExecutionsService: TrainingExecutionsService,
  ) {}

  @Post()
  create(@Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingsService.create(createTrainingDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.trainingsService.findAll(query);
  }

  @Get('franchise/:franchiseId')
  findAllByFranchise(@Param('franchiseId') franchiseId: string) {
    return this.trainingsService.findAllByFranchise(franchiseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return this.trainingsService.update(id, updateTrainingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingsService.remove(id);
  }

  @Post(':id/view')
  incrementViewCount(@Param('id') id: string) {
    return this.trainingsService.incrementViewCount(id);
  }

  // ========== Training Executions (Execuções de Treino Físico) ==========

  @Post('executions')
  @UseGuards(JwtAuthGuard)
  createExecution(
    @Body() createDto: CreateTrainingExecutionDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userId = user.id;
    const unitId = user.unitId || user.profile?.unitId;

    if (!userId || !unitId) {
      throw new Error('userId ou unitId não encontrado no contexto do usuário');
    }

    return this.trainingExecutionsService.create({
      ...createDto,
      userId,
      unitId,
    });
  }

  @Get('executions/active')
  @UseGuards(JwtAuthGuard)
  getActiveExecution(@CurrentUser() user: CurrentUserShape) {
    const userId = user.id;
    const unitId = user.unitId || user.profile?.unitId;

    if (!userId || !unitId) {
      throw new Error('userId ou unitId não encontrado no contexto do usuário');
    }

    return this.trainingExecutionsService.getActive(userId, unitId);
  }

  @Get('executions/plan/:planId')
  @UseGuards(JwtAuthGuard)
  getExecutionsByPlan(
    @Param('planId') planId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userId = user.id;
    return this.trainingExecutionsService.getByPlan(planId, userId);
  }

  @Get('executions/:id')
  @UseGuards(JwtAuthGuard)
  getExecution(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userId = user.id;
    const unitId = user.unitId || user.profile?.unitId;

    if (!userId || !unitId) {
      throw new Error('userId ou unitId não encontrado no contexto do usuário');
    }

    return this.trainingExecutionsService.findOne(id, userId, unitId);
  }

  @Patch('executions/:id/exercises/:exerciseId')
  @UseGuards(JwtAuthGuard)
  updateExerciseExecution(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Body() updateDto: UpdateExerciseExecutionDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userId = user.id;
    const unitId = user.unitId || user.profile?.unitId;

    if (!userId || !unitId) {
      throw new Error('userId ou unitId não encontrado no contexto do usuário');
    }

    return this.trainingExecutionsService.updateExerciseExecution(
      id,
      exerciseId,
      updateDto,
      userId,
      unitId,
    );
  }

  @Patch('executions/:id/complete')
  @UseGuards(JwtAuthGuard)
  completeExecution(
    @Param('id') id: string,
    @Body() completeDto: CompleteTrainingExecutionDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userId = user.id;
    const unitId = user.unitId || user.profile?.unitId;

    if (!userId || !unitId) {
      throw new Error('userId ou unitId não encontrado no contexto do usuário');
    }

    return this.trainingExecutionsService.complete(id, completeDto, userId, unitId);
  }
}
