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
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';

@ApiTags('exercises')
@Controller('exercises')
@UnitScope()
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createExerciseDto: CreateExerciseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado no contexto do usuário');
    }
    return this.exercisesService.create(createExerciseDto, unitId);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserShape,
    @Query('search') search?: string,
    @Query('muscleGroup') muscleGroup?: string,
    @Query('equipment') equipment?: string,
    @Query('difficulty') difficulty?: 'beginner' | 'intermediate' | 'advanced',
    @Query('targetGender') targetGender?: 'male' | 'female' | 'other',
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado no contexto do usuário');
    }
    return this.exercisesService.findAll(
      { search, muscleGroup, equipment, difficulty, targetGender },
      unitId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado no contexto do usuário');
    }
    return this.exercisesService.findOne(id, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado no contexto do usuário');
    }
    return this.exercisesService.update(id, updateExerciseDto, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado no contexto do usuário');
    }
    return this.exercisesService.remove(id, unitId);
  }
}
