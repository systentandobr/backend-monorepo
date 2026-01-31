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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { GenerateExerciseImagesDto } from './dto/generate-images.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';
import { NanoBananaService } from '../../services/nano-banana.service';

@ApiTags('exercises')
@Controller('exercises')
@UnitScope()
export class ExercisesController {
  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly nanoBananaService: NanoBananaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createExerciseDto: CreateExerciseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
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
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.findAll(
      { search, muscleGroup, equipment, difficulty, targetGender },
      unitId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
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
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.update(id, updateExerciseDto, unitId);
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
    return this.exercisesService.remove(id, unitId);
  }

  @Post('generate-images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera imagens para um exercício usando IA' })
  @ApiResponse({
    status: 200,
    description: 'Imagens geradas com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            images: {
              type: 'array',
              items: { type: 'string' },
              example: [
                '/uploads/exercises/temp-123/image-0-abc123.png',
                '/uploads/exercises/temp-123/image-1-def456.png',
                '/uploads/exercises/temp-123/image-2-ghi789.png',
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na validação ou geração de imagens',
  })
  async generateImages(
    @Body() generateImagesDto: GenerateExerciseImagesDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }

    // Validar dados mínimos
    if (!generateImagesDto.exerciseName || !generateImagesDto.muscleGroups || generateImagesDto.muscleGroups.length === 0) {
      throw new BadRequestException(
        'Nome do exercício e pelo menos um grupo muscular são obrigatórios',
      );
    }

    try {
      const images = await this.exercisesService.generateExerciseImages(
        generateImagesDto.exerciseName,
        generateImagesDto.description,
        generateImagesDto.muscleGroups,
        generateImagesDto.equipment,
        generateImagesDto.targetGender || 'male',
        this.nanoBananaService,
      );

      return {
        success: true,
        data: { images },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Erro ao gerar imagens: ${error.message}`,
      );
    }
  }
}
