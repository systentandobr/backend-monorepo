import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrainingPlansService } from './training-plans.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('training-plans')
@Controller('training-plans')
@UnitScope()
export class TrainingPlansController {
  constructor(private readonly trainingPlansService: TrainingPlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTrainingPlanDto: CreateTrainingPlanDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.create(createTrainingPlanDto, unitId);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserShape,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.findAll({ studentId, status }, unitId);
  }

  @Get('templates')
  findTemplates(
    @CurrentUser() user: CurrentUserShape,
    @Query('gender') gender?: string,
  ) {
    const unitId = process.env.DEFAULT_UNIT_ID || '#BR#ALL#SYSTEM#0001';
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.findTemplates({ gender }, unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.findOne(id, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrainingPlanDto: UpdateTrainingPlanDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.update(id, updateTrainingPlanDto, unitId);
  }

  @Patch(':id/objectives')
  updateObjectives(
    @Param('id') id: string,
    @Body('objectives') objectives: string[],
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.updateObjectives(id, objectives, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.trainingPlansService.remove(id, unitId);
  }
}
